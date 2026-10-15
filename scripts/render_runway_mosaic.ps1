# ==============================================================================
# SHE'AURA — MASTER RUNWAY MULTIVERSE VIDEO COMPOSITOR (1080p FULL HD)
# Renders a high-clarity 1920x1080 master video edit with 4 columns scrolling
# in opposite directions at smooth 2X speed with razor-sharp Lanczos scaling.
# ==============================================================================

param(
    [int]$Duration = 15,
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
Write-Host "Rendering 1080p crystal-clear 4-column video edit at smooth 2X speed ($Duration seconds)..."

# Build inputs
$inputArgs = @()
foreach ($f in $files) {
    $inputArgs += "-stream_loop", "-1", "-t", "$Duration", "-i", $f.FullName
}

# Column width: 480, height per tile: 854 (maintains 9:16 portrait geometry).
# 5 tiles per column = 4270 total height.
# Viewport crop: 480x1080. 4 columns hstack = 1920x1080 Full HD!
# Scroll step: 0.0035 (gentle, silky 2X speed).

$fcParts = @()

# Scale all 20 inputs to 480x854 with high-clarity Lanczos
for ($i = 0; $i -lt 20; $i++) {
    $fcParts += "[$i`:v]scale=480:854:flags=lanczos,setsar=1[v$i]"
}

# Col 0: 0, 4, 8, 12, 16 -> vstack -> scroll UP (-0.0035) -> crop 480:1080
$fcParts += "[v0][v4][v8][v12][v16]vstack=inputs=5[stack0]"
$fcParts += "[stack0]scroll=vertical=-0.0035,crop=480:1080:0:0[col0]"

# Col 1: 1, 5, 9, 13, 17 -> vstack -> scroll DOWN (0.0035) -> crop 480:1080
$fcParts += "[v1][v5][v9][v13][v17]vstack=inputs=5[stack1]"
$fcParts += "[stack1]scroll=vertical=0.0035,crop=480:1080:0:0[col1]"

# Col 2: 2, 6, 10, 14, 18 -> vstack -> scroll UP (-0.0035) -> crop 480:1080
$fcParts += "[v2][v6][v10][v14][v18]vstack=inputs=5[stack2]"
$fcParts += "[stack2]scroll=vertical=-0.0035,crop=480:1080:0:0[col2]"

# Col 3: 3, 7, 11, 15, 19 -> vstack -> scroll DOWN (0.0035) -> crop 480:1080
$fcParts += "[v3][v7][v11][v15][v19]vstack=inputs=5[stack3]"
$fcParts += "[stack3]scroll=vertical=0.0035,crop=480:1080:0:0[col3]"

# Horizontal stack all 4 columns together -> 1920x1080 Full HD
$fcParts += "[col0][col1][col2][col3]hstack=inputs=4[outv]"

$filterComplex = $fcParts -join ";"

$cmdArgs = @()
$cmdArgs += $inputArgs
$cmdArgs += "-filter_complex", $filterComplex
$cmdArgs += "-map", "[outv]"
$cmdArgs += "-c:v", "libx264"
$cmdArgs += "-preset", "medium"
$cmdArgs += "-crf", "22"
$cmdArgs += "-maxrate", "2600k"
$cmdArgs += "-bufsize", "4500k"
$cmdArgs += "-pix_fmt", "yuv420p"
$cmdArgs += "-an"
$cmdArgs += "-movflags", "+faststart"
$cmdArgs += "-t", "$Duration"
$cmdArgs += "-y", $OutputFile

Write-Host "Executing FFmpeg render..."
& $ffmpeg $cmdArgs

if ($LASTEXITCODE -eq 0) {
    Write-Host "SUCCESS! Rendered 1080p master video edit to: $OutputFile" -ForegroundColor Green
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
