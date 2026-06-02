function field(segment, index) {
  return segment?.[index] || "";
}

function component(value, index) {
  return (value || "").split("^")[index] || "";
}

export function parseHl7(raw) {
  const segments = raw
    .trim()
    .split(/\r?\n|\r/)
    .map((line) => line.split("|"));

  const byName = new Map(segments.map((segment) => [segment[0], segment]));
  const msh = byName.get("MSH");
  const pid = byName.get("PID");
  const pv1 = byName.get("PV1");

  const messageType = field(msh, 8);
  const patientName = field(pid, 5);

  return {
    messageType,
    isAdt: messageType.startsWith("ADT"),
    controlId: field(msh, 9),
    patient: {
      id: component(field(pid, 3), 0),
      familyName: component(patientName, 0),
      givenName: component(patientName, 1),
      birthDate: formatHl7Date(field(pid, 7)),
      sex: field(pid, 8)
    },
    encounter: {
      patientClass: field(pv1, 2),
      location: field(pv1, 3)
    },
    segments: Object.fromEntries(byName.entries())
  };
}

function formatHl7Date(value) {
  if (!/^\d{8}$/.test(value || "")) {
    return value || null;
  }

  return `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}`;
}
