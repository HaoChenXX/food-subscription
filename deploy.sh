#!/bin/bash
#
# 食材包订阅平台部署脚本
# 使用方法: sudo bash deploy.sh
#

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 配置
PROJECT_NAME="food-subscription"
PROJECT_DIR="/var/www/${PROJECT_NAME}"
BACKEND_DIR="${PROJECT_DIR}/backend"
FRONTEND_DIR="${PROJECT_DIR}/frontend"
NGINX_CONF="/etc/nginx/sites-available/${PROJECT_NAME}"
SERVICE_FILE="/etc/systemd/system/${PROJECT_NAME}.service"

# 获取脚本所在目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  食材包订阅平台部署脚本${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# 检查是否为 root
if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}错误: 请使用 sudo 运行此脚本${NC}"
  exit 1
fi

# 检查 nginx
if ! command -v nginx &> /dev/null; then
  echo -e "${YELLOW}正在安装 Nginx...${NC}"
  apt-get update
  apt-get install -y nginx
fi

# 检查 nodejs
if ! command -v node &> /dev/null; then
  echo -e "${YELLOW}正在安装 Node.js...${NC}"
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
fi

echo -e "${GREEN}步骤 1/6: 创建项目目录...${NC}"
mkdir -p "${PROJECT_DIR}"
mkdir -p "${BACKEND_DIR}"
mkdir -p "${FRONTEND_DIR}/dist"
mkdir -p "${BACKEND_DIR}/uploads"

# 复制后端文件
echo -e "${GREEN}步骤 2/6: 部署后端...${NC}"
cp -r "${SCRIPT_DIR}/backend/"* "${BACKEND_DIR}/"

# 安装后端依赖
echo -e "${GREEN}步骤 3/6: 安装后端依赖...${NC}"
cd "${BACKEND_DIR}"
npm install --production

# 初始化数据库
echo -e "${GREEN}步骤 4/6: 初始化数据库...${NC}"
node scripts/init-db.js

# 设置权限
chown -R www-data:www-data "${PROJECT_DIR}"
chmod 755 "${PROJECT_DIR}"
chmod 755 "${BACKEND_DIR}"
chmod 755 "${BACKEND_DIR}/uploads"

# 复制前端文件
echo -e "${GREEN}步骤 5/6: 部署前端...${NC}"
if [ -d "${SCRIPT_DIR}/frontend/dist" ]; then
  cp -r "${SCRIPT_DIR}/frontend/dist/"* "${FRONTEND_DIR}/dist/"
else
  echo -e "${YELLOW}警告: 前端 dist 目录不存在，请确保已构建前端${NC}"
fi
chown -R www-data:www-data "${FRONTEND_DIR}"

# 配置 Nginx
echo -e "${GREEN}步骤 6/6: 配置 Nginx...${NC}"
cat > "${NGINX_CONF}" << 'EOF'
server {
    listen 8080;
    server_name _;
    root /var/www/food-subscription/frontend/dist;
    index index.html;

    # Gzip 压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript text/xml;

    # 前端静态文件
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API 代理到后端
    location /api/ {
        proxy_pass http://localhost:3001/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # 上传文件
    location /uploads/ {
        alias /var/www/food-subscription/backend/uploads/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# 启用 Nginx 配置
ln -sf "${NGINX_CONF}" /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# 测试 Nginx 配置
nginx -t

# 重启 Nginx
systemctl restart nginx
systemctl enable nginx

# 配置 systemd 服务
cat > "${SERVICE_FILE}" << EOF
[Unit]
Description=Food Subscription Platform Backend
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=${BACKEND_DIR}
Environment="NODE_ENV=production"
Environment="PORT=3001"
Environment="JWT_SECRET=$(openssl rand -hex 32)"
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF

# 重新加载 systemd
systemctl daemon-reload

# 启动服务
systemctl enable "${PROJECT_NAME}"
systemctl restart "${PROJECT_NAME}"

# 等待服务启动
sleep 3

# 检查服务状态
if systemctl is-active --quiet "${PROJECT_NAME}"; then
  echo ""
  echo -e "${GREEN}========================================${NC}"
  echo -e "${GREEN}  部署成功！${NC}"
  echo -e "${GREEN}========================================${NC}"
  echo ""
  echo "访问地址:"
  echo "  http://$(hostname -I | awk '{print $1}'):8080"
  echo ""
  echo "测试账号:"
  echo "  管理员: admin@example.com / admin123"
  echo "  商家:   merchant@example.com / merchant123"
  echo "  用户:   user@example.com / user123"
  echo ""
  echo "常用命令:"
  echo "  查看日志: sudo journalctl -u ${PROJECT_NAME} -f"
  echo "  重启服务: sudo systemctl restart ${PROJECT_NAME}"
  echo "  停止服务: sudo systemctl stop ${PROJECT_NAME}"
  echo ""
else
  echo -e "${RED}服务启动失败，请查看日志:${NC}"
  echo "  sudo journalctl -u ${PROJECT_NAME} -n 50"
  exit 1
fi
