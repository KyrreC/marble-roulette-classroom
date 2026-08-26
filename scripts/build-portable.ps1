param([switch]$SkipBuild)

$ErrorActionPreference = 'Stop'
$repoRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$releaseRoot = [IO.Path]::GetFullPath((Join-Path $repoRoot 'release'))
$packageRoot = [IO.Path]::GetFullPath((Join-Path $releaseRoot 'Marble-Roulette-Classroom-Windows'))
$zipPath = [IO.Path]::GetFullPath((Join-Path $releaseRoot 'Marble-Roulette-Classroom-Windows.zip'))

if (-not $packageRoot.StartsWith($releaseRoot + [IO.Path]::DirectorySeparatorChar, [StringComparison]::OrdinalIgnoreCase)) {
  throw "Unsafe package path: $packageRoot"
}
if (-not $zipPath.StartsWith($releaseRoot + [IO.Path]::DirectorySeparatorChar, [StringComparison]::OrdinalIgnoreCase)) {
  throw "Unsafe ZIP path: $zipPath"
}

Push-Location $repoRoot
try {
  if (-not $SkipBuild) {
    & npm.cmd run check
    if ($LASTEXITCODE -ne 0) { throw 'Checks failed' }
    & npm.cmd run build:portable
    if ($LASTEXITCODE -ne 0) { throw 'Portable build failed' }
  }

  if (-not (Test-Path (Join-Path $repoRoot 'dist-portable\index.html'))) {
    throw 'dist-portable is missing; run npm run build:portable first'
  }

  New-Item -ItemType Directory -Force -Path $releaseRoot | Out-Null
  if (Test-Path -LiteralPath $packageRoot) { Remove-Item -LiteralPath $packageRoot -Recurse -Force }
  New-Item -ItemType Directory -Force -Path (Join-Path $packageRoot 'game') | Out-Null

  Copy-Item -Path (Join-Path $repoRoot 'dist-portable\*') -Destination (Join-Path $packageRoot 'game') -Recurse -Force
  $serverSource = Join-Path $repoRoot 'portable\server.ps1'
  $serverDestination = Join-Path $packageRoot 'server.ps1'
  $serverContent = [IO.File]::ReadAllText($serverSource, [Text.Encoding]::UTF8)
  [IO.File]::WriteAllText($serverDestination, $serverContent, (New-Object Text.UTF8Encoding($true)))

  $batchFiles = Get-ChildItem -LiteralPath (Join-Path $repoRoot 'portable') -Filter '*.bat'
  foreach ($batchFile in $batchFiles) {
    $batchContent = [IO.File]::ReadAllText($batchFile.FullName, [Text.Encoding]::UTF8)
    $batchContent = $batchContent.Replace("`r`n", "`n").Replace("`n", "`r`n")
    [IO.File]::WriteAllText((Join-Path $packageRoot $batchFile.Name), $batchContent, [Text.Encoding]::ASCII)
  }
  $readmeFile = Get-ChildItem -LiteralPath (Join-Path $repoRoot 'portable') -Filter '*.txt' | Select-Object -First 1
  Copy-Item -LiteralPath $readmeFile.FullName -Destination $packageRoot
  Copy-Item -LiteralPath (Join-Path $repoRoot 'LICENSE') -Destination (Join-Path $packageRoot 'LICENSE.txt')

  $commit = if ($env:BUILD_COMMIT) { $env:BUILD_COMMIT } else { 'local-build' }
  $versionText = "Build time: $([DateTime]::UtcNow.ToString('yyyy-MM-ddTHH:mm:ssZ'))`r`nCommit: $commit`r`n"
  Set-Content -LiteralPath (Join-Path $packageRoot 'BUILD-INFO.txt') -Value $versionText -Encoding UTF8

  if (Test-Path -LiteralPath $zipPath) { Remove-Item -LiteralPath $zipPath -Force }
  Compress-Archive -LiteralPath $packageRoot -DestinationPath $zipPath -CompressionLevel Optimal
  $stream = [IO.File]::OpenRead($zipPath)
  try {
    $sha256 = [Security.Cryptography.SHA256]::Create()
    $hash = [BitConverter]::ToString($sha256.ComputeHash($stream)).Replace('-', '')
  } finally {
    if ($sha256) { $sha256.Dispose() }
    $stream.Dispose()
  }
  Set-Content -LiteralPath ($zipPath + '.sha256.txt') -Value "$hash  $([IO.Path]::GetFileName($zipPath))" -Encoding ASCII
  Write-Host "Portable package: $zipPath"
  Write-Host "SHA-256: $hash"
} finally {
  Pop-Location
}
