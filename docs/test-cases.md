# Test Cases

## Unit Test Cases

| ID | Area | Scenario | Expected Result |
|---|---|---|---|
| UT-001 | HL7 parser | Parse ADT A01 sample message | Patient, encounter, control id, and ADT flag are extracted |
| UT-002 | HL7 parser | Parse non-ADT message type | `isAdt` is false |
| UT-003 | V8 runner | Execute filter script | Boolean result is returned |
| UT-004 | V8 runner | Execute transform script with map mutation | Result and mutated maps are returned |
| UT-005 | V8 runner | Run infinite loop script | Timeout error is raised |
| UT-006 | Broker | Publish to in-memory topic | Subscriber receives topic, key, and payload |

## Integration Test Cases

| ID | Area | Scenario | Expected Result |
|---|---|---|---|
| IT-001 | Memory mode | Run in-process API, worker, COTS adapter | Sample message reaches `COTS_ACKED` |
| IT-002 | Kafka mode | Submit sample message to hosted API | Kafka-backed flow reaches `COTS_ACKED` |
| IT-003 | GUI | Click `Run Migration Check` | Browser shows `COTS_ACKED`, patient `123456`, event `PatientAdmitted` |
| IT-004 | COTS adapter | Mock COTS API unavailable | Message state becomes `COTS_FAILED` and dead-letter event is published |
| IT-005 | Filter | Submit non-ADT message | Message state becomes `FILTERED` |

## Manual Verification

1. Start Kafka:

   ```powershell
   .\scripts\start-kafka-background.ps1
   ```

2. Start the combined host:

   ```powershell
   .\scripts\start-combined-host.ps1
   ```

3. Open `http://127.0.0.1:7070`.
4. Click `Run Migration Check`.
5. Confirm final state is `COTS_ACKED`.
