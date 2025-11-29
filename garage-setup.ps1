$ErrorActionPreference = "Stop"

Write-Host "`n=== GARAGE SETUP (WITH YOUR .ENV VARIABLES) ===`n"


# =============================================================================
# 1) CHECK & APPLY LAYOUT (only if missing)
# =============================================================================
Write-Host "[1] Checking layout..."
$layout = docker compose exec -T garage /garage layout show

if ($layout -notmatch "Current layout version: 1") {

    Write-Host "Layout not applied -> applying version 1..."

    $nodeId = (docker compose exec -T garage /garage node id | Select-Object -Last 1)

    docker compose exec -T garage /garage layout assign --zone dc1 --capacity 1G $nodeId
    docker compose exec -T garage /garage layout apply --version 1

    Write-Host "Layout applied.`n"

} else {
    Write-Host "Layout already applied. Skipping.`n"
}


# =============================================================================
# 2) LOAD .env
# =============================================================================
Write-Host "[2] Reading .env..."

$envVars = @{}
Get-Content ".env" |
    Where-Object { $_ -and ($_ -notmatch '^#') } |
    ForEach-Object {
        $kv = $_ -split "=", 2
        if ($kv.Count -eq 2) {
            $envVars[$kv[0]] = $kv[1]
        }
    }

$bucket     = $envVars["S3_BUCKET"]
$keyName    = $envVars["S3_KEY_NAME"]

if (-not $bucket) {
    Write-Host "[ERROR] Missing S3_BUCKET in .env"
    exit 1
}
if (-not $keyName) {
    Write-Host "[ERROR] Missing S3_KEY_NAME in .env"
    exit 1
}

Write-Host "Bucket:  $bucket"
Write-Host "KeyName: $keyName`n"


# =============================================================================
# 3) ENSURE BUCKET EXISTS
# =============================================================================
Write-Host "[3] Ensuring bucket exists..."
$bucketList = docker compose exec -T garage /garage bucket list

if ($bucketList -match $bucket) {
    Write-Host "Bucket already exists.`n"
}
else {
    Write-Host "Creating bucket..."
    docker compose exec -T garage /garage bucket create $bucket
    Write-Host "Bucket created.`n"
}


# =============================================================================
# 4) ENSURE KEY EXISTS OR CREATE NEW
# =============================================================================
# =============================================================================
# 4) ENSURE KEY EXISTS OR CREATE NEW
# =============================================================================
Write-Host "[4] Checking if key exists..."

$keyList = docker compose exec -T garage /garage key list

if ($keyList -match $keyName) {

    Write-Host "Key already exists → reading info..."
    $keyInfo = docker compose exec -T garage /garage key info $keyName

    $AccessKey = (
        $keyInfo |
        Select-String -Pattern "^Key ID:" |
        ForEach-Object { $_.ToString().Split(":", 2)[1].Trim() }
    )

    $SecretKey = (
        $keyInfo |
        Select-String -Pattern "^Secret key:" |
        ForEach-Object { $_.ToString().Split(":", 2)[1].Trim() }
    )

} else {

    Write-Host "Key missing → creating new Garage key..."
    $output = docker compose exec -T garage /garage key create $keyName

    Write-Host "`n--- NEW KEY GENERATED ---"
    Write-Host $output
    Write-Host "---------------------------------------`n"

    $AccessKey = (
        $output |
        Select-String -Pattern "^Key ID:" |
        ForEach-Object { $_.ToString().Split(":", 2)[1].Trim() }
    )

    $SecretKey = (
        $output |
        Select-String -Pattern "^Secret key:" |
        ForEach-Object { $_.ToString().Split(":", 2)[1].Trim() }
    )
}



# =============================================================================
# 5) UPDATE .env SAFELY
# =============================================================================
Write-Host "[5] Updating .env with new keys..."

function Set-EnvValue($fileLines, $key, $value) {
    $pattern = "^$key="
    $found = $false
    $newLines = @()

    foreach ($line in $fileLines) {
        if ($line -match $pattern) {
            $newLines += "$key=$value"
            $found = $true
        }
        else {
            $newLines += $line
        }
    }

    if (-not $found) {
        $newLines += "$key=$value"
    }

    return $newLines
}

$envPath = ".env"
$envFile = Get-Content $envPath

$envFile = Set-EnvValue $envFile "S3_KEY_ID" $AccessKey
$envFile = Set-EnvValue $envFile "S3_KEY_SECRET" $SecretKey

Set-Content -Path $envPath -Value $envFile

Write-Host "[5] .env updated successfully.`n"


# =============================================================================
# 6) APPLY PERMISSIONS
# =============================================================================
Write-Host "[6] Applying permissions to bucket..."

docker compose exec -T garage /garage key allow $keyName --read --write --owner $bucket

Write-Host "`n=== GARAGE SETUP COMPLETE ===`n"
