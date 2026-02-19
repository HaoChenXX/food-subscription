# AGENTS.md - AI Coding Agent Guide

> 本文档面向 AI 编程助手，帮助快速理解和上手本项目。
> 项目语言：中文 / Chinese

## 项目概述

**食材包订阅平台** (Food Subscription Platform) 是一个面向中国市场的食材包订阅电商系统，支持三类用户角色：

- **用户端** (User): 浏览食材包、管理饮食画像、下单订阅、查看订单
- **商家端** (Merchant): 商品管理、库存管理、订单处理
- **管理端** (Admin): 用户管理、数据报表、系统监控

项目版本：v1.2 (MySQL版)

## 技术栈

### 前端 (frontend-src/)
- **框架**: React 19 + TypeScript
- **构建工具**: Vite 7
- **样式**: Tailwind CSS 3.4
- **UI组件库**: shadcn/ui (50+ 组件，基于 Radix UI)
- **状态管理**: Zustand 5 (持久化存储)
- **表单处理**: React Hook Form + Zod 验证
- **路由**: React Router 7
- **HTTP客户端**: Fetch API (原生)
- **图表**: Recharts
- **其他**: TanStack Query, date-fns, sonner(通知)

### 后端 (backend/)
- **运行时**: Node.js 20+
- **框架**: Express 4.18
- **数据库**: MySQL 8 (mysql2驱动)
- **认证**: JWT (jsonwebtoken)
- **密码加密**: bcryptjs
- **文件上传**: Multer
- **CORS**: cors

### 部署与运维
- **Web服务器**: Nginx (端口8080)
- **进程管理**: systemd
- **自动化部署**: GitHub Actions + SSH
- **支持平台**: Ubuntu/Debian Linux

## 项目结构

```
food-subscription/
├── backend/                    # Node.js 后端
│   ├── db/                     # 数据库相关
│   │   ├── config.js           # 数据库配置
│   │   ├── connection.js       # 连接池管理
│   │   └── init-mysql.js       # 数据库初始化脚本
│   ├── middleware/             # Express中间件
│   │   ├── auth.js             # JWT认证中间件
│   │   └── upload.js           # 文件上传中间件
│   ├── routes/                 # API路由
│   │   ├── auth.js             # 认证相关(登录/注册)
│   │   ├── food-packages.js    # 食材包管理
│   │   ├── orders.js           # 订单处理
│   │   ├── subscriptions.js    # 订阅管理
│   │   ├── diet-profile.js     # 饮食画像
│   │   ├── addresses.js        # 地址管理
│   │   ├── upload.js           # 文件上传
│   │   └── admin.js            # 管理员接口
│   ├── utils/                  # 工具函数
│   │   └── helpers.js          # 数据格式化等
│   ├── uploads/                # 上传文件存储目录
│   ├── server.js               # 主入口文件
│   └── package.json
├── frontend-src/               # React前端源码
│   ├── src/
│   │   ├── api/                # API客户端
│   │   │   ├── api.ts          # 真实API实现
│   │   │   ├── mock.ts         # Mock数据(备用)
│   │   │   └── index.ts        # 导出文件
│   │   ├── components/         # React组件
│   │   │   └── ui/             # shadcn/ui组件库
│   │   ├── pages/              # 页面组件
│   │   │   ├── admin/          # 管理端页面
│   │   │   ├── merchant/       # 商家端页面
│   │   │   └── user/           # 用户端页面
│   │   ├── store/              # Zustand状态管理
│   │   │   └── index.ts        # 所有store定义
│   │   ├── types/              # TypeScript类型定义
│   │   │   └── index.ts
│   │   ├── hooks/              # 自定义React Hooks
│   │   ├── lib/                # 工具函数库
│   │   ├── App.tsx             # 应用主组件(含路由)
│   │   ├── main.tsx            # 入口文件
│   │   └── index.css           # 全局样式
│   ├── public/                 # 静态资源
│   ├── vite.config.ts          # Vite配置
│   ├── tsconfig.json           # TypeScript配置
│   └── package.json
├── frontend/                   # 生产构建输出目录
│   └── dist/                   # Nginx服务的静态文件
├── nginx/                      # Nginx配置
│   └── food-subscription.conf  # 站点配置文件
├── deploy.sh                   # 部署脚本(v1.1)
├── v1_2.sh                     # 部署脚本(v1.2, 推荐)
└── .github/workflows/          # GitHub Actions
    └── deploy.yml              # 自动部署配置
```

## 开发命令

### 前端开发
```bash
cd frontend-src
npm install              # 安装依赖
npm run dev             # 启动开发服务器 (http://localhost:5173)
npm run build           # 生产构建 (输出到 frontend/dist/)
npm run lint            # 运行 ESLint
```

### 后端开发
```bash
cd backend
npm install             # 安装依赖
npm start               # 启动生产服务器 (端口3001)
npm run dev             # 开发模式 (nodemon热重载)
npm run init-db         # 初始化数据库
```

### 部署
```bash
# 一键部署 (需要root权限，在服务器上执行)
sudo bash v1_2.sh

# 或使用旧版部署脚本
sudo bash deploy.sh
```

## 架构设计

### 前端架构

#### 路由结构
- `/` - 用户端首页 (自动根据角色跳转)
- `/login` - 登录页
- `/register` - 注册页
- `/packages/*` - 食材包浏览
- `/orders` - 订单管理
- `/subscriptions` - 订阅管理
- `/cart` - 购物车
- `/checkout` - 结算页
- `/diet-profile` - 饮食画像
- `/addresses` - 收货地址
- `/merchant/*` - 商家端 (需merchant或admin角色)
- `/admin/*` - 管理端 (需admin角色)

#### 状态管理 (Zustand)
```typescript
useAuthStore        // 认证状态 (持久化)
useCartStore        // 购物车 (持久化)
useOrderStore       // 订单状态
useSubscriptionStore // 订阅状态
useDietProfileStore // 饮食画像 (持久化)
useAddressStore     // 地址管理 (持久化)
useUIStore          // UI状态 (持久化)
```

#### 组件规范
- 使用 **shadcn/ui** 作为基础组件库
- 页面组件放在 `pages/` 目录，按角色分子目录
- 业务组件放在 `components/` 根目录
- 所有组件使用 TypeScript
- 样式优先使用 Tailwind CSS 工具类

### 后端架构

#### API 路由结构
- `POST /api/auth/login` - 登录
- `POST /api/auth/register` - 注册
- `GET /api/auth/profile` - 获取用户信息
- `PUT /api/auth/profile` - 更新用户信息
- `GET /api/food-packages` - 获取食材包列表
- `GET /api/food-packages/:id` - 获取食材包详情
- `POST /api/food-packages` - 创建食材包 (需认证)
- `PUT /api/food-packages/:id` - 更新食材包 (需认证)
- `DELETE /api/food-packages/:id` - 删除食材包 (需认证)
- `GET /api/orders` - 订单列表
- `POST /api/orders` - 创建订单
- `POST /api/orders/:id/pay` - 模拟支付
- `GET /api/subscriptions` - 订阅列表
- `POST /api/subscriptions` - 创建订阅
- `GET /api/diet-profile` - 获取饮食画像
- `POST /api/diet-profile` - 创建/更新饮食画像
- `GET /api/addresses` - 地址列表
- `POST /api/upload/image` - 上传图片
- `GET /api/admin/*` - 管理员接口

#### 认证流程
1. 用户登录/注册后，后端生成 JWT Token
2. Token 存储在 `localStorage` (通过 Zustand 持久化)
3. 受保护接口需在 Header 中携带 `Authorization: Bearer <token>`
4. `authMiddleware` 验证 Token 有效性并查询用户是否存在
5. 角色权限通过 `adminMiddleware` / `merchantMiddleware` 检查

### 数据库设计

#### 核心表结构
```sql
users              # 用户表 (id, email, password, name, role, avatar)
food_packages      # 食材包表 (id, name, price, stock_quantity, merchant_id, ...)
orders             # 订单表 (id, user_id, package_id, total_amount, status, ...)
subscriptions      # 订阅表 (id, user_id, package_id, frequency, status, ...)
diet_profiles      # 饮食画像表 (user_id, age, gender, health_goals, ...)
addresses          # 地址表 (user_id, province, city, detail_address, is_default)
suppliers          # 供应商表
inventory_logs     # 库存变动记录
payments           # 支付记录
uploads            # 上传文件记录
```

#### 连接配置 (backend/db/config.js)
```javascript
{
  host: 'localhost',
  user: 'food_user',
  password: 'food123456',
  database: 'food_subscription',
  charset: 'utf8mb4'
}
```

## 环境变量

### 后端环境变量
| 变量名 | 默认值 | 说明 |
|--------|--------|------|
| `PORT` | 3001 | 服务端口 |
| `DB_HOST` | localhost | 数据库主机 |
| `DB_USER` | food_user | 数据库用户名 |
| `DB_PASSWORD` | food123456 | 数据库密码 |
| `DB_NAME` | food_subscription | 数据库名 |
| `JWT_SECRET` | random | JWT签名密钥 |
| `NODE_ENV` | production | 运行环境 |

### 前端配置
- API 基础 URL 通过 Vite 代理配置
- 生产环境使用相对路径 `/api`

## 代码规范

### 命名约定
- **组件**: PascalCase (如 `UserDashboard.tsx`)
- **文件/目录**: kebab-case (如 `food-packages.js`)
- **变量/函数**: camelCase (如 `getUserProfile`)
- **常量**: UPPER_SNAKE_CASE
- **类型/接口**: PascalCase (如 `FoodPackage`)

### 导入顺序
1. React/框架核心
2. 第三方库
3. 本地组件
4. 工具函数/类型
5. 样式文件

### 错误处理
- 后端: 使用 Express 错误处理中间件，统一返回 `{ message: '错误描述' }`
- 前端: API 错误通过 try-catch 捕获，使用 sonner 显示通知

### 类型定义
- 所有数据类型定义在 `frontend-src/src/types/index.ts`
- 后端使用 JSDoc 注释说明类型

## 测试账号

| 角色 | 邮箱 | 密码 |
|------|------|------|
| 管理员 | admin@example.com | admin123 |
| 商家 | merchant@example.com | merchant123 |
| 普通用户 | user@example.com | user123 |

## 部署流程

### 首次部署
1. 将项目上传到服务器 `/var/www/`
2. 运行 `sudo bash v1_2.sh`
3. 脚本会自动安装 Nginx、MySQL、Node.js
4. 自动初始化数据库和创建默认账号

### 更新部署 (GitHub Actions)
- 代码推送到 `main` 分支自动触发
- 服务器路径: `/var/www/food-subscription`
- 执行 `git pull` 后重启服务

### 手动更新
```bash
ssh root@服务器IP
cd /var/www/food-subscription
git pull origin main
cd backend && npm install --production
sudo systemctl restart food-subscription
```

## 常见问题排查

### 服务无法启动
```bash
# 查看日志
sudo journalctl -u food-subscription -f

# 检查MySQL
sudo systemctl status mysql
sudo mysql -u root -e "SHOW DATABASES;"
```

### 数据库连接失败
- 检查 `backend/db/config.js` 配置
- 确认 MySQL 用户权限: `GRANT ALL PRIVILEGES ON food_subscription.* TO 'food_user'@'localhost';`

### 图片上传失败
```bash
# 检查目录权限
sudo chown -R www-data:www-data /var/www/food-subscription/backend/uploads
sudo chmod 755 /var/www/food-subscription/backend/uploads
```

### 前端404
- 确认 `frontend/dist/` 目录存在且非空
- 检查 Nginx 配置中的 `try_files` 指令

## 安全注意事项

1. **JWT密钥**: 生产环境必须修改 `JWT_SECRET` 环境变量
2. **数据库密码**: 修改默认密码 `food123456`
3. **文件上传**: 限制上传大小(5MB)和类型(JPG/PNG/GIF/WebP)
4. **CORS**: 生产环境应配置允许的域名
5. **SQL注入**: 使用参数化查询 (mysql2的 `?` 占位符)

## 扩展开发指南

### 添加新API
1. 在 `backend/routes/` 创建路由文件
2. 在 `backend/server.js` 中注册路由
3. 在 `frontend-src/src/api/api.ts` 添加前端调用方法

### 添加新页面
1. 在对应角色目录创建组件 (如 `pages/admin/NewPage.tsx`)
2. 在 `App.tsx` 中添加路由配置
3. 如需导航菜单，在对应 Layout 组件中添加链接

### 数据库迁移
1. 修改 `backend/db/init-mysql.js` 中的 SQL
2. 对于已有数据，需编写迁移脚本
3. 生产环境谨慎执行，建议先备份

## 版本历史

- **v1.0**: JSON文件存储版本
- **v1.1**: 基础功能完善
- **v1.2** (当前): MySQL数据库、本地上传、Bug修复

---

*本文档最后更新: 2026-02-19*
*项目仓库: food-subscription-v01.1-backup*
