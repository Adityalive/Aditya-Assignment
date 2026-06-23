import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { MCPClient } from "./mcpClient.js";
import { Agent } from "./agent.js";
import chatRoutes from "./routes/chat.js";
import ruleRoutes from "./routes/rules.js";
import logRoutes from "./routes/logs.js";

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

io.on("connection", (socket) => {
  socket.join("admin");
});

async function main() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("MongoDB connected");

  const mcpClient = new MCPClient();
  await mcpClient.connectToServer("../mcp-server/index.js");
  console.log("Notes MCP server connected");

  await mcpClient.connectToExa();
  console.log("Exa MCP server connected");

  const tools = mcpClient.getAllTools();
  console.log(`Discovered ${tools.length} tools:`);
  tools.forEach((t) => console.log(`  - ${t.name} (${t.serverId})`));

  const agent = new Agent(mcpClient, io);

  app.use("/api/chat", chatRoutes(agent));
  app.use("/api/rules", ruleRoutes());
  app.use("/api/logs", logRoutes());

  app.get("/api/tools", (req, res) => {
    res.json(mcpClient.getAllTools());
  });

  const PORT = process.env.AGENT_PORT || 8000;
  httpServer.listen(PORT, () => {
    console.log(`Agent server running on port ${PORT}`);
  });
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
