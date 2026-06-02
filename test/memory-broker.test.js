import assert from "node:assert/strict";
import { test } from "node:test";
import { MemoryBroker } from "../src/broker/memory-broker.js";

test("MemoryBroker publishes messages to subscribers", async () => {
  const broker = new MemoryBroker();
  await broker.connect();

  const received = new Promise((resolve) => {
    broker.subscribe("test.topic", "test-group", resolve);
  });

  await broker.publish("test.topic", { hello: "world" }, "key-1");
  const event = await received;

  assert.equal(event.topic, "test.topic");
  assert.equal(event.key, "key-1");
  assert.deepEqual(event.value, { hello: "world" });
});
