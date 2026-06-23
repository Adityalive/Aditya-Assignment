import { Rule } from "./model.js";
import { Budget } from "../budget/model.js";
import { GlobalSettings } from "../budget/settings.js";

let cachedRules = [];
let lastFetch = 0;
const POLL_INTERVAL = 3000;

async function getActiveRules() {
  const now = Date.now();
  if (now - lastFetch > POLL_INTERVAL) {
    cachedRules = await Rule.find({ active: true }).lean();
    lastFetch = now;
  }
  return cachedRules;
}

async function getTokenBudget() {
  const setting = await GlobalSettings.findOne({ key: "token_budget_per_conversation" }).lean();
  return setting ? Number(setting.value) : null; // null = unlimited
}

/**
 * Check the policy engine for a given tool call.
 * @param {string} toolName
 * @param {object} toolArgs - the arguments being passed to the tool
 * @param {string} conversationId
 * @returns {{ allowed: boolean, requiresApproval: boolean, reason: string }}
 */
export async function checkPolicy(toolName, toolArgs = {}, conversationId = null) {
  // ── 1. Token budget check ───────────────────────────────────────
  if (conversationId) {
    const budget = await getTokenBudget();
    if (budget !== null) {
      const usage = await Budget.findOne({ conversationId }).lean();
      const used = usage?.tokensUsed ?? 0;
      if (used >= budget) {
        return {
          allowed: false,
          requiresApproval: false,
          reason: `Token budget exceeded: used ${used} / ${budget} tokens for this conversation.`,
        };
      }
    }
  }

  // ── 2. Rule-based policy check ──────────────────────────────────
  const rules = await getActiveRules();
  // Match specific rule first, then wildcard
  const rule =
    rules.find((r) => r.toolName === toolName) ||
    rules.find((r) => r.toolName === "*");

  if (!rule) {
    return { allowed: true, requiresApproval: false, reason: "No rule applies" };
  }

  // ── 3. Input validation (if rule has a pattern) ─────────────────
  if (rule.inputPattern && rule.inputPatternField) {
    const fieldValue = String(toolArgs[rule.inputPatternField] ?? "");
    let matches = false;
    try {
      const regex = new RegExp(rule.inputPattern);
      matches = regex.test(fieldValue);
    } catch {
      // Invalid regex — skip validation
      matches = true;
    }

    if (!matches) {
      const isApproval = rule.inputPatternAction === "require_approval";
      return {
        allowed: false,
        requiresApproval: isApproval,
        reason: `Input validation failed: '${rule.inputPatternField}' value "${fieldValue}" does not match required pattern "${rule.inputPattern}"`,
      };
    }
  }

  // ── 4. Standard rule type check ─────────────────────────────────
  switch (rule.ruleType) {
    case "block":
      return {
        allowed: false,
        requiresApproval: false,
        reason: `Blocked by policy: ${rule.toolName}`,
      };
    case "require_approval":
      return {
        allowed: false,
        requiresApproval: true,
        reason: "Pending human approval",
      };
    case "allow":
    default:
      return { allowed: true, requiresApproval: false, reason: "Allowed by policy" };
  }
}

/**
 * Record token usage for a conversation.
 * @param {string} conversationId
 * @param {number} tokensUsed
 */
export async function recordTokenUsage(conversationId, tokensUsed) {
  await Budget.findOneAndUpdate(
    { conversationId },
    { $inc: { tokensUsed, callCount: 1 } },
    { upsert: true, new: true }
  );
}

/**
 * Get current token usage for a conversation.
 */
export async function getUsage(conversationId) {
  const usage = await Budget.findOne({ conversationId }).lean();
  const budget = await getTokenBudget();
  return {
    tokensUsed: usage?.tokensUsed ?? 0,
    callCount: usage?.callCount ?? 0,
    budget,
  };
}

export async function invalidateCache() {
  lastFetch = 0;
}
