#!/bin/bash
#
# 食材包订阅平台 v1.2 升级脚本
# 功能：在当前目录直接升级（支持 MySQL、本地上传、Bug修复）
# 使用方法: sudo bash v1_2.sh
#
# 注意：此脚本会直接在当前目录进行修改，适用于在 food-subscription-v1.1 中升级

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 获取当前目录作为项目目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="${SCRIPT_DIR}"
BACKEND_DIR="${PROJECT_DIR}/backend"
FRONTEND_DIR="${PROJECT_DIR}/frontend"
NGINX_CONF="/etc/nginx/sites-available/food-subscription"
SERVICE_FILE="/etc/systemd/system/food-subscription.service"
DB_NAME="food_subscription"
DB_USER="food_user"
DB_PASSWORD="food123456"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  食材包订阅平台 v1.2 升级脚本${NC}"
echo -e "${BLUE}  直接在当前目录升级${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "${YELLOW}项目目录: ${PROJECT_DIR}${NC}"
echo ""

# 检查是否为 root
if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}错误: 请使用 sudo 运行此脚本${NC}"
  exit 1
fi

# 检查是否缺少 v1.2 的关键文件
if [ ! -f "${BACKEND_DIR}/db/init-mysql.js" ]; then
  echo -e "${RED}错误: 缺少 v1.2 文件 ${BACKEND_DIR}/db/init-mysql.js${NC}"
  echo -e "${RED}请确保已将所有 v1.2 文件上传到当前目录后再运行此脚本${NC}"
  echo ""
  echo "需要的 v1.2 文件包括:"
  echo "  - backend/db/init-mysql.js"
  echo "  - backend/db/config.js"
  echo "  - backend/db/connection.js"
  echo "  - backend/routes/ 下的新路由文件"
  echo ""
  exit 1
fi

# 检查系统
if ! command -v apt-get &> /dev/null; then
  echo -e "${RED}错误: 此脚本仅支持 Debian/Ubuntu 系统${NC}"
  exit 1
fi

# 安装基础依赖
echo -e "${GREEN}[1/9] 安装基础依赖...${NC}"
apt-get update -qq

# 安装 Nginx
echo -e "${GREEN}[2/9] 安装/检查 Nginx...${NC}"
if ! command -v nginx &> /dev/null; then
  apt-get install -y -qq nginx
fi

# 安装 MySQL
echo -e "${GREEN}[3/9] 安装/检查 MySQL...${NC}"
if ! command -v mysql &> /dev/null; then
  apt-get install -y -qq mysql-server
  systemctl start mysql
  systemctl enable mysql
fi

# 安装 Node.js
echo -e "${GREEN}[4/9] 安装/检查 Node.js...${NC}"
if ! command -v node &> /dev/null; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash - > /dev/null
  apt-get install -y -qq nodejs
fi

echo -e "${YELLOW}Node.js 版本: $(node --version)${NC}"

# 配置 MySQL
echo -e "${GREEN}[5/9] 配置 MySQL...${NC}"
echo -e "${YELLOW}将创建新用户: ${DB_USER}${NC}"

# 创建数据库和新用户的 SQL
SQL_COMMANDS="
-- 创建数据库
CREATE DATABASE IF NOT EXISTS ${DB_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 创建新用户（如果不存在）
CREATE USER IF NOT EXISTS '${DB_USER}'@'localhost' IDENTIFIED BY '${DB_PASSWORD}';

-- 授权给用户
GRANT ALL PRIVILEGES ON ${DB_NAME}.* TO '${DB_USER}'@'localhost';
FLUSH PRIVILEGES;
"

# 尝试使用 root 无密码登录
if mysql -u root -e "SELECT 1" 2>/dev/null; then
  echo -e "${YELLOW}使用 root (无密码) 配置 MySQL...${NC}"
  echo "${SQL_COMMANDS}" | mysql -u root
# 尝试使用 sudo
elif sudo mysql -e "SELECT 1" 2>/dev/null; then
  echo -e "${YELLOW}使用 sudo 配置 MySQL...${NC}"
  echo "${SQL_COMMANDS}" | sudo mysql
else
  echo -e "${RED}错误: 无法连接到 MySQL，请确保 root 用户可以登录${NC}"
  echo -e "${YELLOW}您可以手动运行以下命令:${NC}"
  echo ""
  echo "sudo mysql -e \"${SQL_COMMANDS}\""
  echo ""
  exit 1
fi

echo -e "${GREEN}✓ 数据库 ${DB_NAME} 已创建${NC}"
echo -e "${GREEN}✓ 用户 ${DB_USER} 已创建并授权${NC}"

# 创建必要的目录
echo -e "${GREEN}[6/9] 创建目录结构...${NC}"
mkdir -p "${BACKEND_DIR}/uploads"
mkdir -p "${FRONTEND_DIR}/dist"

# 安装后端依赖
echo -e "${GREEN}[7/9] 安装后端依赖...${NC}"
cd "${BACKEND_DIR}"

# 备份旧的 package.json
if [ -f "package.json" ] && ! grep -q "mysql2" package.json; then
  echo -e "${YELLOW}备份原 package.json 为 package.json.backup${NC}"
  cp package.json package.json.backup
fi

# 配置 npm 使用国内镜像源（解决网络问题）
echo -e "${YELLOW}配置 npm 国内镜像源...${NC}"
npm config set registry https://registry.npmmirror.com

# 安装依赖（包括 mysql2），带重试机制
echo -e "${YELLOW}安装依赖...${NC}"
for i in 1 2 3; do
  if npm install --production; then
    echo -e "${GREEN}依赖安装成功${NC}"
    break
  else
    echo -e "${YELLOW}安装失败，第 ${i} 次重试...${NC}"
    sleep 3
  fi
done

# 初始化数据库
echo -e "${GREEN}[8/9] 初始化数据库...${NC}"
cd "${BACKEND_DIR}"
node db/init-mysql.js

# 设置权限
echo -e "${GREEN}[9/9] 设置文件权限...${NC}"
chown -R www-data:www-data "${PROJECT_DIR}"
chmod 755 "${PROJECT_DIR}"
chmod 755 "${BACKEND_DIR}"
chmod 755 "${BACKEND_DIR}/uploads"

# 配置 Nginx（如果尚未配置）
echo -e "${GREEN}配置 Nginx...${NC}"

# 检测当前目录名用于 Nginx 配置
CURRENT_DIR_NAME=$(basename "${PROJECT_DIR}")

cat > "${NGINX_CONF}" << EOF
server {
    listen 8080;
    server_name _;
    root ${PROJECT_DIR}/frontend/dist;
    index index.html;

    # Gzip 压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript text/xml;

    # 前端静态文件
    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # API 代理到后端
    location /api/ {
        proxy_pass http://localhost:3001/api/;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # 上传文件
    location /uploads/ {
        alias ${PROJECT_DIR}/backend/uploads/;
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
echo -e "${GREEN}配置系统服务...${NC}"
cat > "${SERVICE_FILE}" << EOF
[Unit]
Description=Food Subscription Platform (v1.2)
After=network.target mysql.service
Wants=mysql.service

[Service]
Type=simple
User=www-data
WorkingDirectory=${BACKEND_DIR}
Environment="NODE_ENV=production"
Environment="PORT=3001"
Environment="DB_HOST=localhost"
Environment="DB_USER=food_user"
Environment="DB_PASSWORD=food123456"
Environment="DB_NAME=${DB_NAME}"
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
systemctl enable food-subscription
systemctl restart food-subscription

# 等待服务启动
sleep 3

# 检查服务状态
if systemctl is-active --quiet food-subscription; then
  echo ""
  echo -e "${GREEN}========================================${NC}"
  echo -e "${GREEN}  升级成功！${NC}"
  echo -e "${GREEN}========================================${NC}"
  echo ""
  echo "访问地址:"
  echo "  http://$(hostname -I | awk '{print $1}'):8080"
  echo ""
  echo "项目目录:"
  echo "  ${PROJECT_DIR}"
  echo ""
  echo "测试账号:"
  echo "  管理员: admin@example.com / admin123"
  echo "  商家:   merchant@example.com / merchant123"
  echo "  用户:   user@example.com / user123"
  echo ""
  echo "v1.2 新功能:"
  echo "  ✓ MySQL 数据库支持"
  echo "  ✓ 本地图片上传保存"
  echo "  ✓ 修复用户画像保存问题"
  echo "  ✓ 修复库存修改问题"
  echo "  ✓ 修复模拟支付功能"
  echo ""
  echo "常用命令:"
  echo "  查看日志: sudo journalctl -u food-subscription -f"
  echo "  重启服务: sudo systemctl restart food-subscription"
  echo "  停止服务: sudo systemctl stop food-subscription"
  echo "  MySQL:    sudo mysql -u root ${DB_NAME}"
  echo ""
else
  echo -e "${RED}服务启动失败，请查看日志:${NC}"
  echo "  sudo journalctl -u food-subscription -n 50"
  exit 1
fi
