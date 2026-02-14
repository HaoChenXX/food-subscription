# 食材包订阅平台 v1.2 更新日志

## 🚀 主要更新

### 1. 数据库升级 - MySQL 支持
- 从 JSON 文件存储迁移到 MySQL 数据库
- 支持完整的事务处理
- 更好的并发性能
- 数据库表结构：
  - `users` - 用户表
  - `food_packages` - 食材包表
  - `orders` - 订单表
  - `subscriptions` - 订阅表
  - `diet_profiles` - 饮食画像表
  - `addresses` - 地址表
  - `suppliers` - 供应商表
  - `inventory_logs` - 库存记录表
  - `payments` - 支付记录表
  - `uploads` - 上传文件表

### 2. Bug 修复
- ✅ **用户画像保存问题** - 修复了创建新用户后无法保存饮食画像的问题
- ✅ **库存修改问题** - 修复了商家端无法修改库存的问题，支持入库、出库、调整三种操作
- ✅ **模拟支付功能** - 修复了用户端无法模拟支付成功的问题，支持完整的支付流程

### 3. 图片上传功能
- 支持本地上传图片（最大 5MB）
- 支持 JPEG、PNG、GIF、WebP 格式
- 自动按日期分子目录存储
- 上传文件记录在数据库中
- API 端点：
  - `POST /api/upload/image` - 上传单张图片
  - `POST /api/upload/images` - 批量上传（最多5张）
  - `GET /api/upload/list` - 获取上传列表
  - `DELETE /api/upload/:id` - 删除上传的文件

### 4. API 改进
- 所有 API 返回统一格式的数据
- 更好的错误处理和日志记录
- JWT 认证增强，实时验证用户存在性
- 支持 CORS 跨域

## 📁 文件结构变化

```
backend/
├── db/
│   ├── config.js          # 数据库配置
│   ├── connection.js      # 数据库连接池
│   └── init-mysql.js      # 数据库初始化脚本
├── middleware/
│   ├── auth.js            # 认证中间件
│   └── upload.js          # 上传中间件
├── routes/
│   ├── auth.js            # 认证路由
│   ├── food-packages.js   # 食材包路由
│   ├── orders.js          # 订单路由（含支付）
│   ├── subscriptions.js   # 订阅路由
│   ├── diet-profile.js    # 饮食画像路由（修复版）
│   ├── addresses.js       # 地址路由
│   ├── upload.js          # 上传路由
│   └── admin.js           # 管理员路由
├── utils/
│   └── helpers.js         # 工具函数
├── uploads/               # 上传文件存储目录
├── server.js              # 主程序（重构版）
└── package.json           # 依赖（添加 mysql2）
```

## 🚀 部署说明

### 方式一：使用 v1_2.sh 一键部署（推荐）

1. 将整个项目上传到服务器：
```bash
scp -r food-subscription-v1.1 root@你的服务器IP:/var/www/
```

2. SSH 登录服务器并运行部署脚本：
```bash
ssh root@你的服务器IP
cd /var/www/food-subscription-v1.1
sudo bash v1_2.sh
```

脚本会自动完成：
- 安装 Nginx、MySQL、Node.js
- 创建数据库和表
- 安装依赖
- 初始化数据
- 配置 Nginx
- 启动服务

### 方式二：手动部署

1. 安装 MySQL：
```bash
sudo apt-get install mysql-server
sudo mysql -e "CREATE DATABASE food_subscription CHARACTER SET utf8mb4;"
```

2. 安装依赖：
```bash
cd backend
npm install
```

3. 初始化数据库：
```bash
node db/init-mysql.js
```

4. 启动服务：
```bash
npm start
```

## 🔧 环境变量

| 变量名 | 默认值 | 说明 |
|--------|--------|------|
| `PORT` | 3001 | 后端服务端口 |
| `DB_HOST` | localhost | 数据库主机 |
| `DB_USER` | root | 数据库用户名 |
| `DB_PASSWORD` | "" | 数据库密码 |
| `DB_NAME` | food_subscription | 数据库名 |
| `JWT_SECRET` | 随机生成 | JWT 密钥 |

## 📝 数据库配置

默认使用 root 用户，无密码。如需修改：

1. 修改 `backend/db/config.js`
2. 或在 systemd 服务中设置环境变量
3. 重启服务

## 🔍 故障排查

### 服务无法启动
```bash
# 查看日志
sudo journalctl -u food-subscription-v1.2 -n 50

# 检查 MySQL
sudo systemctl status mysql
sudo mysql -u root -e "SHOW DATABASES;"
```

### 数据库连接失败
```bash
# 检查 MySQL 是否运行
sudo systemctl start mysql

# 检查数据库是否存在
sudo mysql -u root -e "CREATE DATABASE IF NOT EXISTS food_subscription;"
```

### 图片上传失败
```bash
# 检查上传目录权限
sudo chown -R www-data:www-data /var/www/food-subscription-v1.2/backend/uploads
sudo chmod 755 /var/www/food-subscription-v1.2/backend/uploads
```

## 🎯 后续计划

- [ ] 添加 Redis 缓存
- [ ] 实现真实的支付接口（微信/支付宝）
- [ ] 添加定时任务（订阅配送）
- [ ] 前端图片上传组件
- [ ] 图片压缩和缩略图生成

## 📞 支持

如遇到问题，请提供：
1. `sudo journalctl -u food-subscription-v1.2 -n 50`
2. `sudo mysql -u root -e "SHOW DATABASES;"`
3. `curl http://localhost:3001/api/health`
