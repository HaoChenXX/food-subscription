# 食材包订阅平台 🍱

基于 React + Node.js 的食材包订阅电商系统，支持用户订阅、商家管理、管理员后台三大角色。

## ✨ 功能特性

- 👤 **用户端**：浏览食材包、饮食画像、下单订阅、订单管理
- 🏪 **商家端**：商品管理、库存管理、订单处理
- 👨‍💼 **管理端**：用户管理、数据报表、系统监控

## 🚀 快速开始

### 环境要求
- Node.js >= 18
- npm >= 9

### 安装依赖

```bash
# 后端依赖
cd backend
npm install

# 初始化数据库
node scripts/init-db.js

# 启动后端
npm start
```

### 前端开发

```bash
cd frontend-src
npm install
npm run dev
```

### 生产部署

**服务器地址**: `39.104.25.212`

```bash
# 在服务器上更新代码
cd /var/www/food-subscription-v01.1-backup
python3 update-server.py

# 或手动更新
git pull origin main
pm2 restart food-subscription
```

## 📁 项目结构

```
food-subscription/
├── backend/           # Node.js 后端
│   ├── data/         # JSON 数据库
│   ├── scripts/      # 初始化脚本
│   ├── uploads/      # 上传文件
│   └── server.js     # 主程序
├── frontend/          # 生产构建文件
│   └── dist/
├── frontend-src/      # React 前端源码
├── nginx/             # Nginx 配置
└── deploy.sh          # 部署脚本
```

## 🔑 默认账号

| 角色 | 邮箱 | 密码 |
|------|------|------|
| 管理员 | admin@example.com | admin123 |
| 商家 | merchant@example.com | merchant123 |
| 用户 | user@example.com | user123 |

## 🛠️ 技术栈

- **前端**：React 19 + TypeScript + Vite + Tailwind CSS + shadcn/ui
- **后端**：Node.js 20 + Express
- **数据库**：JSON 文件存储（可升级 SQLite）
- **部署**：Nginx + systemd

## 📝 许可证

MIT License
