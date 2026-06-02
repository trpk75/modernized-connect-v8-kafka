// Representative legacy Rhino-style transform shape.
// This is documentation only; it is not executed by the modernized service.
var patientId = msg['PID']['PID.3']['PID.3.1'].toString();
var familyName = msg['PID']['PID.5']['PID.5.1'].toString();
var givenName = msg['PID']['PID.5']['PID.5.2'].toString();
channelMap.put('patientId', patientId);
tmp = {
  id: patientId,
  name: familyName + ', ' + givenName
};
