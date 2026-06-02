import assert from "node:assert/strict";
import { test } from "node:test";
import { parseHl7 } from "../src/domain/hl7.js";

const adtMessage = [
  "MSH|^~\\&|LAB|HOSP|COTS|VENDOR|20260602101500||ADT^A01|MSG00001|P|2.5",
  "PID|1||123456^^^HOSP^MR||Doe^Jane||19800115|F|||100 Main St^^Boston^MA^02101||555-0100",
  "PV1|1|I|ICU^101^1||||1234^House^Gregory"
].join("\n");

test("parseHl7 extracts the selected ADT migration fields", () => {
  const parsed = parseHl7(adtMessage);

  assert.equal(parsed.isAdt, true);
  assert.equal(parsed.messageType, "ADT^A01");
  assert.equal(parsed.controlId, "MSG00001");
  assert.deepEqual(parsed.patient, {
    id: "123456",
    familyName: "Doe",
    givenName: "Jane",
    birthDate: "1980-01-15",
    sex: "F"
  });
  assert.deepEqual(parsed.encounter, {
    patientClass: "I",
    location: "ICU^101^1"
  });
});

test("parseHl7 rejects non-ADT messages for the selected filter use case", () => {
  const parsed = parseHl7(adtMessage.replace("ADT^A01", "ORM^O01"));

  assert.equal(parsed.isAdt, false);
  assert.equal(parsed.messageType, "ORM^O01");
});
