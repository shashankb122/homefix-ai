# ==========================================================
# HomeFix AI - Windows PostgreSQL Database Setup Script
# Run in PowerShell as your regular user
# ==========================================================

$ErrorActionPreference = "Stop"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  HomeFix AI - Database Setup (PostgreSQL)" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# Check for psql in common PostgreSQL paths if not in PATH
$psqlPath = "psql"
if (-not (Get-Command "psql" -ErrorAction SilentlyContinue)) {
    $possiblePaths = @(
        "C:\Program Files\PostgreSQL\18\bin\psql.exe",
        "C:\Program Files\PostgreSQL\17\bin\psql.exe",
        "C:\Program Files\PostgreSQL\16\bin\psql.exe"
    )
    foreach ($p in $possiblePaths) {
        if (Test-Path $p) {
            $psqlPath = $p
            break
        }
    }
}

Write-Host "Using PostgreSQL client: $psqlPath" -ForegroundColor Gray

$dbName = "homefix_ai"
$dbUser = Read-Host "Enter PostgreSQL superuser username [default: postgres]"
if ([string]::IsNullOrWhiteSpace($dbUser)) { $dbUser = "postgres" }

Write-Host "`nCreating database '$dbName' if it does not already exist..." -ForegroundColor Yellow
Write-Host "(You will be prompted for your PostgreSQL password)" -ForegroundColor Gray

& $psqlPath -U $dbUser -h localhost -c "SELECT 1 FROM pg_database WHERE datname = '$dbName'" | Out-Null

$dbExistsCheck = & $psqlPath -U $dbUser -h localhost -tAc "SELECT 1 FROM pg_database WHERE datname = '$dbName'"
if ($dbExistsCheck -eq "1") {
    Write-Host "Database '$dbName' already exists. Skipping creation." -ForegroundColor Green
} else {
    & $psqlPath -U $dbUser -h localhost -c "CREATE DATABASE $dbName;"
    Write-Host "Database '$dbName' created successfully!" -ForegroundColor Green
}

Write-Host "`nDatabase setup complete. You can now run the backend application." -ForegroundColor Cyan
