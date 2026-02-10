#!/bin/bash
# 自动部署脚本 - 在服务器上运行

set -e

PROJECT_DIR="/var/www/food-subscription"
SERVICE_NAME="food-subscription"

echo "🚀 开始自动部署..."

# 进入项目目录
cd $PROJECT_DIR

# 拉取最新代码
echo "📥 拉取最新代码..."
git pull origin main

# 安装后端依赖（如果有更新）
echo "📦 安装依赖..."
cd backend
npm install --production

# 重启服务
echo "🔄 重启服务..."
sudo systemctl restart $SERVICE_NAME

# 检查状态
sleep 2
if systemctl is-active --quiet $SERVICE_NAME; then
    echo "✅ 部署成功！"
    echo "访问: http://$(hostname -I | awk '{print $1}'):8080"
else
    echo "❌ 部署失败，请检查日志:"
    echo "  sudo journalctl -u $SERVICE_NAME -n 50"
    exit 1
fi
