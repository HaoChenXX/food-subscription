#!/bin/bash
#
# 配置修复脚本 - 只需输入服务器IP即可访问
# 使用方法: sudo bash fix-config.sh
#

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  食材包订阅平台 - 配置修复脚本${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# 检查是否为 root
if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}错误: 请使用 sudo 运行此脚本${NC}"
  exit 1
fi

# 获取服务器IP
echo -e "${YELLOW}正在检测服务器IP地址...${NC}"
SERVER_IP=$(hostname -I | awk '{print $1}')
echo -e "${GREEN}检测到服务器IP: ${SERVER_IP}${NC}"
echo ""

# 询问用户确认或修改IP
echo -e "${YELLOW}请确认服务器IP地址（直接回车使用上面检测到的IP）：${NC}"
read -p "> " INPUT_IP
if [ -n "$INPUT_IP" ]; then
  SERVER_IP=$INPUT_IP
fi

echo ""
echo -e "${GREEN}将使用IP地址: ${SERVER_IP}${NC}"
echo ""

# 获取当前项目目录
PROJECT_DIR="/var/www/food-subscription"
if [ ! -d "$PROJECT_DIR" ]; then
  # 如果标准目录不存在，尝试查找当前脚本所在目录
  SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
  if [ -f "$SCRIPT_DIR/backend/server.js" ]; then
    PROJECT_DIR="$SCRIPT_DIR"
    echo -e "${YELLOW}检测到项目目录: ${PROJECT_DIR}${NC}"
  else
    echo -e "${RED}错误: 找不到项目目录${NC}"
    echo -e "${YELLOW}请确保项目在 /var/www/food-subscription 目录，或从项目目录运行此脚本${NC}"
    exit 1
  fi
fi

BACKEND_DIR="${PROJECT_DIR}/backend"
FRONTEND_DIR="${PROJECT_DIR}/frontend"
NGINX_CONF="/etc/nginx/sites-available/food-subscription"
SERVICE_FILE="/etc/systemd/system/food-subscription.service"

echo -e "${GREEN}项目目录: ${PROJECT_DIR}${NC}"
echo ""

# ==================== 修复Nginx配置 ====================
echo -e "${BLUE}[1/5] 修复Nginx配置...${NC}"

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

echo -e "${GREEN}✓ Nginx配置已更新${NC}"

# ==================== 修复systemd服务配置 ====================
echo -e "${BLUE}[2/5] 修复系统服务配置...${NC}"

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
Environment="DB_USER=food_user"
Environment="DB_PASSWORD=food123456"
Environment="DB_NAME=food_subscription"
Environment="JWT_SECRET=your-secret-key-change-in-production"
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF

echo -e "${GREEN}✓ 系统服务配置已更新${NC}"

# ==================== 检查目录权限 ====================
echo -e "${BLUE}[3/5] 检查目录权限...${NC}"

# 确保目录存在
mkdir -p "${BACKEND_DIR}/uploads"
mkdir -p "${FRONTEND_DIR}/dist"

# 设置权限
chown -R www-data:www-data "${PROJECT_DIR}"
chmod 755 "${PROJECT_DIR}"
chmod 755 "${BACKEND_DIR}"
chmod 755 "${BACKEND_DIR}/uploads"

echo -e "${GREEN}✓ 目录权限已设置${NC}"

# ==================== 重启服务 ====================
echo -e "${BLUE}[4/5] 重启服务...${NC}"

# 测试Nginx配置
if nginx -t; then
  echo -e "${GREEN}✓ Nginx配置测试通过${NC}"
  
  # 启用配置
  ln -sf "${NGINX_CONF}" /etc/nginx/sites-enabled/
  rm -f /etc/nginx/sites-enabled/default
  
  # 重启Nginx
  systemctl restart nginx
  systemctl enable nginx
  echo -e "${GREEN}✓ Nginx已重启${NC}"
else
  echo -e "${RED}✗ Nginx配置测试失败${NC}"
  exit 1
fi

# 重新加载并重启后端服务
systemctl daemon-reload
systemctl enable food-subscription
systemctl restart food-subscription

# 等待服务启动
sleep 3

if systemctl is-active --quiet food-subscription; then
  echo -e "${GREEN}✓ 后端服务已启动${NC}"
else
  echo -e "${RED}✗ 后端服务启动失败${NC}"
  echo -e "${YELLOW}查看日志: sudo journalctl -u food-subscription -n 50${NC}"
  exit 1
fi

# ==================== 开放防火墙端口 ====================
echo -e "${BLUE}[5/5] 配置防火墙...${NC}"

# 检查并开放80端口
if command -v ufw &> /dev/null; then
  ufw allow 80/tcp
  ufw allow 3001/tcp
  echo -e "${GREEN}✓ UFW防火墙规则已添加${NC}"
fi

# 检查firewalld
if command -v firewall-cmd &> /dev/null; then
  firewall-cmd --permanent --add-port=80/tcp
  firewall-cmd --permanent --add-port=3001/tcp
  firewall-cmd --reload
  echo -e "${GREEN}✓ Firewalld防火墙规则已添加${NC}"
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  配置修复完成！${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${BLUE}访问地址:${NC}"
echo -e "  ${GREEN}http://${SERVER_IP}${NC}"
echo ""
echo -e "${BLUE}测试账号:${NC}"
echo "  管理员: admin@example.com / admin123"
echo "  商家:   merchant@example.com / merchant123"
echo "  用户:   user@example.com / user123"
echo ""
echo -e "${BLUE}常用命令:${NC}"
echo "  查看日志:   sudo journalctl -u food-subscription -f"
echo "  重启服务:   sudo systemctl restart food-subscription"
echo "  查看状态:   sudo systemctl status food-subscription"
echo "  重启Nginx:  sudo systemctl restart nginx"
echo ""
