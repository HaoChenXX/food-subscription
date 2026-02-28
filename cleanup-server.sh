#!/bin/bash
#
# 食材订阅平台服务器清理脚本
# 专为Linux服务器设计，自动清理不需要的文件
# 使用方法: sudo bash cleanup-server.sh
#
# 注意：此脚本会自动删除文件，请确保已备份重要数据
#

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 获取项目目录
if [ -n "$1" ]; then
    PROJECT_ROOT="$1"
else
    # 假设脚本在项目根目录运行
    PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
fi

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  食材订阅平台服务器清理脚本${NC}"
echo -e "${BLUE}  项目目录: $PROJECT_ROOT${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# 检查是否在服务器环境中运行
if [ "$EUID" -ne 0 ]; then
    echo -e "${YELLOW}警告: 建议使用 sudo 运行此脚本${NC}"
    echo ""
fi

# 安全警告
echo -e "${YELLOW}⚠️  警告：此脚本将自动删除以下文件：${NC}"
echo "  - 备份文件 (*.backup)"
echo "  - 临时文件和测试文件"
echo "  - 重复的脚本文件"
echo "  - 构建产物目录"
echo "  - 依赖目录 (node_modules)"
echo ""
read -p "是否继续？(输入 'YES' 确认): " -r
if [[ ! $REPLY == "YES" ]]; then
    echo -e "${YELLOW}操作已取消。${NC}"
    exit 0
fi

echo ""
echo -e "${BLUE}开始清理...${NC}"
echo ""

# 记录开始时间
START_TIME=$(date +%s)

# 1. 删除备份文件
echo -e "${GREEN}[1/6] 删除备份文件...${NC}"
find "$PROJECT_ROOT" -name "*.backup" -type f -delete 2>/dev/null || true
find "$PROJECT_ROOT" -name "*.bak" -type f -delete 2>/dev/null || true
find "$PROJECT_ROOT" -name "*.old" -type f -delete 2>/dev/null || true
echo "  ✓ 备份文件已删除"

# 2. 删除临时文件和测试文件
echo -e "${GREEN}[2/6] 删除临时文件和测试文件...${NC}"
TEMP_FILES=(
    "food-subscription-v1.1.zip"
    "my-app@0.0.0"
    "test_ssh.txt"
    "package-lock.json"
    "yarn.lock"
    "*.tmp"
    "*.temp"
    "*.log"
)

for pattern in "${TEMP_FILES[@]}"; do
    find "$PROJECT_ROOT" -name "$pattern" -type f -delete 2>/dev/null || true
done
echo "  ✓ 临时文件已删除"

# 3. 删除重复的脚本文件（保留一个版本）
echo -e "${GREEN}[3/6] 清理重复脚本文件...${NC}"
# 保留 deploy.sh，删除 deploy-v1.1.sh
if [ -f "$PROJECT_ROOT/deploy.sh" ] && [ -f "$PROJECT_ROOT/deploy-v1.1.sh" ]; then
    rm -f "$PROJECT_ROOT/deploy-v1.1.sh"
    echo "  ✓ 删除 deploy-v1.1.sh (保留 deploy.sh)"
fi

# 保留 fix-line-endings.py，删除 fix-line-endings-v1.1.py
if [ -f "$PROJECT_ROOT/fix-line-endings.py" ] && [ -f "$PROJECT_ROOT/fix-line-endings-v1.1.py" ]; then
    rm -f "$PROJECT_ROOT/fix-line-endings-v1.1.py"
    echo "  ✓ 删除 fix-line-endings-v1.1.py (保留 fix-line-endings.py)"
fi

# 保留 fix-v1.2.py（跨平台），删除其他版本
if [ -f "$PROJECT_ROOT/fix-v1.2.py" ]; then
    rm -f "$PROJECT_ROOT/fix-v1.2.ps1" 2>/dev/null || true
    rm -f "$PROJECT_ROOT/fix-v1.2.sh" 2>/dev/null || true
    echo "  ✓ 删除 fix-v1.2.ps1 和 fix-v1.2.sh (保留 fix-v1.2.py)"
fi

# 4. 清理重复的logo文件（保留logo-512.png和logo-128.png）
echo -e "${GREEN}[4/6] 清理重复logo文件...${NC}"
if [ -f "$PROJECT_ROOT/logo-512.png" ]; then
    # 保留 logo-512.png (最大分辨率) 和 logo-128.png (最小分辨率)
    rm -f "$PROJECT_ROOT/logo.png" 2>/dev/null || true
    rm -f "$PROJECT_ROOT/logo-256.png" 2>/dev/null || true
    rm -f "$PROJECT_ROOT/logo-optimized.png" 2>/dev/null || true
    echo "  ✓ 删除重复logo文件 (保留 logo-512.png 和 logo-128.png)"
fi

# 5. 清理构建产物目录
echo -e "${GREEN}[5/6] 清理构建产物目录...${NC}"
BUILD_DIRS=(
    "frontend/dist"
    "frontend-src/dist"
)

for dir in "${BUILD_DIRS[@]}"; do
    if [ -d "$PROJECT_ROOT/$dir" ]; then
        rm -rf "$PROJECT_ROOT/$dir"
        echo "  ✓ 清理目录: $dir"
    fi
done

# 6. 清理依赖目录（可选，生产环境可能需要）
echo -e "${GREEN}[6/6] 清理依赖目录...${NC}"
read -p "是否清理 node_modules 目录？这将需要重新安装依赖。(y/N): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    NODE_MODULES_DIRS=(
        "backend/node_modules"
        "frontend-src/node_modules"
    )

    for dir in "${NODE_MODULES_DIRS[@]}"; do
        if [ -d "$PROJECT_ROOT/$dir" ]; then
            rm -rf "$PROJECT_ROOT/$dir"
            echo "  ✓ 清理目录: $dir"
        fi
    done
    echo "  ⚠️  依赖已删除，运行以下命令重新安装："
    echo "    cd backend && npm install --production"
    echo "    cd frontend-src && npm install"
else
    echo "  ⏭️  跳过依赖目录清理"
fi

# 7. 删除旧文档文件（可选）
echo ""
read -p "是否删除旧版本文档文件 (README-v1.2.md, CHANGELOG-v1.2.md)？(y/N): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    OLD_DOCS=(
        "README-v1.2.md"
        "CHANGELOG-v1.2.md"
    )

    for doc in "${OLD_DOCS[@]}"; do
        if [ -f "$PROJECT_ROOT/$doc" ]; then
            rm -f "$PROJECT_ROOT/$doc"
            echo "  ✓ 删除: $doc"
        fi
    done
fi

# 计算释放的空间
echo ""
echo -e "${BLUE}计算磁盘空间变化...${NC}"
END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))

# 显示总结
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  服务器清理完成！${NC}"
echo -e "${GREEN}  耗时: ${DURATION} 秒${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${YELLOW}✅ 清理完成的项目结构：${NC}"
echo ""
echo "建议运行以下命令检查剩余文件："
echo "  find $PROJECT_ROOT -name \"*.backup\" -o -name \"*.bak\" -o -name \"*.zip\""
echo ""
echo "如果需要重新安装依赖："
echo "  后端: cd $PROJECT_ROOT/backend && npm install --production"
echo "  前端: cd $PROJECT_ROOT/frontend-src && npm install"
echo ""
echo "如果需要重新构建前端："
echo "  cd $PROJECT_ROOT/frontend-src && npm run build"
echo "  cp -r $PROJECT_ROOT/frontend-src/dist/* $PROJECT_ROOT/frontend/dist/"
echo ""
echo -e "${YELLOW}⚠️  注意：清理完成后，建议提交更改到版本控制系统。${NC}"

# 添加执行权限
chmod +x "$PROJECT_ROOT/cleanup-server.sh" 2>/dev/null || true