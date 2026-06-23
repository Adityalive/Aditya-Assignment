import { Router } from "express";
import { Budget } from "../models/Budget.js";
import { GlobalSettings } from "../models/GlobalSettings.js";

export default function budgetRoutes(io) {
  const router = Router();

  // GET /api/budget/settings — current global token cap
  router.get("/settings", async (req, res) => {
    try {
      const setting = await GlobalSettings.findOne({ key: "token_budget_per_conversation" }).lean();
      res.json({ budget: setting ? Number(setting.value) : null });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // POST /api/budget/settings — set global token cap
  router.post("/settings", async (req, res) => {
    try {
      const { budget } = req.body;
      const value = budget === null || budget === "" ? null : Number(budget);
      if (value !== null && (isNaN(value) || value < 0)) {
        return res.status(400).json({ error: "Budget must be a positive number or null" });
      }
      if (value === null) {
        await GlobalSettings.deleteOne({ key: "token_budget_per_conversation" });
      } else {
        await GlobalSettings.findOneAndUpdate(
          { key: "token_budget_per_conversation" },
          { key: "token_budget_per_conversation", value },
          { upsert: true, new: true }
        );
      }
      io.to("admin").emit("budget:settings_changed", { budget: value, timestamp: new Date().toISOString() });
      res.json({ success: true, budget: value });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // GET /api/budget/usage — all conversation usage
  router.get("/usage", async (req, res) => {
    try {
      const usages = await Budget.find().sort({ updatedAt: -1 }).lean();
      const setting = await GlobalSettings.findOne({ key: "token_budget_per_conversation" }).lean();
      const budgetCap = setting ? Number(setting.value) : null;
      res.json({ usages, budgetCap });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // GET /api/budget/usage/:conversationId
  router.get("/usage/:conversationId", async (req, res) => {
    try {
      const usage = await Budget.findOne({ conversationId: req.params.conversationId }).lean();
      const setting = await GlobalSettings.findOne({ key: "token_budget_per_conversation" }).lean();
      const budgetCap = setting ? Number(setting.value) : null;
      res.json({
        tokensUsed: usage?.tokensUsed ?? 0,
        callCount: usage?.callCount ?? 0,
        budgetCap,
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // DELETE /api/budget/usage/:conversationId — reset usage
  router.delete("/usage/:conversationId", async (req, res) => {
    try {
      await Budget.deleteOne({ conversationId: req.params.conversationId });
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
}
