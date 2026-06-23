import { Mistral } from "@mistralai/mistralai";
import { checkPolicy, recordTokenUsage } from "./policyEngine.js";
import { Log } from "./models/Log.js";
import { Conversation } from "./models/Conversation.js";

const systemMsg = {
  role: "system",
  content:
    "You are a helpful AI assistant with access to tools. " +
    "CRITICAL: You MUST call the create_note tool whenever the user asks you to save, " +
    "create, or write down anything. Never just pretend to create a note — actually call create_note. " +
    "When the user asks about current events, news, or anything requiring up-to-date information, " +
    "ALWAYS use the appropriate web search tool provided to you. " +
    "Use your available tools to fulfill user requests. " +
    "Format your responses using markdown.",
};

export class Agent {
  constructor(mcpClient, io) {
    this.mistral = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });
    this.mcp = mcpClient;
    this.io = io;
  }

  async processMessage(conversationId, messages) {
    const tools = this.mcp.getToolSchemas();
    console.log(`[agent] Tools available: ${tools.map(t => t.function.name).join(", ")}`);

    let conv = await Conversation.findOne({ conversationId });
    if (!conv) {
      conv = await Conversation.create({
        conversationId,
        messages: [systemMsg],
      });
    }

    const userMsg = messages[messages.length - 1];
    conv.messages.push(userMsg);

    let conversation = [...conv.messages];

    while (true) {
      const response = await this.mistral.chat.complete({
        model: "mistral-small-latest",
        messages: conversation,
        tools: tools,
        toolChoice: "auto",
      });

      const choice = response.choices[0];
      const msg = choice.message;

      // ── Record token usage ─────────────────────────────────────
      const usage = response.usage;
      if (usage?.totalTokens) {
        await recordTokenUsage(conversationId, usage.totalTokens);
        // Emit live token update to dashboard
        this.io.to("admin").emit("budget:update", {
          conversationId,
          tokensUsed: usage.totalTokens,
          timestamp: new Date().toISOString(),
        });
      }

      if (!msg.toolCalls || msg.toolCalls.length === 0) {
        conv.messages.push(msg);
        await conv.save();
        return { role: "assistant", content: msg.content };
      }

      conversation.push(msg);

      for (const tc of msg.toolCalls) {
        const toolName = tc.function.name;
        let toolArgs = {};
        try {
          toolArgs =
            typeof tc.function.arguments === "string"
              ? JSON.parse(tc.function.arguments)
              : tc.function.arguments;
        } catch {
          toolArgs = {};
        }

        // Pass toolArgs and conversationId for full policy checking
        const policy = await checkPolicy(toolName, toolArgs, conversationId);

        if (policy.requiresApproval) {
          await Log.create({ conversationId, toolName, toolInput: toolArgs, status: "pending_approval", reason: policy.reason });
          this.io.to("admin").emit("log:new", { toolName, toolInput: toolArgs, status: "pending_approval", reason: policy.reason, conversationId, timestamp: new Date().toISOString() });
          conversation.push({ role: "tool", toolCallId: tc.id, content: "Tool call requires human approval. Waiting for admin." });
          continue;
        }

        if (!policy.allowed) {
          await Log.create({ conversationId, toolName, toolInput: toolArgs, status: "blocked", reason: policy.reason });
          this.io.to("admin").emit("log:new", { toolName, toolInput: toolArgs, status: "blocked", reason: policy.reason, conversationId, timestamp: new Date().toISOString() });
          conversation.push({ role: "tool", toolCallId: tc.id, content: `Error: ${policy.reason}. I cannot use this tool.` });
          continue;
        }

        this.io.to("admin").emit("log:new", { toolName, toolInput: toolArgs, status: "allowed", reason: policy.reason, conversationId, timestamp: new Date().toISOString() });

        const result = await this.mcp.callTool(toolName, toolArgs);

        await Log.create({ conversationId, toolName, toolInput: toolArgs, status: "allowed", reason: policy.reason, result });
        this.io.to("admin").emit("log:result", { toolName, result, conversationId, timestamp: new Date().toISOString() });

        const noteTools = ["create_note", "update_note", "delete_note"];
        if (noteTools.includes(toolName)) {
          this.io.to("admin").emit("notes:changed", { timestamp: new Date().toISOString() });
        }

        conversation.push({ role: "tool", toolCallId: tc.id, content: result });
      }
    }
  }
}
