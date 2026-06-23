import { Mistral } from "@mistralai/mistralai";
import { checkPolicy } from "./policyEngine.js";
import { Log } from "./models/Log.js";
import { Conversation } from "./models/Conversation.js";

const systemMsg = {
  role: "system",
  content:
    "You are a helpful AI assistant with access to tools. " +
    "When the user asks about current events, news, or anything that requires up-to-date information, " +
    "ALWAYS use the search_web tool instead of making up information. " +
    "You also have notes management tools (create_note, read_note, update_note, delete_note, list_notes). " +
    "Use these tools whenever the user asks to save or manage notes. " +
    "Format your responses using markdown: use **bold** for emphasis, " +
    "headings for sections, and bullet points or numbered lists for clarity.",
};

export class Agent {
  constructor(mcpClient, io) {
    this.mistral = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });
    this.mcp = mcpClient;
    this.io = io;
  }

  async processMessage(conversationId, messages) {
    const tools = this.mcp.getToolSchemas();

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

        const policy = await checkPolicy(toolName);

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

        conversation.push({ role: "tool", toolCallId: tc.id, content: result });
      }
    }
  }
}
