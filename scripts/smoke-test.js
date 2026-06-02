import fs from "node:fs/promises";

const baseUrl = process.env.BASE_URL || "http://localhost:7070";
const raw = await fs.readFile(new URL("../examples/adt-a01.hl7", import.meta.url), "utf8");

const submit = await fetch(`${baseUrl}/api/messages`, {
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
console.log(JSON.stringify(accepted, null, 2));

for (let attempt = 0; attempt < 20; attempt += 1) {
  await new Promise((resolve) => setTimeout(resolve, 250));
  const statusResponse = await fetch(`${baseUrl}${accepted.statusUrl}`);
  const status = await statusResponse.json();
  if (["COTS_ACKED", "FAILED", "COTS_FAILED", "FILTERED"].includes(status.state)) {
    console.log(JSON.stringify(status, null, 2));
    process.exit(status.state === "COTS_ACKED" ? 0 : 1);
  }
}

throw new Error("message did not reach terminal state in time");
