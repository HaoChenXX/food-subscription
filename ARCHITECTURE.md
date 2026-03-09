# 食材包订阅平台 - 架构示意图

## 整体架构概览

```mermaid
graph TB
    subgraph "用户端 (浏览器)"
        UI[用户界面 React + TypeScript]
        Router[React Router 7]
        State[Zustand 状态管理]
        API[API 客户端]
    end

    subgraph "后端服务 (Node.js)"
        Express[Express 服务器]
        Auth[认证中间件 JWT]
        Routes[API 路由]
        DB[MySQL 数据库]
    end

    subgraph "部署环境"
        Nginx[Nginx 反向代理]
        Systemd[systemd 服务]
    end

    UI --> Router
    UI --> State
    UI --> API
    API --> Express
    Express --> Auth
    Express --> Routes
    Routes --> DB
    Nginx --> Express
    Nginx --> UI
    Systemd --> Express
```

## 前端架构 (frontend-src/)

```mermaid
graph TB
    subgraph "前端架构 React 19 + TypeScript"
        App[App.tsx - 应用入口]

        subgraph "页面层 Pages"
            UserPages[用户页面 /pages/user/]
            MerchantPages[商家页面 /pages/merchant/]
            AdminPages[管理页面 /pages/admin/]
            AuthPages[认证页面 Login/Register]
        end

        subgraph "组件层 Components"
            UIComponents[UI 组件 /components/ui/]
            Layouts[布局组件]
            Forms[表单组件]
            Cards[卡片组件]
        end

        subgraph "状态管理 Zustand"
            AuthStore[认证状态 useAuthStore]
            CartStore[购物车 useCartStore]
            OrderStore[订单 useOrderStore]
            ProfileStore[饮食画像 useDietProfileStore]
        end

        subgraph "服务层 Services"
            APIClient[API 客户端 /api/api.ts]
            MockData[Mock 数据 /api/mock.ts]
            Hooks[自定义 Hooks]
            Utils[工具函数]
        end

        App --> Pages
        App --> Router
        Pages --> UIComponents
        Pages --> State
        State --> Services
        Services --> Backend[后端 API]
    end
```

## 后端架构 (backend/)

```mermaid
graph TB
    subgraph "后端架构 Node.js + Express"
        Server[server.js - 主入口]

        subgraph "中间件 Middleware"
            AuthMW[认证中间件 auth.js]
            UploadMW[文件上传 upload.js]
            ErrorMW[错误处理中间件]
            CORSMW[CORS 中间件]
        end

        subgraph "路由层 Routes"
            AuthRoutes[认证路由 auth.js]
            FoodRoutes[食材包路由 food-packages.js]
            OrderRoutes[订单路由 orders.js]
            SubRoutes[订阅路由 subscriptions.js]
            AdminRoutes[管理员路由 admin.js]
            UploadRoutes[上传路由 upload.js]
        end

        subgraph "数据层 Database"
            MySQL[MySQL 8.0]
            subgraph "核心表"
                Users[users 用户表]
                Packages[food_packages 食材包表]
                Orders[orders 订单表]
                Subs[subscriptions 订阅表]
                Profiles[diet_profiles 饮食画像]
                Addresses[addresses 地址表]
            end
        end

        subgraph "配置文件"
            DBConfig[数据库配置 config.js]
            InitScript[初始化脚本 init-mysql.js]
            Connection[连接池 connection.js]
        end

        Server --> Middleware
        Server --> Routes
        Routes --> Database
        Database --> Config
        Config --> MySQL
    end
```

## 数据流示意图

```mermaid
sequenceDiagram
    participant User as 用户
    participant Frontend as 前端 React
    participant Backend as 后端 Express
    participant Database as MySQL 数据库
    participant Storage as 文件存储

    User->>Frontend: 访问页面 /login
    Frontend->>Backend: POST /api/auth/login
    Backend->>Database: 查询用户表验证
    Database-->>Backend: 返回用户数据
    Backend->>Backend: 生成 JWT Token
    Backend-->>Frontend: 返回 Token
    Frontend->>Frontend: 存储到 Zustand
    Frontend-->>User: 显示用户仪表板

    User->>Frontend: 浏览食材包
    Frontend->>Backend: GET /api/food-packages
    Backend->>Database: 查询食材包表
    Database-->>Backend: 返回食材包列表
    Backend-->>Frontend: 返回数据
    Frontend-->>User: 显示食材包

    User->>Frontend: 添加到购物车
    Frontend->>Frontend: 更新购物车状态
    Frontend-->>User: 显示购物车侧边栏

    User->>Frontend: 下单结算
    Frontend->>Backend: POST /api/orders
    Backend->>Database: 创建订单记录
    Backend->>Database: 更新库存
    Database-->>Backend: 操作成功
    Backend-->>Frontend: 返回订单ID
    Frontend-->>User: 显示支付页面

    Merchant->>Frontend: 上传商品图片
    Frontend->>Backend: POST /api/upload/image
    Backend->>Storage: 保存图片文件
    Backend->>Database: 记录文件信息
    Database-->>Backend: 记录成功
    Backend-->>Frontend: 返回文件URL
    Frontend-->>Merchant: 显示上传成功
```

## 目录结构树

```
food-subscription-v01.1-backup/
├── backend/                          # Node.js 后端
│   ├── db/                          # 数据库配置
│   │   ├── config.js                # 数据库连接配置
│   │   ├── connection.js            # 连接池管理
│   │   └── init-mysql.js            # 数据库初始化脚本
│   ├── middleware/                  # 中间件
│   │   ├── auth.js                  # JWT 认证中间件
│   │   └── upload.js                # 文件上传中间件
│   ├── routes/                      # API 路由
│   │   ├── auth.js                  # 认证相关接口
│   │   ├── food-packages.js         # 食材包 CRUD
│   │   ├── orders.js                # 订单处理
│   │   ├── subscriptions.js         # 订阅管理
│   │   ├── diet-profile.js          # 饮食画像
│   │   ├── addresses.js             # 收货地址
│   │   ├── upload.js                # 文件上传
│   │   └── admin.js                 # 管理员接口
│   ├── uploads/                     # 上传文件存储
│   └── server.js                    # Express 主入口
│
├── frontend-src/                    # React 前端源码
│   ├── src/
│   │   ├── api/                     # API 客户端
│   │   │   ├── api.ts               # 真实 API 调用
│   │   │   └── mock.ts              # Mock 数据 (开发用)
│   │   ├── components/              # 组件库
│   │   │   └── ui/                  # shadcn/ui 组件 (50+)
│   │   ├── pages/                   # 页面组件
│   │   │   ├── admin/               # 管理端页面
│   │   │   ├── merchant/            # 商家端页面
│   │   │   ├── user/                # 用户端页面
│   │   │   ├── Login.tsx            # 登录页
│   │   │   └── Register.tsx         # 注册页
│   │   ├── store/                   # Zustand 状态管理
│   │   │   └── index.ts             # 所有状态存储
│   │   ├── types/                   # TypeScript 类型
│   │   │   └── index.ts             # 类型定义
│   │   ├── hooks/                   # 自定义 React Hooks
│   │   └── lib/                     # 工具函数
│   ├── public/                      # 静态资源
│   └── dist/                        # 构建输出
│
├── frontend/                        # 生产构建 (Nginx 服务)
│   └── dist/
│
├── nginx/                           # Nginx 配置
│   └── food-subscription.conf
│
└── 部署脚本/
    ├── deploy.sh                    # 一键部署
    ├── v1_2.sh                      # v1.2 部署脚本
    ├── update-server.py             # 服务器更新脚本
    └── fix-line-endings.py          # 跨平台行尾修正
```

## 组件依赖关系

```mermaid
graph LR
    subgraph "前端依赖关系"
        React[React 19] --> Router[React Router]
        React --> Zustand[Zustand 5]
        React --> Query[TanStack Query]
        Zustand --> API[API Client]
        Query --> API
        API --> Axios[Axios]

        UI[shadcn/ui] --> Radix[Radix UI]
        UI --> Tailwind[Tailwind CSS]

        Forms[React Hook Form] --> Zod[Zod]
    end

    subgraph "后端依赖关系"
        Express[Express] --> MySQL[mysql2]
        Express --> JWT[jsonwebtoken]
        Express --> Bcrypt[bcryptjs]
        Express --> Multer[Multer]
        Express --> Cors[CORS]
    end
```

## 部署架构

```mermaid
graph TB
    subgraph "生产服务器"
        Nginx[Nginx 反向代理]
        subgraph "应用服务"
            BackendService[Node.js 后端]
            StaticFiles[前端静态文件]
        end
        Database[MySQL 数据库]
        Systemd[systemd 服务管理]
    end

    subgraph "开发环境"
        Vite[Vite 开发服务器]
        Nodemon[Nodemon 热重载]
        MockData[Mock API 数据]
    end

    subgraph "代码仓库"
        CodeArts[华为云 CodeArts]
        GitHub[GitHub 备份]
    end

    subgraph "CI/CD"
        GitHubActions[GitHub Actions]
        UpdateScript[update-server.py]
    end

    用户 --> Nginx
    Nginx --> BackendService
    Nginx --> StaticFiles
    BackendService --> Database
    Systemd --> BackendService

    开发者 --> Vite
    开发者 --> Nodemon
    Vite --> MockData

    GitHubActions --> CodeArts
    UpdateScript --> CodeArts
    CodeArts --> GitHub
```

## 技术栈矩阵

| 层 | 技术 | 版本 | 用途 |
|----|------|------|------|
| **前端** | React | 19.2.0 | UI 框架 |
| | TypeScript | 5.9.3 | 类型安全 |
| | Vite | 7.2.4 | 构建工具 |
| | Tailwind CSS | 3.4.19 | 原子化样式 |
| | shadcn/ui | - | UI 组件库 |
| | Zustand | 5.0.11 | 状态管理 |
| | TanStack Query | 5.90.20 | 服务端状态 |
| | React Hook Form | 7.70.0 | 表单处理 |
| | Zod | 4.3.5 | 数据验证 |
| **后端** | Node.js | 18+ | 运行时 |
| | Express | 4.18.2 | Web 框架 |
| | MySQL | 8.0+ | 数据库 |
| | mysql2 | 3.6.5 | 数据库驱动 |
| | JWT | 9.0.2 | 认证 |
| | bcryptjs | 2.4.3 | 密码加密 |
| | Multer | 1.4.5 | 文件上传 |
| **部署** | Nginx | - | 反向代理 |
| | systemd | - | 进程管理 |
| | PM2 | - | Node 进程管理 |
| **开发** | ESLint | - | 代码检查 |
| | Git | - | 版本控制 |
| | GitHub Actions | - | CI/CD |

---

*示意图生成时间: 2026-03-08*
*项目版本: food-subscription-v01.1-backup*
*更新状态: 文档已更新并推送至 CodeArts 仓库*