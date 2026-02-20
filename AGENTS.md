# AGENTS.md - AI 编程助手指南

> 本文档面向 AI 编程助手，帮助快速理解和上手本项目。  
> 项目语言：中文 / Chinese  
> 最后更新：2026-02-20

---

## 项目概述

**食材包订阅平台** (Food Subscription Platform) 是一个面向中国市场的智能食材包订阅电商系统。用户可以通过订阅模式定期收到配好的食材包，包含食材、食谱和调料。

### 核心功能

- **用户端**: 浏览食材包、管理饮食画像、下单订阅、查看订单状态
- **商家端**: 商品管理、库存管理、订单处理
- **管理端**: 用户管理、数据报表、系统监控

### 测试账号

| 角色 | 邮箱 | 密码 |
|------|------|------|
| 管理员 | admin@example.com | admin123 |
| 商家 | merchant@example.com | merchant123 |
| 普通用户 | user@example.com | user123 |

---

## 技术栈

### 前端 (frontend-src/)

| 技术 | 版本 | 用途 |
|------|------|------|
| React | 19.2 | UI 框架 |
| TypeScript | 5.9 | 类型系统 |
| Vite | 7.2 | 构建工具 |
| Tailwind CSS | 3.4 | 原子化 CSS |
| shadcn/ui | - | UI 组件库 (基于 Radix UI) |
| Zustand | 5.0 | 状态管理 |
| React Router | 7.1 | 路由管理 |
| React Hook Form | 7.70 | 表单处理 |
| Zod | 4.3 | 数据验证 |
| Recharts | 2.15 | 图表 |
| TanStack Query | 5.90 | 服务端状态管理 |
| sonner | 2.0 | 通知 Toast |
| date-fns | 4.1 | 日期处理 |
| lucide-react | 0.56 | 图标库 |

### 后端 (backend/)

| 技术 | 版本 | 用途 |
|------|------|------|
| Node.js | 18+ | 运行时 |
| Express | 4.18 | Web 框架 |
| MySQL | 8.0 | 数据库 |
| mysql2 | 3.6 | MySQL 驱动 |
| JWT | 9.0 | 认证 |
| bcryptjs | 2.4 | 密码加密 |
| Multer | 1.4 | 文件上传 |
| CORS | 2.8 | 跨域处理 |

### 部署与运维

| 技术 | 用途 |
|------|------|
| Nginx | 反向代理、静态文件服务 |
| systemd | 进程管理 |
| GitHub Actions | 自动部署 |

---

## 项目结构

```
food-subscription/
├── backend/                          # Node.js 后端
│   ├── db/
│   │   ├── config.js                 # 数据库配置
│   │   ├── connection.js             # 连接池管理
│   │   └── init-mysql.js             # 数据库初始化脚本
│   ├── middleware/
│   │   ├── auth.js                   # JWT 认证中间件
│   │   └── upload.js                 # 文件上传中间件
│   ├── routes/                       # API 路由
│   │   ├── auth.js                   # 认证相关 (登录/注册/用户信息)
│   │   ├── food-packages.js          # 食材包 CRUD
│   │   ├── orders.js                 # 订单处理
│   │   ├── subscriptions.js          # 订阅管理
│   │   ├── diet-profile.js           # 饮食画像
│   │   ├── addresses.js              # 收货地址
│   │   ├── upload.js                 # 文件上传
│   │   └── admin.js                  # 管理员接口
│   ├── utils/
│   │   └── helpers.js                # 数据格式化工具
│   ├── uploads/                      # 上传文件存储目录
│   ├── server.js                     # 主入口文件
│   └── package.json
│
├── frontend-src/                     # React 前端源码
│   ├── src/
│   │   ├── api/
│   │   │   ├── api.ts                # 真实 API 实现
│   │   │   ├── mock.ts               # Mock 数据 (备用)
│   │   │   └── index.ts              # API 导出
│   │   ├── components/
│   │   │   └── ui/                   # shadcn/ui 组件库 (50+ 组件)
│   │   ├── pages/                    # 页面组件
│   │   │   ├── admin/                # 管理端页面
│   │   │   ├── merchant/             # 商家端页面
│   │   │   └── user/                 # 用户端页面
│   │   ├── store/
│   │   │   └── index.ts              # Zustand 状态管理
│   │   ├── types/
│   │   │   └── index.ts              # TypeScript 类型定义
│   │   ├── hooks/                    # 自定义 React Hooks
│   │   ├── lib/
│   │   │   └── utils.ts              # 工具函数 (cn, formatPrice 等)
│   │   ├── App.tsx                   # 应用主组件 (路由配置)
│   │   ├── main.tsx                  # 入口文件
│   │   └── index.css                 # 全局样式
│   ├── public/                       # 静态资源
│   ├── vite.config.ts                # Vite 配置
│   ├── tsconfig.json                 # TypeScript 配置
│   ├── components.json               # shadcn/ui 配置
│   └── package.json
│
├── frontend/                         # 生产构建输出
│   └── dist/                         # Nginx 服务的静态文件
│
├── nginx/
│   └── food-subscription.conf        # Nginx 站点配置
│
├── .github/workflows/
│   └── deploy.yml                    # GitHub Actions 部署配置
│
├── v1_2.sh                           # 部署脚本 (v1.2, 推荐)
├── deploy.sh                         # 部署脚本 (旧版)
├── update-server.py                  # 服务器更新脚本
└── README.md
```

---

## 开发命令

### 前端开发

```bash
cd frontend-src

# 安装依赖
npm install

# 启动开发服务器 (http://localhost:5173)
npm run dev

# 生产构建 (输出到 frontend/dist/)
npm run build

# 代码检查
npm run lint

# 预览生产构建
npm run preview
```

### 后端开发

```bash
cd backend

# 安装依赖
npm install

# 启动生产服务器 (端口 3001)
npm start

# 开发模式 (nodemon 热重载)
npm run dev

# 初始化数据库
npm run init-db
```

### 环境变量

后端支持以下环境变量：

```bash
PORT=3001                           # 服务端口
DB_HOST=localhost                   # 数据库主机
DB_USER=food_user                   # 数据库用户名
DB_PASSWORD=food123456              # 数据库密码
DB_NAME=food_subscription           # 数据库名
JWT_SECRET=your-secret-key          # JWT 签名密钥
NODE_ENV=production                 # 运行环境
```

---

## 架构设计

### 前端架构

#### 路由结构

| 路径 | 页面 | 权限 |
|------|------|------|
| `/login` | 登录页 | 公开 |
| `/register` | 注册页 | 公开 |
| `/` | 首页 (自动根据角色跳转) | 需登录 |
| `/packages/*` | 食材包浏览 | 需登录 |
| `/orders` | 订单管理 | 需登录 |
| `/subscriptions` | 订阅管理 | 需登录 |
| `/cart` | 购物车 | 需登录 |
| `/checkout` | 结算页 | 需登录 |
| `/diet-profile` | 饮食画像 | 需登录 |
| `/addresses` | 收货地址 | 需登录 |
| `/merchant/*` | 商家端 | merchant/admin |
| `/admin/*` | 管理端 | admin |

#### 状态管理 (Zustand)

```typescript
useAuthStore           // 认证状态 (持久化)
useCartStore           // 购物车 (持久化)
useOrderStore          // 订单状态
useSubscriptionStore   // 订阅状态
useDietProfileStore    // 饮食画像 (持久化)
useAddressStore        // 地址管理 (持久化)
useFoodPackageStore    // 食材包状态
useUIStore             // UI 状态 (持久化)
```

### 后端架构

#### API 路由结构

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| POST | `/api/auth/login` | 登录 | 公开 |
| POST | `/api/auth/register` | 注册 | 公开 |
| GET | `/api/auth/profile` | 获取用户信息 | 需认证 |
| PUT | `/api/auth/profile` | 更新用户信息 | 需认证 |
| GET | `/api/food-packages` | 获取食材包列表 | 公开 |
| GET | `/api/food-packages/:id` | 获取食材包详情 | 公开 |
| POST | `/api/food-packages` | 创建食材包 | merchant/admin |
| PUT | `/api/food-packages/:id` | 更新食材包 | merchant/admin |
| DELETE | `/api/food-packages/:id` | 删除食材包 | merchant/admin |
| GET | `/api/orders` | 订单列表 | 需认证 |
| POST | `/api/orders` | 创建订单 | 需认证 |
| POST | `/api/orders/:id/pay` | 模拟支付 | 需认证 |
| GET | `/api/subscriptions` | 订阅列表 | 需认证 |
| POST | `/api/subscriptions` | 创建订阅 | 需认证 |
| GET | `/api/diet-profile` | 获取饮食画像 | 需认证 |
| POST | `/api/diet-profile` | 创建饮食画像 | 需认证 |
| PUT | `/api/diet-profile` | 更新饮食画像 | 需认证 |
| GET | `/api/addresses` | 地址列表 | 需认证 |
| POST | `/api/upload/image` | 上传图片 | 需认证 |
| GET | `/api/admin/users` | 获取所有用户 | admin |
| GET | `/api/admin/statistics` | 统计数据 | admin |

#### 认证流程

1. 用户登录/注册后，后端生成 JWT Token
2. Token 存储在 `localStorage` (通过 Zustand 持久化)
3. 受保护接口需在 Header 中携带 `Authorization: Bearer <token>`
4. `authMiddleware` 验证 Token 有效性并查询用户是否存在
5. 角色权限通过 `adminMiddleware` / `merchantMiddleware` 检查

### 数据库设计

#### 核心表结构

| 表名 | 说明 | 关键字段 |
|------|------|----------|
| `users` | 用户表 | id, email, password, name, role, avatar |
| `food_packages` | 食材包表 | id, name, price, stock_quantity, merchant_id, status |
| `orders` | 订单表 | id, user_id, package_id, total_amount, status |
| `subscriptions` | 订阅表 | id, user_id, package_id, frequency, status |
| `diet_profiles` | 饮食画像表 | user_id, age, gender, health_goals, dietary_restrictions |
| `addresses` | 地址表 | user_id, province, city, detail_address, is_default |
| `suppliers` | 供应商表 | name, contact, phone, categories, rating |
| `inventory_logs` | 库存变动记录 | package_id, change_quantity, type |
| `payments` | 支付记录 | order_id, amount, status, payment_method |
| `uploads` | 上传文件记录 | filename, path, url, uploaded_by |

#### 连接配置

数据库配置位于 `backend/db/config.js`：

```javascript
{
  host: 'localhost',
  user: 'food_user',
  password: 'food123456',
  database: 'food_subscription',
  charset: 'utf8mb4'
}
```

---

## 代码规范

### 命名约定

| 类型 | 约定 | 示例 |
|------|------|------|
| 组件 | PascalCase | `UserDashboard.tsx` |
| 文件/目录 | kebab-case | `food-packages.js` |
| 变量/函数 | camelCase | `getUserProfile` |
| 常量 | UPPER_SNAKE_CASE | `API_BASE_URL` |
| 类型/接口 | PascalCase | `FoodPackage` |

### 导入顺序

1. React/框架核心
2. 第三方库
3. 本地组件
4. 工具函数/类型
5. 样式文件

### 错误处理

- **后端**: 使用 Express 错误处理中间件，统一返回 `{ message: '错误描述' }`
- **前端**: API 错误通过 try-catch 捕获，使用 sonner 显示通知

### 类型定义

- 所有数据类型定义在 `frontend-src/src/types/index.ts`
- 后端使用 JSDoc 注释说明类型

---

## 构建与部署

### 前端构建

```bash
cd frontend-src
npm run build
```

构建输出到 `frontend/dist/` 目录，由 Nginx 直接服务。

### 部署流程

#### 首次部署 (Ubuntu/Debian)

```bash
# 上传到服务器 /var/www/ 目录后执行
sudo bash v1_2.sh
```

脚本会自动：
1. 安装 Nginx、MySQL、Node.js
2. 创建数据库和用户
3. 初始化数据库表结构和测试数据
4. 安装后端依赖
5. 配置 Nginx 和 systemd 服务
6. 启动服务

#### 更新部署 (GitHub Actions)

代码推送到 `main` 分支自动触发部署：

```yaml
# .github/workflows/deploy.yml
- 执行 git pull
- 安装后端依赖
- 重启 food-subscription 服务
```

#### 手动更新

```bash
ssh root@服务器IP
cd /var/www/food-subscription-v01.1-backup

# 拉取代码
git pull origin main

# 同步前端构建文件
cp -r frontend-src/dist/* frontend/dist/

# 安装依赖
cd backend && npm install --production

# 重启服务
sudo systemctl restart food-subscription
```

### 服务管理

```bash
# 查看日志
sudo journalctl -u food-subscription -f

# 重启服务
sudo systemctl restart food-subscription

# 停止服务
sudo systemctl stop food-subscription

# 查看状态
sudo systemctl status food-subscription
```

---

## 安全注意事项

1. **JWT 密钥**: 生产环境必须修改 `JWT_SECRET` 环境变量，使用强随机字符串
   ```bash
   openssl rand -hex 32
   ```

2. **数据库密码**: 修改默认密码 `food123456`

3. **文件上传限制**:
   - 最大文件大小: 5MB
   - 允许类型: JPEG, PNG, GIF, WebP
   - 文件按日期分子目录存储

4. **CORS**: 生产环境应配置允许的域名，当前为 `app.use(cors())` (允许所有)

5. **SQL 注入防护**: 使用参数化查询 (mysql2 的 `?` 占位符)

6. **密码加密**: 使用 bcryptjs，salt rounds 为 10

---

## 常见问题排查

### 服务无法启动

```bash
# 查看日志
sudo journalctl -u food-subscription -f

# 检查 MySQL
sudo systemctl status mysql
sudo mysql -u root -e "SHOW DATABASES;"
```

### 数据库连接失败

- 检查 `backend/db/config.js` 配置
- 确认 MySQL 用户权限:
  ```sql
  GRANT ALL PRIVILEGES ON food_subscription.* TO 'food_user'@'localhost';
  ```

### 图片上传失败

```bash
# 检查目录权限
sudo chown -R www-data:www-data /var/www/food-subscription/backend/uploads
sudo chmod 755 /var/www/food-subscription/backend/uploads
```

### 前端 404

- 确认 `frontend/dist/` 目录存在且非空
- 检查 Nginx 配置中的 `try_files` 指令

---

## 扩展开发指南

### 添加新 API

1. 在 `backend/routes/` 创建路由文件
2. 在 `backend/server.js` 中注册路由
3. 在 `frontend-src/src/api/api.ts` 添加前端调用方法

### 添加新页面

1. 在对应角色目录创建组件 (如 `pages/admin/NewPage.tsx`)
2. 在 `App.tsx` 中添加路由配置
3. 如需导航菜单，在对应 Layout 组件中添加链接

### 添加 shadcn/ui 组件

```bash
cd frontend-src
npx shadcn add button    # 添加按钮组件
npx shadcn add card      # 添加卡片组件
```

### 数据库迁移

1. 修改 `backend/db/init-mysql.js` 中的 SQL
2. 对于已有数据，需编写迁移脚本
3. 生产环境谨慎执行，建议先备份

---

## 版本历史

- **v1.0**: JSON 文件存储版本
- **v1.1**: 基础功能完善
- **v1.2** (当前): MySQL 数据库、本地上传、Bug 修复

---

## 相关文档

- `README.md` - 项目 README
- `CLAUDE.md` - Claude Code 快速参考
- `BUILD-FRONTEND.md` - 前端构建说明
- `CHANGELOG-v1.2.md` - v1.2 更新日志
