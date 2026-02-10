# 快速开始指南

## 部署步骤

### 1. 上传项目到服务器

在你的本地电脑上，将 `food-subscription-v1.1` 文件夹上传到服务器：

```bash
# 使用 scp（将路径替换为你实际的文件夹路径）
scp -r food-subscription-v1.1 root@你的服务器IP:/var/www/
```

或者用 FTP 工具（如 FileZilla）上传。

### 2. 修复换行符（Windows上传必需）

```bash
ssh root@你的服务器IP
cd /var/www/food-subscription-v1.1

# 方法1：使用 Python
python3 fix-line-endings.py

# 方法2：使用 sed
sed -i 's/\r$//' deploy.sh
```

### 3. 运行部署脚本

```bash
cd /var/www/food-subscription-v1.1
sudo bash deploy.sh
```

部署脚本会自动：
- 安装 Nginx 和 Node.js（如果未安装）
- 安装后端依赖
- 初始化数据库和测试数据
- 配置 Nginx
- 启动后端服务

### 4. 访问系统

打开浏览器访问：
```
http://你的服务器IP:8080
```

## 测试账号

| 角色 | 邮箱 | 密码 |
|------|------|------|
| 管理员 | admin@example.com | admin123 |
| 商家 | merchant@example.com | merchant123 |
| 用户 | user@example.com | user123 |

## 常见问题

### Q: 部署脚本提示权限错误？
确保使用 `sudo` 运行：
```bash
sudo bash deploy.sh
```

### Q: 服务启动失败？
查看日志：
```bash
sudo journalctl -u food-subscription -n 50
```

### Q: 前端页面空白？
可能是 dist 目录为空，需要构建前端。参考 `BUILD-FRONTEND.md`。

### Q: 如何修改端口？
编辑 `nginx/food-subscription.conf` 中的 `listen 8080`，然后重新部署。

## 目录说明

```
food-subscription-v1.1/
├── backend/           # 后端代码（会自动部署到服务器）
├── frontend/          # 前端构建文件（dist目录）
├── nginx/             # Nginx配置
├── deploy.sh          # 一键部署脚本 ⭐
├── fix-line-endings.py # 换行符修复脚本
└── README.md          # 详细说明
```

## 卸载/清理

如果你想完全删除部署：

```bash
# 停止服务
sudo systemctl stop food-subscription
sudo systemctl disable food-subscription

# 删除文件
sudo rm -rf /var/www/food-subscription
sudo rm /etc/nginx/sites-available/food-subscription
sudo rm /etc/nginx/sites-enabled/food-subscription
sudo rm /etc/systemd/system/food-subscription.service

# 重启 nginx
sudo systemctl restart nginx
```
