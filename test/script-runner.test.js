import assert from "node:assert/strict";
import { test } from "node:test";
import { runV8Script } from "../src/v8/script-runner.js";

test("runV8Script executes migrated filter script in an isolated worker", async () => {
  const result = await runV8Script("return message.parsed.isAdt === true;", {
    message: { parsed: { isAdt: true } },
    channelMap: {},
    sourceMap: {},
    connectorMap: {}
  });

  assert.equal(result.result, true);
});

test("runV8Script returns mutated maps from migrated transform script", async () => {
  const result = await runV8Script(`
    channelMap.patientId = message.parsed.patient.id;
    return { patientId: channelMap.patientId };
  `, {
    message: { parsed: { patient: { id: "123456" } } },
    channelMap: {},
    sourceMap: {},
    connectorMap: {}
  });

  assert.equal(result.result.patientId, "123456");
  assert.equal(result.maps.channelMap.patientId, "123456");
});

test("runV8Script enforces timeout for runaway scripts", async () => {
  await assert.rejects(
    () => runV8Script("while (true) {}", {
      message: {},
      channelMap: {},
      sourceMap: {},
      connectorMap: {}
    }, 50),
    /exceeded 50ms timeout/
  );
});
