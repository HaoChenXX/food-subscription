# 食材包订阅平台 - 全新服务器部署教程

> 本文档手把手教你将项目部署到全新的服务器上
> 
> 适用系统：Ubuntu 20.04/22.04 / Debian 11/12

---

## 📋 准备工作

### 1. 服务器要求

- **系统**: Ubuntu 20.04/22.04 LTS 或 Debian 11/12
- **内存**: 至少 1GB RAM（推荐 2GB）
- **磁盘**: 至少 10GB 可用空间
- **网络**: 服务器需要能够访问外网（下载依赖）

### 2. 需要准备的工具

- SSH客户端（Windows可用PowerShell、PuTTY或Termius）
- 文件传输工具（WinSCP、FileZilla 或直接 scp 命令）

### 3. 开放端口

确保服务器防火墙/安全组开放以下端口：
- `22` - SSH连接（必需）
- `80` - HTTP访问（必需）

---

## 🚀 部署步骤

### 第一步：连接服务器

```bash
# 使用SSH连接到你的服务器（替换为你的服务器IP）
ssh root@你的服务器IP
```

### 第二步：上传项目文件

**方式A：使用 Git（推荐，如果项目已在GitHub/GitLab）**

```bash
# 安装git
apt-get update && apt-get install -y git

# 克隆项目（替换为你的仓库地址）
cd /var/www
git clone https://github.com/yourusername/food-subscription.git

# 或者如果是私有仓库，先上传SSH密钥再克隆
```

**方式B：直接上传压缩包（适合没有Git的情况）**

1. 在本地将项目文件夹压缩为 `food-subscription.zip`
2. 使用 WinSCP 或 scp 上传到服务器的 `/var/www/` 目录
3. 在服务器上解压：

```bash
# 进入/var/www目录
cd /var/www

# 解压项目
unzip food-subscription.zip

# 如果解压后的文件夹名不对，重命名
mv food-subscription-v01.1-backup food-subscription
```

### 第三步：运行部署脚本

```bash
# 进入项目目录
cd /var/www/food-subscription

# 给脚本执行权限
chmod +x deploy-full.sh

# 运行部署脚本
sudo bash deploy-full.sh
```

部署脚本会自动完成以下操作：
1. ✅ 安装 Nginx
2. ✅ 安装 MySQL
3. ✅ 安装 Node.js 20
4. ✅ 创建数据库和用户
5. ✅ 安装后端依赖
6. ✅ 初始化数据库表和测试数据
7. ✅ 配置 Nginx（使用80端口）
8. ✅ 配置系统服务（开机自启）

### 第四步：访问网站

部署完成后，脚本会显示访问地址：

```
🎉 部署成功！

🌐 访问地址:
  http://你的服务器IP

👤 测试账号:
  管理员: admin@example.com / admin123
  商家:   merchant@example.com / merchant123
  用户:   user@example.com / user123
```

直接在浏览器中输入 `http://你的服务器IP` 即可访问！

---

## 🔧 常见问题排查

### 问题1：无法访问网站

**检查步骤：**

1. **检查服务状态**
```bash
sudo systemctl status food-subscription
sudo systemctl status nginx
```

2. **查看服务日志**
```bash
sudo journalctl -u food-subscription -n 50
```

3. **检查端口监听**
```bash
netstat -tlnp | grep -E '80|3001'
# 或
ss -tlnp | grep -E '80|3001'
```

4. **检查防火墙**
```bash
# 查看UFW状态
sudo ufw status

# 查看firewalld状态
sudo firewall-cmd --list-all
```

5. **测试本地访问**
```bash
curl http://localhost
```

### 问题2：数据库连接失败

```bash
# 测试MySQL连接
sudo mysql -u food_user -pfood123456 food_subscription -e "SELECT 1"

# 如果失败，重新创建用户
sudo mysql -e "
CREATE USER IF NOT EXISTS 'food_user'@'localhost' IDENTIFIED BY 'food123456';
GRANT ALL PRIVILEGES ON food_subscription.* TO 'food_user'@'localhost';
FLUSH PRIVILEGES;
"
```

### 问题3：后端服务无法启动

```bash
# 手动运行查看错误
cd /var/www/food-subscription/backend
sudo node server.js

# 检查依赖是否安装
npm list
```

### 问题4：前端显示404

```bash
# 检查前端文件是否存在
ls -la /var/www/food-subscription/frontend/dist/

# 如果不存在，需要从本地构建后上传
```

### 问题5：图片上传失败

```bash
# 检查上传目录权限
ls -la /var/www/food-subscription/backend/uploads/

# 修复权限
sudo chown -R www-data:www-data /var/www/food-subscription/backend/uploads
sudo chmod 755 /var/www/food-subscription/backend/uploads
```

---

## 🔒 安全配置（生产环境必需）

### 1. 修改数据库密码

```bash
# 生成强密码
openssl rand -base64 24

# 修改数据库用户密码
sudo mysql -e "ALTER USER 'food_user'@'localhost' IDENTIFIED BY '你的新密码'; FLUSH PRIVILEGES;"

# 修改后端配置
sudo nano /var/www/food-subscription/backend/db/config.js
sudo nano /etc/systemd/system/food-subscription.service

# 重启服务
sudo systemctl daemon-reload
sudo systemctl restart food-subscription
```

### 2. 修改JWT密钥

```bash
# 生成新的JWT密钥
openssl rand -hex 32

# 修改服务配置
sudo nano /etc/systemd/system/food-subscription.service
# 修改 Environment="JWT_SECRET=你的新密钥"

sudo systemctl daemon-reload
sudo systemctl restart food-subscription
```

### 3. 配置HTTPS（使用Let's Encrypt）

```bash
# 安装Certbot
sudo apt-get install -y certbot python3-certbot-nginx

# 申请证书（替换为你的域名）
sudo certbot --nginx -d yourdomain.com

# 自动续期测试
sudo certbot renew --dry-run
```

---

## 📦 更新部署

### 更新后端代码

```bash
cd /var/www/food-subscription

# 拉取最新代码
git pull origin main

# 安装依赖（如果有更新）
cd backend
npm install --production

# 重启服务
sudo systemctl restart food-subscription
```

### 更新前端代码

```bash
# 在本地构建前端
cd frontend-src
npm run build

# 上传到服务器（使用scp或WinSCP）
scp -r dist/* root@服务器IP:/var/www/food-subscription/frontend/dist/
```

### 使用修复配置脚本

如果只需要修复Nginx配置或更换服务器IP：

```bash
cd /var/www/food-subscription
sudo bash fix-config.sh
```

---

## 📝 常用命令速查

```bash
# ========== 服务管理 ==========
# 查看后端日志（实时）
sudo journalctl -u food-subscription -f

# 查看后端最近100行日志
sudo journalctl -u food-subscription -n 100

# 重启后端服务
sudo systemctl restart food-subscription

# 停止后端服务
sudo systemctl stop food-subscription

# 查看服务状态
sudo systemctl status food-subscription

# ========== Nginx管理 ==========
# 重启Nginx
sudo systemctl restart nginx

# 测试Nginx配置
sudo nginx -t

# 查看Nginx错误日志
sudo tail -f /var/log/nginx/error.log

# ========== 数据库管理 ==========
# 登录MySQL
sudo mysql -u food_user -pfood123456 food_subscription

# 备份数据库
mysqldump -u food_user -pfood123456 food_subscription > backup.sql

# 恢复数据库
mysql -u food_user -pfood123456 food_subscription < backup.sql

# ========== 文件权限 ==========
# 修复项目权限
sudo chown -R www-data:www-data /var/www/food-subscription
sudo chmod 755 /var/www/food-subscription/backend/uploads
```

---

## 💡 提示

1. **首次部署后**，建议立即修改默认密码和JWT密钥
2. **定期备份**数据库，避免数据丢失
3. **监控服务器资源**使用情况，特别是内存和磁盘
4. **启用HTTPS**保护用户数据安全

---

## 🆘 获取帮助

如果遇到问题：

1. 查看服务日志：`sudo journalctl -u food-subscription -n 50`
2. 检查Nginx配置：`sudo nginx -t`
3. 测试API接口：`curl http://localhost:3001/api/food-packages`

---

**祝你部署顺利！** 🎉
