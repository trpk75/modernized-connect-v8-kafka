$ErrorActionPreference = "Stop"

$repo = Split-Path -Parent $PSScriptRoot
$command = "cmd.exe /c cd /d `"$repo`" && set KAFKA_DISABLED=false&& set PORT=7070&& set COTS_MOCK_PORT=7071&& set COTS_ENDPOINT=http://127.0.0.1:7071/mock-cots&& set KAFKAJS_NO_PARTITIONER_WARNING=1&& node src/index.js all ^> data\combined-host.log 2^>^&1"
$result = Invoke-CimMethod -ClassName Win32_Process -MethodName Create -Arguments @{
  CommandLine = $command
  CurrentDirectory = $repo
}

if ($result.ReturnValue -ne 0) {
  throw "Failed to start combined host. ReturnValue=$($result.ReturnValue)"
}

Write-Output "combined-host pid=$($result.ProcessId)"
