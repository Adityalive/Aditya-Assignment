import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export class MCPClient {
  constructor() {
    this.notesClient = null;
    this.exaClient = null;
    this.tools = [];
  }

  async connectToServer(serverScript) {
    this.notesClient = new Client(
      { name: "armoriq-agent-notes", version: "1.0.0" },
      { capabilities: {} }
    );

    const serverPath = path.resolve(__dirname, serverScript);

    const transport = new StdioClientTransport({
      command: "node",
      args: [serverPath],
      stderr: "pipe",
    });

    transport.onerror = (err) => {
      console.error("[Notes MCP stderr]", err);
    };

    await this.notesClient.connect(transport);

    const result = await this.notesClient.listTools();
    const serverTools = result.tools || [];
    this.tools.push(...serverTools.map((t) => ({ ...t, serverId: "notes" })));
    return serverTools;
  }

  async connectToExaServer() {
    this.exaClient = new Client(
      { name: "armoriq-agent-exa", version: "1.0.0" },
      { capabilities: {} }
    );

    const transport = new StdioClientTransport({
      command: process.platform === "win32" ? "npx.cmd" : "npx",
      args: ["-y", "exa-mcp-server"],
      env: { ...process.env }, // Needs EXA_API_KEY
      stderr: "pipe",
    });

    transport.onerror = (err) => {
      console.error("[Exa MCP stderr]", err);
    };

    await this.exaClient.connect(transport);

    const result = await this.exaClient.listTools();
    const serverTools = result.tools || [];
    this.tools.push(...serverTools.map((t) => ({ ...t, serverId: "exa" })));
    return serverTools;
  }

  getAllTools() {
    return this.tools;
  }

  getToolSchemas() {
    return this.tools.map((t) => ({
      type: "function",
      function: {
        name: t.name,
        description: t.description || "",
        parameters: t.inputSchema || { type: "object", properties: {} },
      },
    }));
  }

  async callTool(toolName, args) {
    const tool = this.tools.find(t => t.name === toolName);
    if (!tool) return `Error: Tool ${toolName} not found`;
    
    let client = null;
    if (tool.serverId === "notes") client = this.notesClient;
    if (tool.serverId === "exa") client = this.exaClient;
    
    if (!client) return `Error: Client for ${tool.serverId} not connected`;
    
    try {
      const result = await client.callTool({
        name: toolName,
        arguments: args,
      });
      const content = result.content || [];
      const textParts = content
        .filter((c) => c.type === "text")
        .map((c) => c.text);
      return textParts.join("\n") || JSON.stringify(result);
    } catch (err) {
      return `Error calling ${toolName}: ${err.message}`;
    }
  }

  async disconnect() {
    try { await this.notesClient?.close(); } catch {}
    try { await this.exaClient?.close(); } catch {}
  }
}
