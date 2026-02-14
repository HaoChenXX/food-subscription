#!/bin/bash
# 食材包订阅平台 - 服务端一键更新脚本
# 用法: ./update-server.sh

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 项目目录
PROJECT_DIR="/opt/food-subscription"
BACKUP_DIR="/opt/backups/food-subscription-$(date +%Y%m%d-%H%M%S)"

echo -e "${BLUE}======================================${NC}"
echo -e "${BLUE}  食材包订阅平台 - 服务端更新脚本${NC}"
echo -e "${BLUE}======================================${NC}"
echo ""

# 1. 备份当前版本
echo -e "${YELLOW}[1/6] 备份当前版本...${NC}"
if [ -d "$PROJECT_DIR" ]; then
    sudo mkdir -p "$BACKUP_DIR"
    sudo cp -r "$PROJECT_DIR" "$BACKUP_DIR"
    echo -e "${GREEN}✓ 备份完成: $BACKUP_DIR${NC}"
else
    echo -e "${RED}✗ 项目目录不存在: $PROJECT_DIR${NC}"
    exit 1
fi

# 2. 进入项目目录
echo -e "${YELLOW}[2/6] 进入项目目录...${NC}"
cd "$PROJECT_DIR"

# 3. 拉取最新代码
echo -e "${YELLOW}[3/6] 拉取最新代码...${NC}"
git pull origin main
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ 代码更新成功${NC}"
else
    echo -e "${RED}✗ 代码拉取失败，正在恢复备份...${NC}"
    sudo rm -rf "$PROJECT_DIR"
    sudo cp -r "$BACKUP_DIR/food-subscription" "$PROJECT_DIR"
    exit 1
fi

# 4. 安装依赖
echo -e "${YELLOW}[4/6] 安装后端依赖...${NC}"
cd "$PROJECT_DIR/backend"
npm install --production
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ 依赖安装成功${NC}"
else
    echo -e "${RED}✗ 依赖安装失败${NC}"
    exit 1
fi

# 5. 重启服务
echo -e "${YELLOW}[5/6] 重启后端服务...${NC}"
if command -v pm2 &> /dev/null; then
    pm2 restart food-subscription-backend || pm2 start server.js --name food-subscription-backend
    echo -e "${GREEN}✓ 后端服务已重启 (PM2)${NC}"
elif command -v systemctl &> /dev/null; then
    sudo systemctl restart food-subscription || sudo systemctl restart nginx
    echo -e "${GREEN}✓ 后端服务已重启 (systemctl)${NC}"
else
    echo -e "${YELLOW}! 未检测到 PM2 或 systemctl，请手动重启服务${NC}"
fi

# 6. 检查服务状态
echo -e "${YELLOW}[6/6] 检查服务状态...${NC}"
sleep 2
if curl -s http://localhost:3001/api/health > /dev/null; then
    echo -e "${GREEN}✓ 服务运行正常${NC}"
else
    echo -e "${RED}✗ 服务可能未正常启动，请检查日志${NC}"
    echo -e "${YELLOW}  查看日志: pm2 logs food-subscription-backend${NC}"
fi

echo ""
echo -e "${GREEN}======================================${NC}"
echo -e "${GREEN}  更新完成！${NC}"
echo -e "${GREEN}======================================${NC}"
echo ""
echo -e "${BLUE}备份位置: $BACKUP_DIR${NC}"
echo -e "${BLUE}访问地址: http://your-server-ip${NC}"
