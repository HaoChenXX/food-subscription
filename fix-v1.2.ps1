# fix-v1.2.ps1
# Windows PowerShell 脚本 - 修复文件换行符
# 使用方法: 右键选择 "使用 PowerShell 运行" 或在 PowerShell 中执行 .\fix-v1.2.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  修复文件换行符 - v1.2" -ForegroundColor Cyan
Write-Host "  Windows CRLF -> Unix LF" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptDir

Write-Host "工作目录: $scriptDir" -ForegroundColor Gray
Write-Host ""

# 需要修复的文件列表
$files = @(
    "v1_2.sh",
    "backend/server.js",
    "backend/package.json"
) + 
(Get-ChildItem -Path "backend/db/*.js" -ErrorAction SilentlyContinue | Select-Object -ExpandProperty FullName) +
(Get-ChildItem -Path "backend/middleware/*.js" -ErrorAction SilentlyContinue | Select-Object -ExpandProperty FullName) +
(Get-ChildItem -Path "backend/routes/*.js" -ErrorAction SilentlyContinue | Select-Object -ExpandProperty FullName) +
(Get-ChildItem -Path "backend/utils/*.js" -ErrorAction SilentlyContinue | Select-Object -ExpandProperty FullName)

$fixedCount = 0
$skipCount = 0
$errorCount = 0

foreach ($file in $files) {
    if (-not (Test-Path $file)) {
        Write-Host "  [跳过] 不存在: $file" -ForegroundColor DarkGray
        continue
    }
    
    try {
        $content = [System.IO.File]::ReadAllBytes($file)
        $crlf = [byte[]]@(0x0D, 0x0A)  # \r\n
        $lf = [byte[]]@(0x0A)          # \n
        
        # 检查是否包含 CRLF
        $hasCRLF = $false
        for ($i = 0; $i -lt $content.Length - 1; $i++) {
            if ($content[$i] -eq 0x0D -and $content[$i + 1] -eq 0x0A) {
                $hasCRLF = $true
                break
            }
        }
        
        if (-not $hasCRLF) {
            Write-Host "  [OK] 无需修复: $file" -ForegroundColor Green
            $skipCount++
            continue
        }
        
        # 替换 CRLF 为 LF
        $newContent = New-Object System.Collections.Generic.List[byte]
        $i = 0
        $crlfCount = 0
        while ($i -lt $content.Length) {
            if ($i -lt $content.Length - 1 -and $content[$i] -eq 0x0D -and $content[$i + 1] -eq 0x0A) {
                $newContent.Add(0x0A)  # 只添加 LF
                $i += 2
                $crlfCount++
            } else {
                $newContent.Add($content[$i])
                $i++
            }
        }
        
        [System.IO.File]::WriteAllBytes($file, $newContent.ToArray())
        Write-Host "  [已修复] $file ($crlfCount 处 CRLF)" -ForegroundColor Yellow
        $fixedCount++
        
    } catch {
        Write-Host "  [错误] $file : $_" -ForegroundColor Red
        $errorCount++
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  修复完成!" -ForegroundColor Green
Write-Host "  修复: $fixedCount 个" -ForegroundColor Yellow
Write-Host "  无需修复: $skipCount 个" -ForegroundColor Green
Write-Host "  失败: $errorCount 个" -ForegroundColor Red
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "提示: 文件已准备好上传到 Ubuntu 服务器" -ForegroundColor Cyan
Write-Host "      可以使用以下命令上传:" -ForegroundColor Gray
Write-Host "      scp -r . root@服务器IP:/var/www/food-subscription-v1.2/" -ForegroundColor White
Write-Host ""

Read-Host "按 Enter 键退出"
