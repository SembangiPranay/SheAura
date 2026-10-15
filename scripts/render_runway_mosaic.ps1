# ==============================================================================
# SHE'AURA — MASTER RUNWAY MULTIVERSE VIDEO COMPOSITOR
# Renders a single .mp4 video edit with 4 columns scrolling in opposite
# directions (Col 1 UP, Col 2 DOWN, Col 3 UP, Col 4 DOWN) at smooth 2X speed.
# ==============================================================================

param(
    [int]$Duration = 16,
    [string]$OutputFile = "d:\New_project\SheAura_design\SheAura\public\reels\sheaura-master-runway-wall.mp4"
)

$ffmpeg = "C:\Users\koushik\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-9.0.2-full_build\bin\ffmpeg.exe"
if (-not (Test-Path $ffmpeg)) {
    $found = Get-Command "ffmpeg" -ErrorAction SilentlyContinue
    if ($found) { $ffmpeg = $found.Source }
    else {
        Write-Error "FFmpeg not found. Please verify installation."
        exit 1
    }
}

$reelsDir = "d:\New_project\SheAura_design\SheAura\public\reels"
$files = Get-ChildItem -Path $reelsDir -Filter "reel-*.mp4" | Sort-Object Name
if ($files.Count -lt 20) {
    Write-Error "Expected 20 reels, found $($files.Count)"
    exit 1
}

Write-Host "Found $($files.Count) reel files in $reelsDir."
Write-Host "Rendering 4-column opposing continuous scroll video edit at smooth 2X speed ($Duration seconds)..."

# Build inputs
$inputArgs = @()
foreach ($f in $files) {
    $inputArgs += "-stream_loop", "-1", "-t", "$Duration", "-i", $f.FullName
}

# Column width: 360, height per tile: 640. 5 tiles per column = 3200 total height.
# Viewport crop: 360x850 (matches exact 850px hero height).
# 4 columns hstack = 1440x850.
# Smooth 2X speed: vertical scroll step = 0.0055 (previously 0.012 which was 4X fast).

$fcParts = @()

# Scale all 20 inputs to 360x640
for ($i = 0; $i -lt 20; $i++) {
    $fcParts += "[$i`:v]scale=360:640,setsar=1[v$i]"
}

# Col 0: 0, 4, 8, 12, 16 -> vstack -> scroll UP (-0.0055) -> crop 360:850
$fcParts += "[v0][v4][v8][v12][v16]vstack=inputs=5[stack0]"
$fcParts += "[stack0]scroll=vertical=-0.0055,crop=360:850:0:0[col0]"

# Col 1: 1, 5, 9, 13, 17 -> vstack -> scroll DOWN (0.0055) -> crop 360:850
$fcParts += "[v1][v5][v9][v13][v17]vstack=inputs=5[stack1]"
$fcParts += "[stack1]scroll=vertical=0.0055,crop=360:850:0:0[col1]"

# Col 2: 2, 6, 10, 14, 18 -> vstack -> scroll UP (-0.0055) -> crop 360:850
$fcParts += "[v2][v6][v10][v14][v18]vstack=inputs=5[stack2]"
$fcParts += "[stack2]scroll=vertical=-0.0055,crop=360:850:0:0[col2]"

# Col 3: 3, 7, 11, 15, 19 -> vstack -> scroll DOWN (0.0055) -> crop 360:850
$fcParts += "[v3][v7][v11][v15][v19]vstack=inputs=5[stack3]"
$fcParts += "[stack3]scroll=vertical=0.0055,crop=360:850:0:0[col3]"

# Horizontal stack all 4 columns together -> 1440x850
$fcParts += "[col0][col1][col2][col3]hstack=inputs=4[outv]"

$filterComplex = $fcParts -join ";"

$cmdArgs = @()
$cmdArgs += $inputArgs
$cmdArgs += "-filter_complex", $filterComplex
$cmdArgs += "-map", "[outv]"
$cmdArgs += "-map", "0:a" # Use audio from reel-01
$cmdArgs += "-c:v", "libx264"
$cmdArgs += "-preset", "fast"
$cmdArgs += "-crf", "23"
$cmdArgs += "-pix_fmt", "yuv420p"
$cmdArgs += "-c:a", "aac"
$cmdArgs += "-b:a", "192k"
$cmdArgs += "-t", "$Duration"
$cmdArgs += "-y", $OutputFile

Write-Host "Executing FFmpeg render..."
& $ffmpeg $cmdArgs

if ($LASTEXITCODE -eq 0) {
    Write-Host "SUCCESS! Rendered master video edit to: $OutputFile" -ForegroundColor Green
    $size = (Get-Item $OutputFile).Length / 1MB
    Write-Host ("File size: {0:N2} MB" -f $size)

    $distFile = "d:\New_project\SheAura_design\SheAura\dist\reels\sheaura-master-runway-wall.mp4"
    if (Test-Path "d:\New_project\SheAura_design\SheAura\dist\reels") {
        Copy-Item -Path $OutputFile -Destination $distFile -Force
        Write-Host "Synchronized to dist/reels."
    }
} else {
    Write-Error "FFmpeg rendering failed with exit code $LASTEXITCODE"
}
