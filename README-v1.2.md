# 食材包订阅平台 v1.2 部署指南

## 📦 版本特性

v1.2 版本主要升级：
1. **MySQL 数据库** - 替代 JSON 文件存储
2. **本地图片上传** - 支持本地上传和保存图片
3. **Bug 修复** - 修复用户画像、库存修改、支付功能

## 🚀 快速部署

### 1. 上传到服务器

```bash
# 在本地项目目录执行
scp -r food-subscription-v1.1 root@你的服务器IP:/var/www/
```

### 2. 运行部署脚本

```bash
# SSH 登录服务器
ssh root@你的服务器IP

# 进入项目目录
cd /var/www/food-subscription-v1.1

# 运行部署脚本（会自动安装 MySQL、Node.js 等）
sudo bash v1_2.sh
```

### 3. 等待部署完成

脚本会自动完成所有配置，成功后显示：
```
========================================
  部署成功！
========================================
访问地址: http://你的IP:8080
```

## 🔧 手动配置（可选）

如果需要修改数据库配置：

```bash
# 编辑数据库配置
sudo nano /var/www/food-subscription-v1.2/backend/db/config.js

# 重启服务
sudo systemctl restart food-subscription-v1.2
```

## ✅ 验证部署

```bash
# 检查服务状态
sudo systemctl status food-subscription-v1.2

# 测试 API
curl http://localhost:3001/api/health

# 查看日志
sudo journalctl -u food-subscription-v1.2 -f
```

## 📂 重要文件

| 文件 | 说明 |
|------|------|
| `v1_2.sh` | 一键部署脚本 |
| `backend/db/init-mysql.js` | 数据库初始化 |
| `CHANGELOG-v1.2.md` | 详细更新日志 |

## ⚠️ 注意事项

1. **首次部署需要联网** - 脚本会自动下载安装 MySQL、Node.js
2. **MySQL 默认无密码** - 如需设置密码，请修改 `backend/db/config.js`
3. **上传目录** - 图片存储在 `backend/uploads/` 目录
4. **端口** - 前端 8080，后端 API 3001

## 🐛 常见问题

### Q: 提示 "mysql: command not found"
A: 脚本会自动安装 MySQL，如失败请手动安装：
```bash
sudo apt-get update
sudo apt-get install mysql-server
```

### Q: 数据库连接失败
A: 检查 MySQL 是否运行：
```bash
sudo systemctl start mysql
sudo mysql -u root -e "SHOW DATABASES;"
```

### Q: 图片上传失败
A: 检查目录权限：
```bash
sudo chown -R www-data:www-data /var/www/food-subscription-v1.2/backend/uploads
```

## 📞 技术支持

如遇到问题，请提供以下信息：
```bash
# 服务日志
sudo journalctl -u food-subscription-v1.2 -n 50

# MySQL 状态
sudo systemctl status mysql

# API 测试
curl http://localhost:3001/api/health
```
