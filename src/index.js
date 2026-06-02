import { getBroker } from "./broker/index.js";
import { startApi } from "./api.js";
import { startMessageWorker } from "./services/message-worker.js";
import { startCotsAdapter } from "./services/cots-adapter.js";
import { statusStore } from "./status-store.js";
import { logger } from "./logger.js";

const mode = process.argv[2] || "all";

async function main() {
  await statusStore.init();
  await getBroker().connect();

  if (mode === "api" || mode === "all") {
    await startApi();
    logger.info("API listening");
  }

  if (mode === "worker" || mode === "all") {
    await startMessageWorker();
    logger.info("message worker running");
  }

  if (mode === "cots" || mode === "all") {
    await startCotsAdapter();
    logger.info("COTS adapter running");
  }
}

main().catch((error) => {
  logger.error(error, "service failed to start");
  process.exit(1);
});
