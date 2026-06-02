$env:KAFKA_DISABLED = "true"
$env:PORT = if ($env:PORT) { $env:PORT } else { "7070" }
npm run dev
