import express from "express";
import cors from "cors";
import morgan from "morgan";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { MCPClient } from "./mcpClient.js";
import { Agent } from "./agent.js";
import chatRoutes from "./src/chat/routes.js";
import ruleRoutes from "./src/rules/routes.js";
import logRoutes from "./src/logs/routes.js";
import noteRoutes from "./src/notes/routes.js";
import budgetRoutes from "./src/budget/routes.js";
import integrationRoutes from "./src/integrations/routes.js";
import { Integration } from "./src/integrations/model.js";

dotenv.config();

const app = express();
const httpServer = createServer(app);

const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.DASHBOARD_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

app.use(cors({ origin: process.env.DASHBOARD_URL || "http://localhost:5173" }));
app.use(express.json());
app.use(morgan("dev"));

io.on("connection", (socket) => {
  socket.join("admin");
});

async function main() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("MongoDB connected");

  const mcpClient = new MCPClient();
  await mcpClient.connectToServer("../mcp-server/index.js");
  console.log("Notes MCP server connected");

  try {
    await mcpClient.connectToExaServer();
    console.log("Exa MCP server connected");
  } catch (err) {
    console.error("Failed to connect to Exa MCP server:", err);
  }

  try {
    const alphaIntegration = await Integration.findOne({ provider: "alphavantage", isActive: true });
    if (alphaIntegration && alphaIntegration.apiKey) {
      await mcpClient.connectToAlphaVantage(alphaIntegration.apiKey);
      console.log("Alpha Vantage MCP server connected from DB");
    }
  } catch (err) {
    console.error("Failed to connect to Alpha Vantage MCP server on startup:", err);
  }

  const tools = mcpClient.getAllTools();
  console.log(`Discovered ${tools.length} tools:`);
  tools.forEach((t) => console.log(`  - ${t.name} (${t.serverId})`));

  const agent = new Agent(mcpClient, io);

  app.use("/api/chat", chatRoutes(agent));
  app.use("/api/rules", ruleRoutes(io));
  app.use("/api/logs", logRoutes());
  app.use("/api/notes", noteRoutes());
  app.use("/api/budget", budgetRoutes(io));
  app.use("/api/integrations", integrationRoutes(mcpClient));

  app.get("/api/tools", (req, res) => {
    res.json(mcpClient.getAllTools());
  });

  const PORT = Number(process.env.AGENT_PORT) || 8001;

  httpServer.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.error(
        `Port ${PORT} is already in use. Set AGENT_PORT to a free port, then update VITE_AGENT_URL to match.`
      );
      process.exit(1);
    }
    console.error("HTTP server error:", err);
    process.exit(1);
  });

  httpServer.listen(PORT, () => {
    console.log(`Agent server running on port ${PORT}`);
  });
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
