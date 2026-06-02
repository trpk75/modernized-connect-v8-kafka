$ErrorActionPreference = "Stop"

Set-Location (Split-Path -Parent $PSScriptRoot)
$env:KAFKA_DISABLED = "false"
$env:PORT = if ($env:PORT) { $env:PORT } else { "7070" }
$env:KAFKAJS_NO_PARTITIONER_WARNING = "1"

cmd.exe /c "node src/index.js all > data\modernized-host.log 2>&1"
