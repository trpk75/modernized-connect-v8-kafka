$env:KAFKA_DISABLED = if ($env:KAFKA_DISABLED) { $env:KAFKA_DISABLED } else { "false" }
$env:PORT = if ($env:PORT) { $env:PORT } else { "7070" }
npm run dev
