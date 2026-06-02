export default function transform({ message, channelMap }) {
  const patient = message.parsed.patient;
  channelMap.patientId = patient.id;

  return {
    eventType: "PatientAdmitted",
    patient,
    encounter: message.parsed.encounter,
    source: {
      channelId: message.channelId,
      messageId: message.messageId
    }
  };
}
