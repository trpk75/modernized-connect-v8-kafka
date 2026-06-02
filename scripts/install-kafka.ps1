$ErrorActionPreference = "Stop"

$kafkaVersion = if ($env:KAFKA_VERSION) { $env:KAFKA_VERSION } else { "3.9.2" }
$scalaVersion = if ($env:KAFKA_SCALA_VERSION) { $env:KAFKA_SCALA_VERSION } else { "2.13" }
$archive = "kafka_$scalaVersion-$kafkaVersion.tgz"
$installRoot = if ($env:KAFKA_INSTALL_ROOT) { $env:KAFKA_INSTALL_ROOT } else { "C:\tmp\kafka" }
$download = Join-Path $installRoot $archive
$kafkaHome = Join-Path $installRoot "kafka_$scalaVersion-$kafkaVersion"

New-Item -ItemType Directory -Force -Path $installRoot | Out-Null

if (!(Test-Path $download)) {
  Invoke-WebRequest -UseBasicParsing "https://archive.apache.org/dist/kafka/$kafkaVersion/$archive" -OutFile $download
}

if (!(Test-Path $kafkaHome)) {
  tar -xzf $download -C $installRoot
}

Write-Output $kafkaHome
