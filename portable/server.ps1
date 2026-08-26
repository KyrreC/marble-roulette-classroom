param(
  [ValidateSet('Launch', 'Serve', 'Stop')]
  [string]$Mode = 'Launch'
)

$ErrorActionPreference = 'Stop'
$baseDir = [IO.Path]::GetFullPath($PSScriptRoot)
$gameDir = [IO.Path]::GetFullPath((Join-Path $baseDir 'game'))
$portFile = Join-Path $baseDir '.server.port'
$tokenFile = Join-Path $baseDir '.server.token'
$pidFile = Join-Path $baseDir '.server.pid'
$errorFile = Join-Path $baseDir 'server-error.txt'

function Remove-StateFiles {
  foreach ($file in @($portFile, $tokenFile, $pidFile)) {
    if (Test-Path -LiteralPath $file) { Remove-Item -LiteralPath $file -Force -ErrorAction SilentlyContinue }
  }
}

function Get-State {
  if (-not (Test-Path -LiteralPath $portFile) -or -not (Test-Path -LiteralPath $tokenFile)) { return $null }
  $port = 0
  if (-not [int]::TryParse((Get-Content -LiteralPath $portFile -Raw).Trim(), [ref]$port)) { return $null }
  $token = (Get-Content -LiteralPath $tokenFile -Raw).Trim()
  if ($port -lt 1 -or [string]::IsNullOrWhiteSpace($token)) { return $null }
  return @{ Port = $port; Token = $token }
}

function Test-Health([hashtable]$State) {
  try {
    $uri = "http://127.0.0.1:$($State.Port)/__health?token=$($State.Token)"
    $response = Invoke-WebRequest -UseBasicParsing -Uri $uri -TimeoutSec 1
    return $response.StatusCode -eq 200 -and $response.Content -eq 'ok'
  } catch {
    return $false
  }
}

function Send-Response {
  param(
    [System.IO.Stream]$Stream,
    [int]$Status,
    [string]$Reason,
    [string]$ContentType,
    [byte[]]$Body,
    [bool]$HeadOnly = $false
  )
  $headers = @(
    "HTTP/1.1 $Status $Reason",
    "Content-Type: $ContentType",
    "Content-Length: $($Body.Length)",
    'Cache-Control: no-cache',
    "Content-Security-Policy: default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval'; connect-src 'self'; media-src 'self' blob:; worker-src 'self' blob:",
    'X-Content-Type-Options: nosniff',
    'Referrer-Policy: no-referrer',
    'Connection: close',
    '',
    ''
  ) -join "`r`n"
  $headerBytes = [Text.Encoding]::ASCII.GetBytes($headers)
  $Stream.Write($headerBytes, 0, $headerBytes.Length)
  if (-not $HeadOnly -and $Body.Length -gt 0) { $Stream.Write($Body, 0, $Body.Length) }
  $Stream.Flush()
}

function Get-MimeType([string]$Path) {
  switch ([IO.Path]::GetExtension($Path).ToLowerInvariant()) {
    '.html' { return 'text/html; charset=utf-8' }
    '.css' { return 'text/css; charset=utf-8' }
    '.js' { return 'text/javascript; charset=utf-8' }
    '.json' { return 'application/json; charset=utf-8' }
    '.webmanifest' { return 'application/manifest+json; charset=utf-8' }
    '.wasm' { return 'application/wasm' }
    '.svg' { return 'image/svg+xml' }
    '.png' { return 'image/png' }
    '.jpg' { return 'image/jpeg' }
    '.jpeg' { return 'image/jpeg' }
    '.ico' { return 'image/x-icon' }
    '.txt' { return 'text/plain; charset=utf-8' }
    default { return 'application/octet-stream' }
  }
}

function Start-StaticServer {
  if (-not (Test-Path -LiteralPath (Join-Path $gameDir 'index.html'))) {
    throw "找不到 game\index.html。请完整解压便携版后再启动。"
  }

  $listener = $null
  $port = 0
  foreach ($candidate in 8765..8775) {
    try {
      $attempt = New-Object System.Net.Sockets.TcpListener([Net.IPAddress]::Loopback, $candidate)
      $attempt.Start()
      $listener = $attempt
      $port = $candidate
      break
    } catch {
      if ($attempt) { $attempt.Stop() }
    }
  }
  if (-not $listener) { throw '端口 8765–8775 均被占用，无法启动课堂游戏。' }

  $token = [Guid]::NewGuid().ToString('N')
  Set-Content -LiteralPath $portFile -Value $port -Encoding ASCII
  Set-Content -LiteralPath $tokenFile -Value $token -Encoding ASCII
  Set-Content -LiteralPath $pidFile -Value $PID -Encoding ASCII
  if (Test-Path -LiteralPath $errorFile) { Remove-Item -LiteralPath $errorFile -Force -ErrorAction SilentlyContinue }

  $running = $true
  try {
    while ($running) {
      $client = $listener.AcceptTcpClient()
      try {
        $stream = $client.GetStream()
        $reader = New-Object System.IO.StreamReader($stream, [Text.Encoding]::ASCII, $false, 4096, $true)
        $requestLine = $reader.ReadLine()
        while ($null -ne ($line = $reader.ReadLine()) -and $line.Length -gt 0) {}

        if ([string]::IsNullOrWhiteSpace($requestLine)) { continue }
        $parts = $requestLine.Split(' ')
        if ($parts.Length -lt 2 -or $parts[0] -notin @('GET', 'HEAD')) {
          Send-Response $stream 405 'Method Not Allowed' 'text/plain; charset=utf-8' ([Text.Encoding]::UTF8.GetBytes('Method not allowed'))
          continue
        }

        $headOnly = $parts[0] -eq 'HEAD'
        $uri = New-Object Uri("http://127.0.0.1$($parts[1])")
        $requestPath = [Uri]::UnescapeDataString($uri.AbsolutePath)
        $queryToken = ''
        foreach ($item in $uri.Query.TrimStart('?').Split('&')) {
          $pair = $item.Split('=', 2)
          if ($pair.Length -eq 2 -and $pair[0] -eq 'token') { $queryToken = $pair[1] }
        }

        if ($requestPath -eq '/__health') {
          if ($queryToken -eq $token) {
            Send-Response $stream 200 'OK' 'text/plain; charset=utf-8' ([Text.Encoding]::UTF8.GetBytes('ok')) $headOnly
          } else {
            Send-Response $stream 403 'Forbidden' 'text/plain; charset=utf-8' ([Text.Encoding]::UTF8.GetBytes('Forbidden')) $headOnly
          }
          continue
        }
        if ($requestPath -eq '/__shutdown') {
          if ($queryToken -eq $token) {
            Send-Response $stream 200 'OK' 'text/plain; charset=utf-8' ([Text.Encoding]::UTF8.GetBytes('stopping')) $headOnly
            $running = $false
          } else {
            Send-Response $stream 403 'Forbidden' 'text/plain; charset=utf-8' ([Text.Encoding]::UTF8.GetBytes('Forbidden')) $headOnly
          }
          continue
        }

        $relative = $requestPath.TrimStart('/').Replace('/', [IO.Path]::DirectorySeparatorChar)
        if ([string]::IsNullOrWhiteSpace($relative)) { $relative = 'index.html' }
        $candidatePath = [IO.Path]::GetFullPath((Join-Path $gameDir $relative))
        $gamePrefix = $gameDir.TrimEnd([IO.Path]::DirectorySeparatorChar) + [IO.Path]::DirectorySeparatorChar
        if (-not $candidatePath.StartsWith($gamePrefix, [StringComparison]::OrdinalIgnoreCase)) {
          Send-Response $stream 403 'Forbidden' 'text/plain; charset=utf-8' ([Text.Encoding]::UTF8.GetBytes('Forbidden')) $headOnly
          continue
        }
        if (Test-Path -LiteralPath $candidatePath -PathType Container) { $candidatePath = Join-Path $candidatePath 'index.html' }
        if (-not (Test-Path -LiteralPath $candidatePath -PathType Leaf)) {
          Send-Response $stream 404 'Not Found' 'text/plain; charset=utf-8' ([Text.Encoding]::UTF8.GetBytes('Not found')) $headOnly
          continue
        }

        $body = [IO.File]::ReadAllBytes($candidatePath)
        Send-Response $stream 200 'OK' (Get-MimeType $candidatePath) $body $headOnly
      } catch {
        try { Send-Response $stream 500 'Internal Server Error' 'text/plain; charset=utf-8' ([Text.Encoding]::UTF8.GetBytes('Server error')) } catch {}
      } finally {
        if ($reader) { $reader.Dispose() }
        $client.Close()
      }
    }
  } finally {
    $listener.Stop()
    Remove-StateFiles
  }
}

try {
  switch ($Mode) {
    'Launch' {
      $state = Get-State
      if (-not $state -or -not (Test-Health $state)) {
        Remove-StateFiles
        if (Test-Path -LiteralPath $errorFile) { Remove-Item -LiteralPath $errorFile -Force }
        $arguments = "-NoProfile -ExecutionPolicy Bypass -File `"$PSCommandPath`" -Mode Serve"
        Start-Process -FilePath 'powershell.exe' -ArgumentList $arguments -WindowStyle Hidden | Out-Null
        $state = $null
        foreach ($attempt in 1..50) {
          Start-Sleep -Milliseconds 100
          $state = Get-State
          if ($state -and (Test-Health $state)) { break }
        }
      }
      if (-not $state -or -not (Test-Health $state)) {
        $detail = if (Test-Path -LiteralPath $errorFile) { Get-Content -LiteralPath $errorFile -Raw } else { '本地服务未能启动。' }
        throw $detail
      }
      Start-Process "http://127.0.0.1:$($state.Port)/"
    }
    'Serve' {
      try { Start-StaticServer } catch {
        Set-Content -LiteralPath $errorFile -Value $_.Exception.Message -Encoding UTF8
        Remove-StateFiles
        throw
      }
    }
    'Stop' {
      $state = Get-State
      if ($state -and (Test-Health $state)) {
        Invoke-WebRequest -UseBasicParsing -Uri "http://127.0.0.1:$($state.Port)/__shutdown?token=$($state.Token)" -TimeoutSec 2 | Out-Null
        foreach ($attempt in 1..20) {
          if (-not (Test-Health $state)) { break }
          Start-Sleep -Milliseconds 100
        }
      }
      Remove-StateFiles
      Write-Host '游戏服务已关闭。'
    }
  }
} catch {
  Write-Error $_.Exception.Message
  exit 1
}
