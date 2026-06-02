import { config } from "../config.js";
import { getBroker } from "../broker/index.js";
import { statusStore } from "../status-store.js";
import { logger } from "../logger.js";

export async function startCotsAdapter() {
  const broker = getBroker();

  await broker.subscribe(config.topics.cotsOutbound, "modernized-connect-cots-adapters", async (event) => {
    const outbound = event.value;
    const endpoint = outbound.target?.endpoint || config.cots.endpoint;

    try {
      await statusStore.upsert(outbound.correlationId, {
        state: "COTS_DELIVERING",
        target: outbound.target?.system || "mock-cots"
      });

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(outbound)
      });

      if (!response.ok) {
        throw new Error(`COTS endpoint returned ${response.status}`);
      }

      const ack = {
        correlationId: outbound.correlationId,
        acknowledgedAt: new Date().toISOString(),
        target: outbound.target,
        response: await response.json()
      };
      await statusStore.upsert(outbound.correlationId, {
        state: "COTS_ACKED",
        cotsResponse: ack.response
      });
      await broker.publish(config.topics.cotsAck, ack, outbound.correlationId);
    } catch (error) {
      logger.error({ error, correlationId: outbound.correlationId }, "COTS delivery failed");
      const failed = {
        correlationId: outbound.correlationId,
        error: error.message,
        failedAt: new Date().toISOString(),
        target: outbound.target
      };
      await statusStore.upsert(outbound.correlationId, {
        state: "COTS_FAILED",
        error: error.message
      });
      await broker.publish(config.topics.deadletter, failed, outbound.correlationId);
    }
  });
}
