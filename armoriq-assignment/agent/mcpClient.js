import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export class MCPClient {
  constructor() {
    this.notesClient = null;
    this.exaClient = null;
    this.alphaClient = null;
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

  async connectToAlphaVantage(apiKey) {
    if (this.alphaClient) return;
    
    this.alphaClient = new Client(
      { name: "armoriq-agent-alpha", version: "1.0.0" },
      { capabilities: {} }
    );

    const transport = new StdioClientTransport({
      command: "uvx",
      args: ["--from", "marketdata-mcp-server", "marketdata-mcp", apiKey],
      stderr: "pipe",
    });

    transport.onerror = (err) => {
      console.error("[Alpha Vantage MCP error]", err);
    };

    await this.alphaClient.connect(transport);

    const result = await this.alphaClient.listTools();
    const serverTools = result.tools || [];
    
    // Check if tools exist to avoid duplication
    const existingToolNames = new Set(this.tools.map(t => t.name));
    const newTools = serverTools
      .filter(t => !existingToolNames.has(t.name))
      .map((t) => ({ ...t, serverId: "alphavantage" }));
      
    this.tools.push(...newTools);
    return newTools;
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
    if (tool.serverId === "alphavantage") client = this.alphaClient;
    
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
