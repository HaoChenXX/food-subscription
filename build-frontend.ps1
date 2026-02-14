# frontend-src 构建脚本
# 使用方法: .\build-frontend.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  构建前端项目" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$frontendDir = "frontend-src"
$distDir = "frontend/dist"

# 检查目录是否存在
if (-not (Test-Path $frontendDir)) {
    Write-Host "错误: 找不到 $frontendDir 目录" -ForegroundColor Red
    exit 1
}

# 进入前端目录
Set-Location $frontendDir

# 安装依赖（如果不存在）
if (-not (Test-Path "node_modules")) {
    Write-Host "安装依赖..." -ForegroundColor Yellow
    npm install
}

# 构建
Write-Host "构建项目..." -ForegroundColor Yellow
npm run build

# 检查结果
if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "  构建成功!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    
    # 复制 dist 到前端目录
    Set-Location ..
    if (-not (Test-Path $distDir)) {
        New-Item -ItemType Directory -Force -Path $distDir | Out-Null
    }
    
    Write-Host "复制构建文件到 $distDir..." -ForegroundColor Yellow
    Copy-Item -Path "$frontendDir/dist/*" -Destination $distDir -Recurse -Force
    
    Write-Host ""
    Write-Host "完成! 可以上传到服务器了。" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "  构建失败" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    exit 1
}
