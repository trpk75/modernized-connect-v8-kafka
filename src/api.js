import express from "express";
import { randomUUID } from "node:crypto";
import path from "node:path";
import { z } from "zod";
import { config } from "./config.js";
import { getBroker } from "./broker/index.js";
import { parseHl7 } from "./domain/hl7.js";
import { defaultFilterScript, defaultTransformScript } from "./domain/default-scripts.js";
import { statusStore } from "./status-store.js";

const messageRequest = z.object({
  channelId: z.string().default("adt-channel"),
  messageId: z.string().optional(),
  contentType: z.enum(["HL7"]).default("HL7"),
  raw: z.string().min(1),
  scripts: z.object({
    filter: z.string().optional(),
    transform: z.string().optional()
  }).optional(),
  target: z.object({
    system: z.string().default("mock-cots"),
    endpoint: z.string().optional()
  }).optional()
});

export async function startApi() {
  const app = express();
  const broker = getBroker();

  app.use(express.json({ limit: "2mb" }));
  app.use(express.static(path.resolve("public")));

  app.get("/health", (_req, res) => {
    res.json({
      ok: true,
      service: "modernized-connect-v8-kafka",
      kafkaDisabled: config.kafkaDisabled,
      runtime: "V8"
    });
  });

  app.get("/api/messages", async (req, res) => {
    const limit = Number(req.query.limit || 25);
    res.json(await statusStore.list(Number.isFinite(limit) ? limit : 25));
  });

  app.post("/api/messages", async (req, res, next) => {
    try {
      const input = messageRequest.parse(req.body);
      const correlationId = randomUUID();
      const message = {
        ...input,
        messageId: input.messageId || correlationId,
        correlationId,
        receivedAt: new Date().toISOString(),
        parsed: parseHl7(input.raw),
        scripts: {
          filter: input.scripts?.filter || defaultFilterScript,
          transform: input.scripts?.transform || defaultTransformScript
        },
        target: input.target || { system: "mock-cots" }
      };

      await statusStore.upsert(correlationId, {
        state: "RECEIVED",
        channelId: message.channelId,
        messageId: message.messageId
      });
      await broker.publish(config.topics.received, message, correlationId);

      res.status(202).json({
        correlationId,
        state: "RECEIVED",
        statusUrl: `/api/messages/${correlationId}`
      });
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/messages/:correlationId", async (req, res) => {
    const status = await statusStore.get(req.params.correlationId);
    if (!status) {
      res.status(404).json({ error: "message status not found" });
      return;
    }
    res.json(status);
  });

  app.use((error, _req, res, _next) => {
    const status = error instanceof z.ZodError ? 400 : 500;
    res.status(status).json({
      error: error.message,
      issues: error.issues
    });
  });

  return new Promise((resolve) => {
    const server = app.listen(config.port, () => {
      resolve(server);
    });
  });
}
