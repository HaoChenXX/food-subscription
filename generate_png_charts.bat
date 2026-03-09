@echo off
REM 生成 Mermaid 图表的 PNG 图片
REM 需要 Node.js 和 npm

echo 🥬 食材包订阅平台 - 架构图表生成器
echo =====================================
echo.

REM 检查 Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ 错误: 未找到 Node.js
    echo 请先安装 Node.js (https://nodejs.org/)
    pause
    exit /b 1
)

REM 检查 npm
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ 错误: 未找到 npm
    pause
    exit /b 1
)

echo ✅ 检测到 Node.js 和 npm
echo.

REM 安装 mermaid-cli (如果未安装)
echo 正在检查 mermaid-cli...
npm list -g @mermaid-js/mermaid-cli >nul 2>nul
if %errorlevel% neq 0 (
    echo 正在安装 @mermaid-js/mermaid-cli...
    npm install -g @mermaid-js/mermaid-cli
    if %errorlevel% neq 0 (
        echo ❌ 安装失败
        echo 尝试本地安装...
        npm install @mermaid-js/mermaid-cli
    )
) else (
    echo ✅ mermaid-cli 已安装
)

echo.

REM 检查 mmdc 命令
where mmdc >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ 错误: 未找到 mmdc 命令
    echo 请手动安装: npm install -g @mermaid-js/mermaid-cli
    pause
    exit /b 1
)

echo ✅ mmdc 命令可用
echo.

REM 创建临时目录
if not exist "mermaid_temp" mkdir mermaid_temp

echo 📊 正在生成架构图表...

REM 从 ARCHITECTURE.md 提取图表并生成
if not exist "ARCHITECTURE.md" (
    echo ❌ 错误: 未找到 ARCHITECTURE.md
    pause
    exit /b 1
)

echo 正在提取图表定义...

REM 使用 Python 提取图表
if exist "extract_mermaid.py" (
    python extract_mermaid.py
) else (
    echo ⚠️  警告: 未找到提取脚本
    echo 请先运行 export_mermaid_simple.py
    pause
    exit /b 1
)

echo.
echo 🎉 图表生成完成！
echo.
echo 生成的图表:
echo 1. architecture-charts.html - 所有图表的网页版
echo 2. 请用浏览器打开查看和保存
echo.
echo 如需 PNG 格式，请:
echo 1. 用浏览器打开 architecture-charts.html
echo 2. 右键图表选择"另存为图片"
echo 3. 或使用截图工具
echo.
pause