#!/bin/bash
#
# 从Git仓库指定版本部署脚本
# 使用方法: sudo bash deploy-from-git.sh <仓库地址> [commit-hash]
# 示例: 
#   sudo bash deploy-from-git.sh https://github.com/username/food-subscription.git
#   sudo bash deploy-from-git.sh https://github.com/username/food-subscription.git fcf00e4fb4a863321db2eed1218328667f85a246
#

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 配置变量
DB_NAME="food_subscription"
DB_USER="food_user"
DB_PASSWORD="food123456"
JWT_SECRET=$(openssl rand -hex 32)

# 获取参数
GIT_REPO="${1:-}"
COMMIT_HASH="${2:-main}"
PROJECT_NAME="food-subscription"
INSTALL_DIR="/var/www/${PROJECT_NAME}"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  食材包订阅平台 - Git版本部署脚本${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# 检查参数
if [ -z "$GIT_REPO" ]; then
  echo -e "${RED}错误: 请提供Git仓库地址${NC}"
  echo ""
  echo "使用方法:"
  echo "  sudo bash deploy-from-git.sh <仓库地址> [commit-hash]"
  echo ""
  echo "示例:"
  echo "  # 部署最新版本"
  echo "  sudo bash deploy-from-git.sh https://github.com/username/food-subscription.git"
  echo ""
  echo "  # 部署指定版本"
  echo "  sudo bash deploy-from-git.sh https://github.com/username/food-subscription.git fcf00e4fb4a863321db2eed1218328667f85a246"
  echo ""
  exit 1
fi

echo -e "${YELLOW}Git仓库: ${GIT_REPO}${NC}"
echo -e "${YELLOW}版本(commit): ${COMMIT_HASH}${NC}"
echo ""

# ==================== 检查环境 ====================
echo -e "${YELLOW}检查运行环境...${NC}"

# 检查是否为 root
if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}错误: 请使用 sudo 运行此脚本${NC}"
  exit 1
fi

# 检查系统
if ! command -v apt-get &> /dev/null; then
  echo -e "${RED}错误: 此脚本仅支持 Debian/Ubuntu 系统${NC}"
  exit 1
fi

# 获取服务器IP
SERVER_IP=$(hostname -I | awk '{print $1}')
echo -e "${GREEN}服务器IP: ${SERVER_IP}${NC}"
echo ""

# ==================== 安装基础依赖 ====================
echo -e "${BLUE}[1/9] 安装基础工具...${NC}"
apt-get update -qq
apt-get install -y -qq curl wget vim net-tools git

# ==================== 安装Nginx ====================
echo -e "${BLUE}[2/9] 安装Nginx...${NC}"
if ! command -v nginx &> /dev/null; then
  apt-get install -y -qq nginx
  systemctl enable nginx
  echo -e "${GREEN}✓ Nginx安装完成${NC}"
else
  echo -e "${YELLOW}Nginx已存在，跳过安装${NC}"
fi

# ==================== 安装MySQL ====================
echo -e "${BLUE}[3/9] 安装MySQL...${NC}"
if ! command -v mysql &> /dev/null; then
  apt-get install -y -qq mysql-server
  systemctl start mysql
  systemctl enable mysql
  echo -e "${GREEN}✓ MySQL安装完成${NC}"
else
  echo -e "${YELLOW}MySQL已存在，跳过安装${NC}"
fi

# ==================== 安装Node.js ====================
echo -e "${BLUE}[4/9] 安装Node.js...${NC}"
if ! command -v node &> /dev/null; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash - > /dev/null
  apt-get install -y -qq nodejs
  echo -e "${GREEN}✓ Node.js安装完成 (版本: $(node --version))${NC}"
else
  echo -e "${YELLOW}Node.js已存在 ($(node --version))，跳过安装${NC}"
fi

# ==================== 克隆Git仓库 ====================
echo -e "${BLUE}[5/9] 克隆Git仓库...${NC}"

# 如果目录已存在，先备份
if [ -d "$INSTALL_DIR" ]; then
  BACKUP_DIR="${INSTALL_DIR}.backup.$(date +%Y%m%d%H%M%S)"
  echo -e "${YELLOW}检测到已有项目目录，备份到: ${BACKUP_DIR}${NC}"
  mv "$INSTALL_DIR" "$BACKUP_DIR"
fi

# 创建目录并克隆
echo -e "${YELLOW}正在克隆仓库...${NC}"
git clone "$GIT_REPO" "$INSTALL_DIR"
cd "$INSTALL_DIR"

# 切换到指定commit
echo -e "${YELLOW}切换到指定版本: ${COMMIT_HASH}${NC}"
git checkout "$COMMIT_HASH"

# 显示当前版本信息
echo -e "${GREEN}✓ 当前版本: $(git log -1 --oneline)${NC}"

# ==================== 配置MySQL ====================
echo -e "${BLUE}[6/9] 配置MySQL数据库...${NC}"

# 创建数据库和用户的SQL
SQL_COMMANDS="
-- 创建数据库
CREATE DATABASE IF NOT EXISTS ${DB_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 创建用户（如果不存在）
CREATE USER IF NOT EXISTS '${DB_USER}'@'localhost' IDENTIFIED BY '${DB_PASSWORD}';

-- 授权给用户
GRANT ALL PRIVILEGES ON ${DB_NAME}.* TO '${DB_USER}'@'localhost';
FLUSH PRIVILEGES;
"

# 尝试连接MySQL并执行SQL
MYSQL_CONNECTED=false

# 尝试无密码root登录
if mysql -u root -e "SELECT 1" 2>/dev/null; then
  echo "${SQL_COMMANDS}" | mysql -u root
  MYSQL_CONNECTED=true
# 尝试sudo方式
elif sudo mysql -e "SELECT 1" 2>/dev/null; then
  echo "${SQL_COMMANDS}" | sudo mysql
  MYSQL_CONNECTED=true
fi

if [ "$MYSQL_CONNECTED" = false ]; then
  echo -e "${YELLOW}警告: 无法自动连接MySQL，请手动执行以下命令：${NC}"
  echo ""
  echo "sudo mysql -u root -p"
  echo ""
  echo "然后在MySQL中执行："
  echo "${SQL_COMMANDS}"
  echo ""
  echo "完成后按回车继续..."
  read
fi

echo -e "${GREEN}✓ MySQL数据库配置完成${NC}"

# ==================== 检查前端构建文件 ====================
echo -e "${BLUE}[7/9] 检查前端构建文件...${NC}"

if [ ! -d "${INSTALL_DIR}/frontend/dist" ]; then
  echo -e "${YELLOW}警告: 前端构建文件不存在${NC}"
  echo -e "${YELLOW}尝试查找 frontend-src/dist...${NC}"
  
  if [ -d "${INSTALL_DIR}/frontend-src/dist" ]; then
    echo -e "${GREEN}找到 frontend-src/dist，复制到 frontend/dist${NC}"
    mkdir -p "${INSTALL_DIR}/frontend/dist"
    cp -r "${INSTALL_DIR}/frontend-src/dist/"* "${INSTALL_DIR}/frontend/dist/"
  else
    echo -e "${RED}错误: 找不到前端构建文件${NC}"
    echo -e "${YELLOW}请确保仓库中包含已构建的前端文件 (frontend/dist 或 frontend-src/dist)${NC}"
    echo -e "${YELLOW}或者先在本地构建前端后再提交到仓库${NC}"
    exit 1
  fi
fi

echo -e "${GREEN}✓ 前端构建文件已就绪${NC}"

# ==================== 安装后端依赖 ====================
echo -e "${BLUE}[8/9] 安装后端依赖...${NC}"
cd "${INSTALL_DIR}/backend"

# 配置npm国内镜像源（可选，加速下载）
npm config set registry https://registry.npmmirror.com 2>/dev/null || true

# 安装依赖
npm install --production

echo -e "${GREEN}✓ 后端依赖安装完成${NC}"

# ==================== 初始化数据库 ====================
echo -e "${BLUE}[9/9] 初始化数据库...${NC}"

# 设置环境变量
export DB_HOST=localhost
export DB_USER=${DB_USER}
export DB_PASSWORD=${DB_PASSWORD}
export DB_NAME=${DB_NAME}

# 运行初始化脚本
if [ -f "${INSTALL_DIR}/backend/db/init-mysql.js" ]; then
  node "${INSTALL_DIR}/backend/db/init-mysql.js"
  echo -e "${GREEN}✓ 数据库初始化完成${NC}"
else
  echo -e "${YELLOW}警告: 找不到数据库初始化脚本${NC}"
fi

# ==================== 配置Nginx ====================
echo -e "${BLUE}配置Nginx...${NC}"

BACKEND_DIR="${INSTALL_DIR}/backend"
FRONTEND_DIR="${INSTALL_DIR}/frontend"
NGINX_CONF="/etc/nginx/sites-available/food-subscription"
SERVICE_FILE="/etc/systemd/system/food-subscription.service"

# 创建必要的目录
mkdir -p "${BACKEND_DIR}/uploads"

# 设置文件权限
chown -R www-data:www-data "${INSTALL_DIR}"
chmod 755 "${INSTALL_DIR}"
chmod 755 "${BACKEND_DIR}"
chmod 755 "${BACKEND_DIR}/uploads"

# 写入Nginx配置
cat > "${NGINX_CONF}" << EOF
server {
    listen 80;
    server_name ${SERVER_IP} _;
    root ${FRONTEND_DIR}/dist;
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
        alias ${BACKEND_DIR}/uploads/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# 启用Nginx配置
ln -sf "${NGINX_CONF}" /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# 测试Nginx配置
nginx -t

# 重启Nginx
systemctl restart nginx

echo -e "${GREEN}✓ Nginx配置完成${NC}"

# ==================== 配置systemd服务 ====================
echo -e "${BLUE}配置系统服务...${NC}"

cat > "${SERVICE_FILE}" << EOF
[Unit]
Description=Food Subscription Platform
After=network.target mysql.service
Wants=mysql.service

[Service]
Type=simple
User=www-data
WorkingDirectory=${BACKEND_DIR}
Environment="NODE_ENV=production"
Environment="PORT=3001"
Environment="DB_HOST=localhost"
Environment="DB_USER=${DB_USER}"
Environment="DB_PASSWORD=${DB_PASSWORD}"
Environment="DB_NAME=${DB_NAME}"
Environment="JWT_SECRET=${JWT_SECRET}"
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF

# 重新加载systemd
systemctl daemon-reload
systemctl enable food-subscription
systemctl restart food-subscription

# 等待服务启动
sleep 3

# 检查服务状态
if systemctl is-active --quiet food-subscription; then
  echo -e "${GREEN}✓ 后端服务启动成功${NC}"
else
  echo -e "${RED}✗ 后端服务启动失败${NC}"
  echo -e "${YELLOW}查看日志: sudo journalctl -u food-subscription -n 50${NC}"
  exit 1
fi

# ==================== 配置防火墙 ====================
echo -e "${BLUE}配置防火墙...${NC}"

# 配置UFW
if command -v ufw &> /dev/null; then
  ufw allow 80/tcp
  ufw allow 22/tcp
  echo "y" | ufw enable 2>/dev/null || true
  echo -e "${GREEN}✓ UFW防火墙配置完成${NC}"
fi

# ==================== 部署完成 ====================
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  🎉 部署成功！${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${BLUE}📋 部署信息:${NC}"
echo -e "  Git仓库: ${GIT_REPO}"
echo -e "  版本:    ${COMMIT_HASH}"
echo -e "  目录:    ${INSTALL_DIR}"
echo ""
echo -e "${BLUE}🌐 访问地址:${NC}"
echo -e "  ${GREEN}http://${SERVER_IP}${NC}"
echo ""
echo -e "${BLUE}👤 测试账号:${NC}"
echo "  管理员: admin@example.com / admin123"
echo "  商家:   merchant@example.com / merchant123"
echo "  用户:   user@example.com / user123"
echo ""
echo -e "${BLUE}🔧 常用命令:${NC}"
echo "  查看日志:     sudo journalctl -u food-subscription -f"
echo "  重启服务:     sudo systemctl restart food-subscription"
echo "  查看版本:     cd ${INSTALL_DIR} && git log -1 --oneline"
echo ""
echo -e "${YELLOW}提示: 如果无法访问，请检查服务器安全组/防火墙是否开放80端口${NC}"
echo ""
