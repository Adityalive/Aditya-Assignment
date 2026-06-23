import { Router } from "express";
import { Log } from "../models/Log.js";

export default function logRoutes() {
  const router = Router();

  router.get("/", async (req, res) => {
    try {
      const { conversationId } = req.query;
      const filter = conversationId ? { conversationId } : {};
      const logs = await Log.find(filter)
        .sort({ createdAt: -1 })
        .limit(100)
        .lean();
      res.json(logs);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
}
