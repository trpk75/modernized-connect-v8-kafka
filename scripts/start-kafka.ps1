$ErrorActionPreference = "Stop"

$kafkaVersion = "3.9.2"
$scalaVersion = "2.13"
$archive = "kafka_$scalaVersion-$kafkaVersion.tgz"
$installRoot = Join-Path $PWD ".kafka"
$download = Join-Path $installRoot $archive
$kafkaHome = Join-Path $installRoot "kafka_$scalaVersion-$kafkaVersion"

New-Item -ItemType Directory -Force -Path $installRoot | Out-Null

if (!(Test-Path $download)) {
  Invoke-WebRequest -UseBasicParsing "https://archive.apache.org/dist/kafka/$kafkaVersion/$archive" -OutFile $download
}

if (!(Test-Path $kafkaHome)) {
  tar -xzf $download -C $installRoot
}

$clusterId = & "$kafkaHome\bin\windows\kafka-storage.bat" random-uuid
& "$kafkaHome\bin\windows\kafka-storage.bat" format -t $clusterId -c "$kafkaHome\config\kraft\server.properties" --ignore-formatted
& "$kafkaHome\bin\windows\kafka-server-start.bat" "$kafkaHome\config\kraft\server.properties"
