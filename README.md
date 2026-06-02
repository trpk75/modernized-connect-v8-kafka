# Modernized Connect V8 Kafka

This repository is a focused modernization slice for `nextgenhealthcare/connect`.
It does not try to rewrite Mirth Connect. It lifts a small, high-value Rhino-heavy use case into an event-driven API layer:

- receive a channel message over HTTP
- asynchronously filter it
- transform HL7 ADT content with V8-executed JavaScript
- route the result through Kafka to a decoupled COTS adapter service
- track status, retries, failures, and dead-letter events

## Selected Use Cases

1. **Source filter**: accept only HL7 ADT messages.
2. **Transformer**: convert selected HL7 PID/PV1 fields into a FHIR-like patient event.
3. **Destination route**: publish accepted transformed events to a COTS adapter topic for async delivery.

These map to the Rhino areas in NextGen Connect around JavaScript filter/transform/response-transform execution, while keeping the migration small enough to reason about.

## Run Locally

```powershell
npm install
npm run dev
```

By default this expects Kafka at `localhost:9092`. For a no-Kafka smoke test:

```powershell
$env:KAFKA_DISABLED='true'
npm run dev
```

In another terminal:

```powershell
npm run smoke
```

## API

Submit a channel message:

```http
POST http://localhost:7070/api/messages
```

Get status:

```http
GET http://localhost:7070/api/messages/{correlationId}
```

Health:

```http
GET http://localhost:7070/health
```

## Kafka Topics

- `connect.message.received`
- `connect.message.accepted`
- `connect.message.filtered`
- `connect.message.failed`
- `connect.cots.outbound`
- `connect.cots.ack`
- `connect.deadletter`

## Why V8

Node.js runs on the V8 JavaScript engine. Migrated channel scripts are executed in worker threads with a timeout and constrained inputs, replacing Rhino script execution with a modern JavaScript runtime while avoiding direct coupling to the original server internals.

## Repository Layout

- `src/api.js`: event-driven API layer.
- `src/services/message-worker.js`: filter/transform/route worker.
- `src/services/cots-adapter.js`: external COTS integration adapter.
- `src/v8/script-runner.js`: V8-backed execution boundary.
- `src/domain/hl7.js`: narrow HL7 parser for the selected ADT use case.
- `docs/architecture.md`: migration architecture.
- `docs/use-cases.md`: selected use cases and scope.
