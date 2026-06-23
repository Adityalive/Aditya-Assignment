import { Router } from "express";
import { v4 as uuidv4 } from "uuid";

export default function chatRoutes(agent) {
  const router = Router();

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
