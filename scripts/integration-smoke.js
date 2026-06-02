import fs from "node:fs/promises";
import { startApi } from "../src/api.js";
import { startMessageWorker } from "../src/services/message-worker.js";
import { startCotsAdapter } from "../src/services/cots-adapter.js";
import { statusStore } from "../src/status-store.js";
import { getBroker } from "../src/broker/index.js";

await statusStore.init();
await getBroker().connect();
const server = await startApi();
await startMessageWorker();
await startCotsAdapter();

try {
  const raw = await fs.readFile(new URL("../examples/adt-a01.hl7", import.meta.url), "utf8");
  const submit = await fetch("http://127.0.0.1:7070/api/messages", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      channelId: "adt-demo",
      raw,
      target: { system: "mock-cots" }
    })
  });

  if (!submit.ok) {
    throw new Error(`submit failed: ${submit.status} ${await submit.text()}`);
  }

  const accepted = await submit.json();
  let terminal;

  for (let attempt = 0; attempt < 20; attempt += 1) {
    await new Promise((resolve) => setTimeout(resolve, 250));
    const statusResponse = await fetch(`http://127.0.0.1:7070${accepted.statusUrl}`);
    const status = await statusResponse.json();
    if (["COTS_ACKED", "FAILED", "COTS_FAILED", "FILTERED"].includes(status.state)) {
      terminal = status;
      break;
    }
  }

  if (!terminal) {
    throw new Error("message did not reach terminal state in time");
  }

  console.log(JSON.stringify({ accepted, terminal }, null, 2));
  process.exitCode = terminal.state === "COTS_ACKED" ? 0 : 1;
} finally {
  await new Promise((resolve) => server.close(resolve));
  await getBroker().disconnect();
}
