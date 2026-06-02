import { config } from "../config.js";
import { getBroker } from "../broker/index.js";
import { statusStore } from "../status-store.js";
import { runV8Script } from "../v8/script-runner.js";
import { logger } from "../logger.js";

export async function startMessageWorker() {
  const broker = getBroker();

  await broker.subscribe(config.topics.received, "modernized-connect-message-workers", async (event) => {
    const message = event.value;
    const baseContext = {
      message,
      channelMap: {},
      sourceMap: {},
      connectorMap: {},
      helpers: {
        hasPatientId: Boolean(message.parsed?.patient?.id)
      }
    };

    try {
      await statusStore.upsert(message.correlationId, { state: "FILTERING" });
      const filterResult = await runV8Script(message.scripts.filter, baseContext);

      if (filterResult.result !== true) {
        await statusStore.upsert(message.correlationId, {
          state: "FILTERED",
          reason: "filter returned false"
        });
        await broker.publish(config.topics.filtered, message, message.correlationId);
        return;
      }

      await statusStore.upsert(message.correlationId, { state: "TRANSFORMING" });
      const transformResult = await runV8Script(message.scripts.transform, {
        ...baseContext,
        ...filterResult.maps
      });

      const accepted = {
        correlationId: message.correlationId,
        channelId: message.channelId,
        messageId: message.messageId,
        acceptedAt: new Date().toISOString(),
        payload: transformResult.result,
        maps: transformResult.maps,
        target: message.target,
        raw: message.raw
      };

      await statusStore.upsert(message.correlationId, {
        state: "ACCEPTED",
        patientId: accepted.payload?.patient?.id,
        eventType: accepted.payload?.eventType
      });
      await broker.publish(config.topics.accepted, accepted, message.correlationId);
      await broker.publish(config.topics.cotsOutbound, accepted, message.correlationId);
    } catch (error) {
      logger.error({ error, correlationId: message.correlationId }, "message processing failed");
      const failed = {
        correlationId: message.correlationId,
        channelId: message.channelId,
        messageId: message.messageId,
        error: error.message,
        failedAt: new Date().toISOString()
      };
      await statusStore.upsert(message.correlationId, {
        state: "FAILED",
        error: error.message
      });
      await broker.publish(config.topics.failed, failed, message.correlationId);
      await broker.publish(config.topics.deadletter, failed, message.correlationId);
    }
  });
}
