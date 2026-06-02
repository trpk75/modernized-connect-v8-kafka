export const config = {
  port: Number(process.env.PORT || 7070),
  kafkaDisabled: String(process.env.KAFKA_DISABLED || "false").toLowerCase() === "true",
  kafka: {
    clientId: process.env.KAFKA_CLIENT_ID || "modernized-connect",
    brokers: (process.env.KAFKA_BROKERS || "localhost:9092").split(",")
  },
  v8: {
    timeoutMs: Number(process.env.V8_SCRIPT_TIMEOUT_MS || 750)
  },
  cots: {
    endpoint: process.env.COTS_ENDPOINT || "http://localhost:7070/mock-cots"
  },
  topics: {
    received: "connect.message.received",
    accepted: "connect.message.accepted",
    filtered: "connect.message.filtered",
    failed: "connect.message.failed",
    cotsOutbound: "connect.cots.outbound",
    cotsAck: "connect.cots.ack",
    deadletter: "connect.deadletter"
  }
};
