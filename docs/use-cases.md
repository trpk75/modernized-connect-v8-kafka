# Modernization Scope

## Source Application Area

The source application has Rhino-based JavaScript execution in filter, transformer, connector, and response-transform paths. A full migration would be large because channel scripts can touch maps, message metadata, XML/E4X, Java packages, database utilities, destinations, and connector state.

This modernization intentionally picks a narrow slice:

1. message intake
2. filter execution
3. transform execution
4. async route to an external COTS adapter

## Use Case 1: ADT Filter

Accept HL7 messages whose `MSH-9` message type starts with `ADT`.

Modernized behavior:

- receive message over `POST /api/messages`
- produce `connect.message.received`
- execute migrated filter script in V8
- produce either `connect.message.accepted` or `connect.message.filtered`

## Use Case 2: Patient Transform

Convert selected HL7 fields into a FHIR-like event:

- `PID-3` patient identifier
- `PID-5` patient name
- `PID-7` date of birth
- `PID-8` sex
- `PV1-2` patient class

Modernized behavior:

- execute transform script in V8
- produce normalized payload
- retain original correlation and audit metadata

## Use Case 3: COTS Routing

Route transformed patient events asynchronously to an external COTS adapter.

Modernized behavior:

- worker publishes to `connect.cots.outbound`
- COTS adapter consumes independently
- failures publish to `connect.deadletter`
- ACKs publish to `connect.cots.ack`

## Explicitly Out Of Scope

- full Mirth channel import/export
- E4X compatibility
- Java package bridging such as `Packages.*`
- database connector replacement
- Administrator UI migration
- production authN/authZ

Those can be added incrementally after this slice proves the runtime, event contract, and COTS adapter model.
