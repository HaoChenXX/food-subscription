# 食材包订阅平台 🍱

基于 React + Node.js 的智能食材包订阅电商系统，支持用户订阅、商家管理、管理员后台三大角色。

**在线演示**: http://39.104.25.212:8080

---

## ✨ 功能特性

### 👤 用户端
- 🔍 浏览食材包，查看详情和营养信息
- 🥬 **食材溯源**：查看食材包包含的食材、产地、库存状态
- 📝 饮食画像定制，获取个性化推荐
- 🛒 购物车管理，支持订阅模式
  - 侧边栏快速查看购物车
  - 支持调整商品数量 (+/-)
  - 支持删除单个商品
  - 支持一键清空购物车
- 📦 订单管理，实时查看订单状态
- 💳 在线支付，一键完成订单
- 📍 收货地址管理

### 🏪 商家端
- 📋 商品管理（上架/下架/编辑）
- 📊 库存管理，自动预警
- 📦 订单处理（准备/发货/送达）
- 📈 销售数据统计

### 👨‍💼 管理端
- 👥 用户管理（查看/删除/统计）
- 📦 全平台订单监控
- 📊 数据报表（用户/订单/营收）
- ⚙️ 系统配置管理

---

## 🚀 快速开始

### 环境要求
- Node.js >= 18
- npm >= 9
- MySQL >= 8.0

### 本地开发

#### 1. 克隆代码

```bash
# 从 GitHub 克隆
git clone git@github.com:HaoChenXX/food-subscription.git

# 或从华为云 CodeArts 克隆
git clone git@codehub.devcloud.cn-north-4.huaweicloud.com:a384bf0b99f140dbaa16281939ab38b1/huawei_food_subscription.git
```

#### 2. 后端启动

```bash
cd backend

# 安装依赖
npm install

# 配置数据库（修改 backend/db/config.js）
# 默认配置：
# - 数据库: food_subscription
# - 用户名: food_user
# - 密码: food123456

# 初始化数据库
node db/init-mysql.js

# 启动服务
npm start
# 或开发模式
npm run dev
```

后端服务默认运行在 http://localhost:3001

#### 3. 前端开发

```bash
cd frontend-src

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

前端开发服务器运行在 http://localhost:5173

#### 4. 生产构建

```bash
cd frontend-src
npm run build

# 构建后的文件在 frontend/dist/
```

---

## 📦 服务器部署

### 服务器信息

- **IP**: 39.104.25.212
- **端口**: 8080 (Nginx)
- **后端**: 3001 (Node.js)

### 一键更新

在服务器上执行：

```bash
cd /var/www/food-subscription-v01.1-backup
python3 update-server.py
```

update-server.py 会自动完成：
1. 备份当前版本
2. 拉取最新代码（从华为云 CodeArts）
3. 同步前端构建文件
4. 添加版本标识
5. 安装后端依赖
6. 重启服务

### 手动更新

```bash
cd /var/www/food-subscription-v01.1-backup

# 拉取代码
git pull origin main

# 同步前端文件
cp -r frontend-src/dist/* frontend/dist/

# 安装依赖
cd backend && npm install --production

# 重启服务
pm2 restart food-subscription-backend
# 或
sudo systemctl restart food-subscription
```

---

## 🏗️ 项目结构

```
food-subscription/
├── backend/                    # Node.js 后端
│   ├── db/                     # 数据库配置和初始化
│   │   ├── config.js           # 数据库配置
│   │   └── init-mysql.js       # 初始化脚本
│   ├── middleware/             # Express 中间件
│   │   ├── auth.js             # JWT 认证
│   │   └── upload.js           # 文件上传
│   ├── routes/                 # API 路由
│   │   ├── auth.js             # 认证接口
│   │   ├── orders.js           # 订单接口
│   │   ├── food-packages.js    # 食材包接口
│   │   ├── admin.js            # 管理员接口
│   │   └── ...
│   ├── uploads/                # 上传文件目录
│   ├── server.js               # 主入口
│   └── package.json
├── frontend-src/               # React 前端源码
│   ├── src/
│   │   ├── api/                # API 客户端
│   │   ├── components/         # 组件库
│   │   ├── pages/              # 页面
│   │   │   ├── user/           # 用户端
│   │   │   ├── merchant/       # 商家端
│   │   │   └── admin/          # 管理端
│   │   ├── store/              # Zustand 状态管理
│   │   └── types/              # TypeScript 类型
│   └── package.json
├── frontend/                   # 生产构建输出
│   └── dist/
├── nginx/                      # Nginx 配置
│   └── food-subscription.conf
├── update-server.py            # 服务器更新脚本
└── README.md
```

---

## 🔑 默认账号

| 角色 | 邮箱 | 密码 | 说明 |
|------|------|------|------|
| 管理员 | admin@example.com | admin123 | 全平台管理权限 |
| 商家 | merchant@example.com | merchant123 | 商品和订单管理 |
| 用户 | user@example.com | user123 | 浏览和下单 |

---

## 🔌 API 接口

### 认证接口
- `POST /api/auth/login` - 登录
- `POST /api/auth/register` - 注册
- `GET /api/auth/profile` - 获取用户信息

### 订单接口
- `GET /api/orders` - 获取我的订单
- `GET /api/orders/:id` - 订单详情
- `POST /api/orders` - 创建订单
- `POST /api/orders/:id/pay` - 支付订单
- `POST /api/orders/:id/cancel` - 取消订单

### 食材包接口
- `GET /api/food-packages` - 获取食材包列表
- `GET /api/food-packages/:id` - 食材包详情

### 管理员接口
- `GET /api/admin/users` - 获取所有用户
- `GET /api/admin/orders` - 获取所有订单
- `GET /api/admin/statistics` - 统计数据

### 商家接口
- `GET /api/food-packages/merchant/orders` - 获取商家订单

---

## ⚙️ 环境变量

### 后端 (.env)
```
PORT=3001
DB_HOST=localhost
DB_USER=food_user
DB_PASSWORD=food123456
DB_NAME=food_subscription
JWT_SECRET=your-secret-key
NODE_ENV=production
```

---

## 🛠️ 技术栈

### 前端
- **框架**: React 19 + TypeScript
- **构建**: Vite 7
- **样式**: Tailwind CSS 3.4
- **UI 组件**: shadcn/ui
- **状态管理**: Zustand 5
- **路由**: React Router 7
- **HTTP**: Fetch API

### 后端
- **运行时**: Node.js 20+
- **框架**: Express 4.18
- **数据库**: MySQL 8
- **认证**: JWT
- **密码加密**: bcryptjs
- **文件上传**: Multer

### 部署
- **Web 服务器**: Nginx
- **进程管理**: PM2 / systemd
- **代码托管**: GitHub + 华为云 CodeArts

---

## 🐛 问题排查

### 订单支付后消失
**状态**: ⚠️ 已知问题，待修复

**问题描述**: 用户支付成功后，订单没有出现在订单列表中

**可能原因**:
1. 前端和后端数据格式不匹配（已修复）
2. API 认证或权限问题
3. 数据库查询条件不正确

**临时解决方案**:
1. 检查浏览器控制台网络请求
2. 确认后端 `/api/orders` 接口正常返回
3. 查看后端服务日志了解详细错误

### 无法登录

### 无法登录
1. 检查后端服务是否运行
2. 确认数据库用户表有数据
3. 检查 localStorage 中的 token

### 更新后未生效
1. 确认 `update-server.py` 执行成功
2. 检查 Nginx 配置路径是否正确
3. 强制刷新浏览器缓存 (Ctrl+F5)

---

## 📄 双仓库配置

项目同时推送到 GitHub 和华为云 CodeArts：

```bash
# 查看远程仓库
git remote -v

# 推送到华为云（服务器使用）
git push origin main

# 推送到 GitHub（备份）
git push github main

# 同时推送
git push origin main && git push github main
```

### 仓库地址
- **GitHub**: https://github.com/HaoChenXX/food-subscription
- **CodeArts**: git@codehub.devcloud.cn-north-4.huaweicloud.com:a384bf0b99f140dbaa16281939ab38b1/huawei_food_subscription.git

---

## 📝 版本历史

- **v2.1** (当前): 购物车增强（删除/清空/数量调整）、食材溯源展示
- **v2.0**: MySQL 数据库、版本标识、支付功能完善
- **v1.2**: 用户/商家/管理员三端分离
- **v1.1**: 基础功能完善
- **v1.0**: 初始版本

---

## 📜 许可证

MIT License
