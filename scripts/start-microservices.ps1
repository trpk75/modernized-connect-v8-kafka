$ErrorActionPreference = "Stop"

$repo = Split-Path -Parent $PSScriptRoot
$pidDir = Join-Path $repo "data\pids"
New-Item -ItemType Directory -Force -Path $pidDir | Out-Null

function Start-ServiceProcess {
  param(
    [Parameter(Mandatory = $true)][string]$Name,
    [Parameter(Mandatory = $true)][string]$Mode,
    [hashtable]$Environment = @{}
  )

  $envParts = @(
    "set KAFKA_DISABLED=false",
    "set KAFKAJS_NO_PARTITIONER_WARNING=1"
  )

  foreach ($key in $Environment.Keys) {
    $envParts += "set $key=$($Environment[$key])"
  }

  $log = "data\$Name.log"
  $command = "cmd.exe /c cd /d `"$repo`" && $($envParts -join '&& ')&& node src/index.js $Mode ^> $log 2^>^&1"
  $result = Invoke-CimMethod -ClassName Win32_Process -MethodName Create -Arguments @{
    CommandLine = $command
    CurrentDirectory = $repo
  }

  if ($result.ReturnValue -ne 0) {
    throw "Failed to start $Name. ReturnValue=$($result.ReturnValue)"
  }

  Set-Content -Path (Join-Path $pidDir "$Name.pid") -Value $result.ProcessId
  Write-Output "$Name pid=$($result.ProcessId)"
}

Start-ServiceProcess -Name "api-service" -Mode "api" -Environment @{ PORT = "7070"; KAFKA_CLIENT_ID = "connect-api-service" }
Start-ServiceProcess -Name "v8-worker-service" -Mode "worker" -Environment @{ KAFKA_CLIENT_ID = "connect-v8-worker-service" }
Start-ServiceProcess -Name "cots-adapter-service" -Mode "cots" -Environment @{ KAFKA_CLIENT_ID = "connect-cots-adapter-service"; COTS_ENDPOINT = "http://127.0.0.1:7071/mock-cots" }
Start-ServiceProcess -Name "mock-cots-service" -Mode "cots-mock" -Environment @{ COTS_MOCK_PORT = "7071"; KAFKA_DISABLED = "true" }
