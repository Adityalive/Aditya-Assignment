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

  addBuiltinTools() {
    this.tools.push({
      name: "search_web",
      description: "Search the web for current information. Use this for any question about recent events, news, or live data.",
      inputSchema: {
        type: "object",
        properties: {
          query: { type: "string", description: "The search query" },
          numResults: { type: "number", description: "Number of results (default 5)" },
        },
        required: ["query"],
      },
      serverId: "builtin",
    });
  }

  async connectToServer(serverScript) {
    this.notesClient = new Client(
      { name: "armoriq-agent", version: "1.0.0" },
      { capabilities: {} }
    );

    const serverPath = path.resolve(__dirname, serverScript);

    const transport = new StdioClientTransport({
      command: "node",
      args: [serverPath],
      stderr: "pipe",
    });

    transport.onerror = (err) => {
      console.error("[MCP stderr]", err);
    };

    await this.notesClient.connect(transport);

    const result = await this.notesClient.listTools();
    const serverTools = result.tools || [];
    this.tools.push(...serverTools.map((t) => ({ ...t, serverId: "notes" })));
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
    if (toolName === "search_web") {
      return this.searchWeb(args.query, args.numResults || 5);
    }
    if (!this.notesClient) return "MCP server not connected";
    try {
      const result = await this.notesClient.callTool({
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

  async searchWeb(query, numResults = 5) {
    const apiKey = process.env.EXA_API_KEY;
    if (!apiKey) return "Error: EXA_API_KEY not configured";
    try {
      const res = await fetch("https://api.exa.ai/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
        },
        body: JSON.stringify({
          query,
          numResults,
          type: "web",
        }),
      });
      if (!res.ok) {
        const txt = await res.text();
        return `Search failed (${res.status}): ${txt}`;
      }
      const data = await res.json();
      const results = data.results || [];
      return results
        .map((r, i) => `${i + 1}. ${r.title}\n   ${r.url}\n   ${r.text?.slice(0, 300) || ""}`)
        .join("\n\n") || "No results found";
    } catch (err) {
      return `Search error: ${err.message}`;
    }
  }

  async disconnect() {
    try { await this.notesClient?.close(); } catch {}
    try { await this.exaClient?.close(); } catch {}
  }
}
