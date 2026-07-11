param(
    [switch]$BackendOnly,
    [switch]$FrontendOnly,
    [switch]$WithSmoke,
    [switch]$InstallDeps
)

$ErrorActionPreference = "Continue"
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path

$argsList = @()
if ($BackendOnly) { $argsList += "--backend-only" }
if ($FrontendOnly) { $argsList += "--frontend-only" }
if ($WithSmoke) { $argsList += "--with-smoke" }
if ($InstallDeps) { $argsList += "--install-deps" }

$python = Join-Path $Root "..\popy-be\venv\Scripts\python.exe"
if (-not (Test-Path $python)) {
    $python = "python"
}

& $python (Join-Path $Root "run_all.py") @argsList
exit $LASTEXITCODE
