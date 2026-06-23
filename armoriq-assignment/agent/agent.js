import MistralClient from "@mistralai/mistralai";
import { checkPolicy } from "./policyEngine.js";
import { Log } from "./models/Log.js";

export class Agent {
  constructor(mcpClient, io) {
    this.mistral = new MistralClient(process.env.MISTRAL_API_KEY);
    this.mcp = mcpClient;
    this.io = io;
  }

  async processMessage(conversationId, messages) {
    const tools = this.mcp.getToolSchemas();
    const systemMsg = {
      role: "system",
      content:
        "You are a helpful AI assistant with access to tools. " +
        "You have notes management tools (create_note, read_note, update_note, delete_note, list_notes) " +
        "and web search tools (search). Use tools when appropriate. " +
        "For web searches, use the search tool. For notes, use the notes tools.",
    };

    let conversation = [systemMsg, ...messages];

    while (true) {
      const response = await this.mistral.chat({
        model: "mistral-large-latest",
        messages: conversation,
        tools: tools,
        tool_choice: "auto",
      });

      const choice = response.choices[0];
      const msg = choice.message;

      if (!msg.tool_calls || msg.tool_calls.length === 0) {
        return { role: "assistant", content: msg.content };
      }

      conversation.push(msg);

      for (const tc of msg.tool_calls) {
        const toolName = tc.function.name;
        let toolArgs = {};
        try {
          toolArgs = JSON.parse(tc.function.arguments);
        } catch {
          toolArgs = {};
        }

        const policy = await checkPolicy(toolName);

        if (policy.requiresApproval) {
          await Log.create({
            conversationId,
            toolName,
            toolInput: toolArgs,
            status: "pending_approval",
            reason: policy.reason,
          });
          this.io.to("admin").emit("log:new", {
            toolName,
            toolInput: toolArgs,
            status: "pending_approval",
            reason: policy.reason,
            conversationId,
            timestamp: new Date().toISOString(),
          });

          conversation.push({
            role: "tool",
            tool_call_id: tc.id,
            content: `Tool call requires human approval. Waiting for admin.`,
          });
          continue;
        }

        if (!policy.allowed) {
          await Log.create({
            conversationId,
            toolName,
            toolInput: toolArgs,
            status: "blocked",
            reason: policy.reason,
          });
          this.io.to("admin").emit("log:new", {
            toolName,
            toolInput: toolArgs,
            status: "blocked",
            reason: policy.reason,
            conversationId,
            timestamp: new Date().toISOString(),
          });

          conversation.push({
            role: "tool",
            tool_call_id: tc.id,
            content: `Error: ${policy.reason}. I cannot use this tool.`,
          });
          continue;
        }

        this.io.to("admin").emit("log:new", {
          toolName,
          toolInput: toolArgs,
          status: "allowed",
          reason: policy.reason,
          conversationId,
          timestamp: new Date().toISOString(),
        });

        const result = await this.mcp.callTool(toolName, toolArgs);

        await Log.create({
          conversationId,
          toolName,
          toolInput: toolArgs,
          status: "allowed",
          reason: policy.reason,
          result,
        });
        this.io.to("admin").emit("log:result", {
          toolName,
          result,
          conversationId,
          timestamp: new Date().toISOString(),
        });

        conversation.push({
          role: "tool",
          tool_call_id: tc.id,
          content: result,
        });
      }
    }
  }

  async executeApprovedTool(conversationId, toolName, toolInput) {
    const result = await this.mcp.callTool(toolName, toolInput);
    await Log.create({
      conversationId,
      toolName,
      toolInput,
      status: "allowed",
      reason: "Approved by admin",
      result,
    });
    return result;
  }
}
