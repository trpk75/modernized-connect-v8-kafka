export const defaultFilterScript = `
  return message.parsed.isAdt === true;
`;

export const defaultTransformScript = `
  const patient = message.parsed.patient;
  channelMap.patientId = patient.id;

  return {
    eventType: "PatientAdmitted",
    patient,
    encounter: message.parsed.encounter,
    source: {
      channelId: message.channelId,
      messageId: message.messageId,
      controlId: message.parsed.controlId
    },
    audit: {
      transformedBy: "modernized-connect-v8-kafka",
      runtime: "V8"
    }
  };
`;
