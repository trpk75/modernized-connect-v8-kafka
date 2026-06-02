$ErrorActionPreference = "Stop"

$kafkaHome = & "$PSScriptRoot\install-kafka.ps1"
$serverProperties = Join-Path $kafkaHome "config\kraft\server.properties"
$classPath = Join-Path $kafkaHome "libs\*"
$clusterIdFile = Join-Path $kafkaHome ".cluster-id"

$clusterId = if (Test-Path $clusterIdFile) { Get-Content $clusterIdFile -Raw } else { "" }
if ([string]::IsNullOrWhiteSpace($clusterId)) {
  $clusterId = & java -cp $classPath kafka.tools.StorageTool random-uuid
  Set-Content -Path $clusterIdFile -Value $clusterId
}

& java -cp $classPath kafka.tools.StorageTool format -t $clusterId.Trim() -c $serverProperties --ignore-formatted
& java -cp $classPath kafka.Kafka $serverProperties
