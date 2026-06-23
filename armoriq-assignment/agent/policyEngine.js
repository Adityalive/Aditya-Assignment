import { Rule } from "./models/Rule.js";

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

export async function checkPolicy(toolName) {
  const rules = await getActiveRules();
  const rule = rules.find(
    (r) => r.toolName === toolName || r.toolName === "*"
  );

  if (!rule) {
    return { allowed: true, reason: "No rule applies" };
  }

  switch (rule.ruleType) {
    case "block":
      return { allowed: false, requiresApproval: false, reason: `Blocked by policy: ${rule.toolName}` };
    case "require_approval":
      return { allowed: false, requiresApproval: true, reason: "Pending human approval" };
    case "allow":
    default:
      return { allowed: true, reason: "Allowed by policy" };
  }
}

export async function invalidateCache() {
  lastFetch = 0;
}
