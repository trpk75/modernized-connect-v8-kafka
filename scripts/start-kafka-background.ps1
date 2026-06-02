$ErrorActionPreference = "Stop"

$kafkaHome = & "$PSScriptRoot\install-kafka.ps1"
$serverProperties = Join-Path $kafkaHome "config\kraft\server.properties"
$classPath = Join-Path $kafkaHome "libs\*"
$logDir = Join-Path $PWD "data"
$outLog = Join-Path $logDir "kafka.out.log"
$errLog = Join-Path $logDir "kafka.err.log"

New-Item -ItemType Directory -Force -Path $logDir | Out-Null

$clusterIdFile = Join-Path $kafkaHome ".cluster-id"
$clusterId = if (Test-Path $clusterIdFile) { Get-Content $clusterIdFile -Raw } else { "" }
if ([string]::IsNullOrWhiteSpace($clusterId)) {
  $clusterId = & java -cp $classPath kafka.tools.StorageTool random-uuid
  Set-Content -Path $clusterIdFile -Value $clusterId
}

& java -cp $classPath kafka.tools.StorageTool format -t $clusterId.Trim() -c $serverProperties --ignore-formatted | Out-Null

$existing = Get-NetTCPConnection -LocalPort 9092 -State Listen -ErrorAction SilentlyContinue
if ($existing) {
  Write-Output "Kafka appears to already be listening on port 9092."
  exit 0
}

$process = Start-Process -FilePath java -ArgumentList @("-cp", $classPath, "kafka.Kafka", $serverProperties) -WorkingDirectory $kafkaHome -RedirectStandardOutput $outLog -RedirectStandardError $errLog -PassThru -WindowStyle Hidden
Write-Output "Started Kafka PID $($process.Id). Logs: $outLog $errLog"
