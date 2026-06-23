import { Router } from "express";
import { Rule } from "../models/Rule.js";
import { invalidateCache } from "../policyEngine.js";

export default function ruleRoutes(io) {
  const router = Router();

  const notify = (event, data) => {
    io.to("admin").emit(event, { ...data, timestamp: new Date().toISOString() });
  };

  router.get("/", async (req, res) => {
    try {
      const rules = await Rule.find().sort({ createdAt: -1 }).lean();
      res.json(rules);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.post("/", async (req, res) => {
    try {
      const { toolName, ruleType, inputPattern, inputPatternField, inputPatternAction } = req.body;
      if (!toolName || !ruleType) {
        return res.status(400).json({ error: "toolName and ruleType are required" });
      }
      const rule = await Rule.findOneAndUpdate(
        { toolName },
        { toolName, ruleType, active: true, inputPattern: inputPattern || "", inputPatternField: inputPatternField || "", inputPatternAction: inputPatternAction || "block" },
        { upsert: true, new: true }
      );
      await invalidateCache();
      notify("rule:updated", { rule });
      res.json(rule);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.delete("/:id", async (req, res) => {
    try {
      const rule = await Rule.findByIdAndDelete(req.params.id);
      await invalidateCache();
      notify("rule:deleted", { id: req.params.id });
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.patch("/:id/toggle", async (req, res) => {
    try {
      const rule = await Rule.findById(req.params.id);
      if (!rule) return res.status(404).json({ error: "Rule not found" });
      rule.active = !rule.active;
      await rule.save();
      await invalidateCache();
      notify("rule:toggled", { rule });
      res.json(rule);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
}
