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
    endpoint: process.env.COTS_ENDPOINT || "http://127.0.0.1:7071/mock-cots",
    mockPort: Number(process.env.COTS_MOCK_PORT || 7071)
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
