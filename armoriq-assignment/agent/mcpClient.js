import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export class MCPClient {
  constructor() {
    this.client = new Client(
      { name: "armoriq-agent", version: "1.0.0" },
      { capabilities: {} }
    );
    this.transports = [];
    this.tools = [];
  }

  async connectToServer(serverScript) {
    const serverPath = path.resolve(__dirname, serverScript);
    const proc = spawn("node", [serverPath], {
      stdio: ["pipe", "pipe", "pipe"],
    });

    const transport = new StdioClientTransport({
      stdin: proc.stdin,
      stdout: proc.stdout,
      stderr: proc.stderr,
    });

    await this.client.connect(transport);
    this.transports.push(transport);

    const result = await this.client.request(
      { method: "tools/list" },
      { resultType: "object" }
    );

    const serverTools = result.tools || result.result?.tools || [];
    this.tools.push(...serverTools.map((t) => ({ ...t, serverId: "notes" })));
    return serverTools;
  }

  async connectToExa() {
    try {
      const { HttpClient } = await import("@modelcontextprotocol/sdk/client/http.js");
      const transport = new HttpClient("https://mcp.exa.ai");
      await this.client.connect(transport);
      this.transports.push(transport);

      const result = await this.client.request(
        { method: "tools/list" },
        { resultType: "object" }
      );

      const serverTools = result.tools || result.result?.tools || [];
      this.tools.push(...serverTools.map((t) => ({ ...t, serverId: "exa" })));
      return serverTools;
    } catch (err) {
      console.warn("Failed to connect to Exa MCP:", err.message);
      return [];
    }
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
    try {
      const result = await this.client.request(
        {
          method: "tools/call",
          params: { name: toolName, arguments: args },
        },
        { resultType: "object" }
      );
      const content = result.content || result.result?.content || [];
      const textParts = content
        .filter((c) => c.type === "text")
        .map((c) => c.text);
      return textParts.join("\n") || JSON.stringify(result);
    } catch (err) {
      return `Error calling ${toolName}: ${err.message}`;
    }
  }

  async disconnect() {
    for (const t of this.transports) {
      try { await t.close(); } catch {}
    }
  }
}
