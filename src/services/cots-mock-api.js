import express from "express";
import { config } from "../config.js";

export async function startCotsMockApi() {
  const app = express();

  app.use(express.json({ limit: "2mb" }));

  app.get("/health", (_req, res) => {
    res.json({
      ok: true,
      service: "mock-cots-api",
      port: config.cots.mockPort
    });
  });

  app.post("/mock-cots", (req, res) => {
    res.json({
      accepted: true,
      vendorMessageId: `COTS-${Date.now()}`,
      received: req.body?.correlationId
    });
  });

  return new Promise((resolve) => {
    const server = app.listen(config.cots.mockPort, () => {
      resolve(server);
    });
  });
}
