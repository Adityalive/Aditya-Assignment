import { Router } from "express";
import { v4 as uuidv4 } from "uuid";
import { Conversation } from "./model.js";

export default function chatRoutes(agent) {
  const router = Router();

  router.get("/", async (req, res) => {
    try {
      // Return a list of all chat sessions, most recent first
      const convs = await Conversation.find()
        .select("conversationId title updatedAt")
        .sort({ updatedAt: -1 })
        .lean();
      res.json(convs);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.get("/:id", async (req, res) => {
    try {
      const conv = await Conversation.findOne({ conversationId: req.params.id }).lean();
      if (!conv) return res.status(404).json({ error: "Conversation not found" });
      res.json(conv);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.delete("/:id", async (req, res) => {
    try {
      await Conversation.findOneAndDelete({ conversationId: req.params.id });
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.post("/", async (req, res) => {
    try {
      const { message, conversationId } = req.body;
      if (!message) {
        return res.status(400).json({ error: "Message is required" });
      }

      const convId = conversationId || uuidv4();
      const messages = [{ role: "user", content: message }];

      const result = await agent.processMessage(convId, messages);
      res.json({ response: result.content, conversationId: convId });
    } catch (err) {
      console.error("Chat error:", err);
      res.status(500).json({ error: err.message });
    }
  });

  return router;
}
