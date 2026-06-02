import { config } from "../config.js";
import { KafkaBroker } from "./kafka-broker.js";
import { MemoryBroker } from "./memory-broker.js";

let broker;

export function getBroker() {
  if (!broker) {
    broker = config.kafkaDisabled ? new MemoryBroker() : new KafkaBroker(config.kafka, config.topics);
  }
  return broker;
}
