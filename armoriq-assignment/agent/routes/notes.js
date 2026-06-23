import { Router } from "express";
import { Note } from "../models/Note.js";

export default function noteRoutes() {
  const router = Router();

  router.get("/", async (req, res) => {
    try {
      const count = await Note.countDocuments();
      console.log(`[notes] GET /api/notes — ${count} notes found`);
      const notes = await Note.find().sort({ createdAt: -1 }).lean();
      res.json(notes);
    } catch (err) {
      console.error("[notes] GET /api/notes error:", err.message);
      res.status(500).json({ error: err.message });
    }
  });

  router.post("/test", async (req, res) => {
    try {
      const note = await Note.create({ title: "Test Note", content: "Created at " + new Date().toISOString() });
      console.log("[notes] Test note created:", note._id);
      res.json(note);
    } catch (err) {
      console.error("[notes] Test create error:", err.message);
      res.status(500).json({ error: err.message });
    }
  });

  return router;
}
