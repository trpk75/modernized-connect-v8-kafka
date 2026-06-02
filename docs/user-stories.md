# User Stories

## US-001: Submit ADT Message For Async Processing

As an integration operator, I want to submit an HL7 ADT message through an API so that patient admission events can be processed asynchronously.

Acceptance criteria:

- API accepts a valid HL7 payload.
- API returns `202 Accepted` with a correlation id.
- Message is published to `connect.message.received`.
- GUI shows the submitted correlation id.

## US-002: Filter Messages Using V8

As a channel developer, I want migrated JavaScript filter logic to run on V8 so that legacy Rhino filter behavior can be modernized incrementally.

Acceptance criteria:

- ADT messages are accepted.
- Non-ADT messages are filtered.
- Filter failures publish to failed/dead-letter topics.
- Script execution has a timeout boundary.

## US-003: Transform Patient Admission Events

As a downstream system owner, I want ADT messages transformed into a normalized patient admission event so that COTS systems do not need HL7 parsing logic.

Acceptance criteria:

- Transformer extracts patient id, name, birth date, sex, patient class, and location.
- Output event type is `PatientAdmitted`.
- Correlation metadata is retained.

## US-004: Route To COTS Adapter

As an integration architect, I want transformed messages routed through a decoupled adapter so that external COTS software can be integrated without coupling it to the API.

Acceptance criteria:

- Accepted events publish to `connect.cots.outbound`.
- COTS adapter consumes independently.
- Successful vendor response publishes ACK status.
- COTS failures publish to dead-letter.

## US-005: Verify Migration In GUI

As a stakeholder, I want a browser-based verifier so that I can see the migrated flow complete without using command-line tools.

Acceptance criteria:

- GUI shows Kafka enabled/disabled status.
- GUI submits the sample ADT message.
- GUI shows lifecycle progress and final `COTS_ACKED` state.
- GUI shows recent verification runs.
