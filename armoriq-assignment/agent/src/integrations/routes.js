import { Router } from "express";
import { Integration } from "./model.js";

export default function integrationRoutes(mcpClient) {
  const router = Router();

  // Get all integrations
  router.get("/", async (req, res) => {
    try {
      const integrations = await Integration.find().select("-apiKey").lean();
      res.json(integrations);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Save/Update integration
  router.post("/", async (req, res) => {
    try {
      const { provider, apiKey, isActive } = req.body;
      if (!provider || !apiKey) {
        return res.status(400).json({ error: "Provider and apiKey are required" });
      }

      const integration = await Integration.findOneAndUpdate(
        { provider },
        { apiKey, isActive: isActive !== undefined ? isActive : true },
        { upsert: true, new: true }
      );

      // Reconnect if it's Alpha Vantage
      if (provider === "alphavantage" && mcpClient) {
        try {
          await mcpClient.connectToAlphaVantage(apiKey);
        } catch (err) {
          console.error("Alpha Vantage connection error:", err);
          return res.status(500).json({ error: "Failed to connect to Alpha Vantage: " + err.message });
        }
      }

      const safeIntegration = { ...integration.toObject() };
      delete safeIntegration.apiKey;
      res.json(safeIntegration);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Delete integration
  router.delete("/:provider", async (req, res) => {
    try {
      await Integration.findOneAndDelete({ provider: req.params.provider });
      // We don't necessarily disconnect actively, but next restart it won't connect.
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
}
