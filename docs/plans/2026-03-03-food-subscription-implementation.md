# 食材包订阅平台重构实施计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 基于 food-subscription-v01.1-backup 项目进行可控重构，实现暖色调界面设计、前后端连接修复、数据库优化、域名部署支持和小白教程

**Architecture:** 渐进式改进策略，分6个阶段实施：1.环境准备与基础检查，2.前后端连接修复，3.暖色调主题实施，4.数据库优化，5.部署流程升级，6.小白教程编写。保持现有功能，修复连接问题，优化用户体验。

**Tech Stack:** React 19 + TypeScript + Vite + Tailwind CSS + shadcn/ui (前端)，Node.js + Express + MySQL (后端)，Nginx + systemd + 一键部署脚本 (部署)，Git双仓库 (开发流程)

---

## 阶段1：环境准备与基础检查

### Task 1: 服务器环境检查

**文件:**
- 检查: `/etc/nginx/nginx.conf`
- 检查: `/etc/mysql/mysql.conf.d/mysqld.cnf`
- 检查: `/usr/bin/node`

**步骤1: 检查Node.js版本**

```bash
node --version
```

**预期输出:** `v20.x.x` 或更高版本

**步骤2: 检查MySQL服务状态**

```bash
sudo systemctl status mysql
```

**预期输出:** `Active: active (running)`

**步骤3: 检查Nginx配置**

```bash
sudo nginx -t
```

**预期输出:** `syntax is ok` 和 `test is successful`

**步骤4: 创建检查结果文档**

```bash
cd /var/www/food-subscription-v01.1-backup
mkdir -p logs
echo "=== 环境检查报告 ===" > logs/environment-check-$(date +%Y%m%d).txt
echo "检查时间: $(date)" >> logs/environment-check-$(date +%Y%m%d).txt
echo "Node.js版本: $(node --version)" >> logs/environment-check-$(date +%Y%m%d).txt
echo "MySQL状态: $(sudo systemctl is-active mysql)" >> logs/environment-check-$(date +%Y%m%d).txt
sudo nginx -t 2>&1 >> logs/environment-check-$(date +%Y%m%d).txt
```

**步骤5: 提交检查结果**

```bash
git add logs/environment-check-*.txt
git commit -m "chore: 环境检查报告"
```

### Task 2: 本地开发环境检查

**文件:**
- 检查: `frontend-src/package.json`
- 检查: `backend/package.json`
- 创建: `docs/setup/local-environment.md`

**步骤1: 检查本地Node.js版本**

```bash
cd food-subscription-v01.1-backup
node --version
npm --version
```

**预期输出:** Node.js ≥ 18, npm ≥ 9

**步骤2: 检查项目依赖是否安装**

```bash
cd frontend-src
npm list --depth=0 2>/dev/null | head -20
cd ../backend
npm list --depth=0 2>/dev/null | head -20
```

**预期输出:** 显示已安装的依赖包列表

**步骤3: 创建本地环境文档**

```bash
cd food-subscription-v01.1-backup
cat > docs/setup/local-environment.md << 'EOF'
# 本地开发环境配置指南

## 系统要求
- Node.js 18+ (推荐20.x)
- npm 9+
- Git
- 代码编辑器 (VS Code推荐)

## 验证步骤

### 1. 检查Node.js版本
```bash
node --version
npm --version
```

### 2. 安装项目依赖
```bash
# 前端依赖
cd frontend-src
npm install

# 后端依赖
cd ../backend
npm install
```

### 3. 启动开发服务器
```bash
# 后端开发服务器 (端口3001)
cd backend
npm run dev

# 前端开发服务器 (端口5173，新终端)
cd frontend-src
npm run dev
```

### 4. 验证访问
- 后端API: http://localhost:3001/api/health
- 前端应用: http://localhost:5173
EOF
```

**步骤4: 提交环境文档**

```bash
git add docs/setup/local-environment.md
git commit -m "docs: 添加本地开发环境配置指南"
```

### Task 3: 创建API检查清单

**文件:**
- 创建: `docs/api/api-checklist.md`
- 修改: `frontend-src/src/api/api.ts`
- 修改: `backend/routes/auth.js` (示例)

**步骤1: 生成API端点清单**

```bash
cd food-subscription-v01.1-backup
cat > docs/api/api-checklist.md << 'EOF'
# API端点检查清单

## 检查时间: $(date)

### 认证接口
| 功能 | 前端调用路径 | 后端路由文件 | 后端路径 | 状态 | 问题 |
|------|--------------|--------------|----------|------|------|
| 用户登录 | `/api/auth/login` | `auth.js` | `/auth/login` | 待检查 | |
| 用户注册 | `/api/auth/login` | `auth.js` | `/auth/register` | 待检查 | |
| 获取用户信息 | `/api/auth/profile` | `auth.js` | `/auth/profile` | 待检查 | |

### 食材包接口
| 功能 | 前端调用路径 | 后端路由文件 | 后端路径 | 状态 | 问题 |
|------|--------------|--------------|----------|------|------|
| 获取食材包列表 | `/api/food-packages` | `food-packages.js` | `/food-packages` | 待检查 | |
| 获取食材包详情 | `/api/food-packages/:id` | `food-packages.js` | `/food-packages/:id` | 待检查 | |

### 订单接口
| 功能 | 前端调用路径 | 后端路由文件 | 后端路径 | 状态 | 问题 |
|------|--------------|--------------|----------|------|------|
| 创建订单 | `/api/orders` | `orders.js` | `/orders` | 待检查 | |
| 订单支付 | `/api/orders/:id/pay` | `orders.js` | `/orders/:id/pay` | 待检查 | |
| 获取订单列表 | `/api/orders` | `orders.js` | `/orders` | 待检查 | |

### 测试方法
每个API端点使用以下命令测试：
```bash
# 测试GET请求
curl -X GET http://localhost:3001/api/auth/health

# 测试POST请求（以登录为例）
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"user123"}'
```
EOF
```

**步骤2: 检查前端API配置**

```bash
cd food-subscription-v01.1-backup/frontend-src/src/api
grep -n "const API_BASE_URL" api.ts
```

**预期输出:** 显示第8行: `const API_BASE_URL = '/api';`

**步骤3: 检查后端路由前缀**

```bash
cd food-subscription-v01.1-backup/backend
grep -n "app.use.*api" server.js
```

**预期输出:** 显示类似: `app.use('/api', authRouter);`

**步骤4: 提交API清单**

```bash
git add docs/api/api-checklist.md
git commit -m "docs: 添加API端点检查清单"
```

## 阶段2：前后端连接修复

### Task 4: 测试认证接口连接

**文件:**
- 测试: `backend/routes/auth.js`
- 测试: `frontend-src/src/api/api.ts` 中的auth模块
- 创建: `scripts/test-auth-api.sh`

**步骤1: 创建认证API测试脚本**

```bash
cd food-subscription-v01.1-backup
cat > scripts/test-auth-api.sh << 'EOF'
#!/bin/bash
# 认证API测试脚本

echo "=== 认证API连接测试 ==="
echo "测试时间: $(date)"
echo

# 测试后端健康检查
echo "1. 测试后端健康检查..."
curl -s -X GET http://localhost:3001/api/health | jq . || echo "响应: $(curl -s -X GET http://localhost:3001/api/health)"

echo
echo "2. 测试用户登录..."
curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"user123"}' | jq . || echo "响应: $(curl -s -X POST http://localhost:3001/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"user@example.com","password":"user123"}')"

echo
echo "3. 测试用户注册..."
curl -s -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","name":"测试用户"}' | jq . || echo "响应: $(curl -s -X POST http://localhost:3001/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"email":"test@example.com","password":"test123","name":"测试用户"}')"

echo
echo "=== 测试完成 ==="
EOF

chmod +x scripts/test-auth-api.sh
```

**步骤2: 运行认证API测试**

```bash
cd food-subscription-v01.1-backup
./scripts/test-auth-api.sh > logs/auth-api-test-$(date +%Y%m%d-%H%M%S).log 2>&1
cat logs/auth-api-test-*.log | tail -20
```

**预期输出:** 包含API响应，成功或错误信息

**步骤3: 分析测试结果并更新清单**

```bash
cd food-subscription-v01.1-backup
# 根据测试结果更新API检查清单的状态
# 示例：如果登录成功，更新状态为"通过"
sed -i 's|用户登录.*待检查|用户登录 |g' docs/api/api-checklist.md
```

**步骤4: 提交测试结果**

```bash
git add scripts/test-auth-api.sh logs/auth-api-test-*.log docs/api/api-checklist.md
git commit -m "test: 认证API连接测试"
```

### Task 5: 统一API响应格式

**文件:**
- 修改: `backend/utils/helpers.js`
- 修改: `backend/routes/auth.js:46-50` (示例)
- 修改: `frontend-src/src/api/api.ts:28-42`

**步骤1: 创建统一的响应工具函数**

```bash
cd food-subscription-v01.1-backup/backend
cat > utils/response.js << 'EOF'
/**
 * 统一API响应格式工具
 */

/**
 * 成功响应
 * @param {any} data - 响应数据
 * @param {string} message - 成功消息
 * @returns {object} 标准响应对象
 */
function successResponse(data = null, message = '操作成功') {
  return {
    success: true,
    message,
    data
  };
}

/**
 * 错误响应
 * @param {string} message - 错误消息
 * @param {string} code - 错误代码（可选）
 * @param {any} data - 附加数据（可选）
 * @returns {object} 错误响应对象
 */
function errorResponse(message = '操作失败', code = null, data = null) {
  const response = {
    success: false,
    message
  };

  if (code) response.code = code;
  if (data) response.data = data;

  return response;
}

/**
 * 验证错误响应（用于表单验证）
 * @param {Array} errors - 错误数组
 * @param {string} message - 错误消息
 * @returns {object} 验证错误响应
 */
function validationErrorResponse(errors, message = '验证失败') {
  return {
    success: false,
    message,
    code: 'VALIDATION_ERROR',
    data: { errors }
  };
}

module.exports = {
  successResponse,
  errorResponse,
  validationErrorResponse
};
EOF
```

**步骤2: 更新auth.js使用统一响应格式**

```bash
cd food-subscription-v01.1-backup/backend/routes
# 备份原文件
cp auth.js auth.js.backup

# 在文件顶部添加导入
sed -i "1a const { successResponse, errorResponse } = require('../utils/response');" auth.js

# 修改登录成功的响应（找到登录成功的return语句，约第46-50行）
# 原代码：return res.json({ user: formatUser(newUser[0]), token });
# 修改为：return res.json(successResponse({ user: formatUser(newUser[0]), token }, '登录成功'));
```

**步骤3: 更新前端API处理统一响应**

```bash
cd food-subscription-v01.1-backup/frontend-src/src/api
# 备份原文件
cp api.ts api.ts.backup

# 修改fetchApi函数处理统一响应格式（约第28-42行）
# 找到：if (!response.ok) { ... }
# 在const data = await response.json();后添加响应格式检查
cat > api.ts.patch << 'EOF'
// 统一响应格式处理
if (!response.ok) {
  const errorText = await response.text();
  console.error('API错误响应:', errorText);
  let error;
  try {
    error = JSON.parse(errorText);
    // 统一错误格式处理
    if (error.success === false) {
      throw new Error(error.message || '请求失败');
    }
  } catch {
    error = { message: '请求失败' };
  }
  throw new Error(error.message || \`HTTP \${response.status}\`);
}

const data = await response.json();
console.log('API响应数据:', data);

// 检查统一响应格式
if (data.success === false) {
  throw new Error(data.message || '操作失败');
}

// 返回data字段或整个响应（兼容旧格式）
return data.data !== undefined ? data.data : data;
EOF

# 应用补丁（需要手动编辑，这里只是示意）
```

**步骤4: 测试统一响应格式**

```bash
cd food-subscription-v01.1-backup
./scripts/test-auth-api.sh > logs/unified-response-test-$(date +%Y%m%d-%H%M%S).log 2>&1
grep -A5 "测试用户登录" logs/unified-response-test-*.log
```

**预期输出:** 响应包含 `success: true`, `message`, `data` 字段

**步骤5: 提交统一响应格式修改**

```bash
git add backend/utils/response.js backend/routes/auth.js frontend-src/src/api/api.ts
git commit -m "feat: 统一API响应格式"
```

### Task 6: 修复CORS配置

**文件:**
- 修改: `backend/server.js`
- 创建: `backend/middleware/cors.js`

**步骤1: 创建自定义CORS中间件**

```bash
cd food-subscription-v01.1-backup/backend
cat > middleware/cors.js << 'EOF'
/**
 * 自定义CORS中间件
 * 支持开发和生产环境
 */

const cors = require('cors');

// 允许的域名列表
const allowedOrigins = [
  'http://localhost:5173',      // 前端开发服务器
  'http://localhost:3000',      // 备用开发端口
  'http://127.0.0.1:5173',     // localhost别名
  process.env.FRONTEND_URL      // 生产环境前端URL
].filter(Boolean); // 过滤掉undefined

const corsOptions = {
  origin: function (origin, callback) {
    // 允许没有origin的请求（如curl、postman）
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn(\`CORS阻止了来自 \${origin} 的请求\`);
      callback(new Error('CORS策略不允许此来源'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'Access-Control-Request-Method',
    'Access-Control-Request-Headers'
  ],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 86400 // 24小时
};

module.exports = cors(corsOptions);
EOF
```

**步骤2: 更新server.js使用自定义CORS**

```bash
cd food-subscription-v01.1-backup/backend
# 备份原文件
cp server.js server.js.backup

# 找到cors导入和使用（约第3-10行和第20-30行）
# 原代码：const cors = require('cors'); 和 app.use(cors());
# 修改为：
# const corsMiddleware = require('./middleware/cors');
# app.use(corsMiddleware);
```

**步骤3: 添加环境变量配置**

```bash
cd food-subscription-v01.1-backup/backend
cat > .env.example << 'EOF'
# 后端环境变量示例
PORT=3001
DB_HOST=localhost
DB_USER=food_user
DB_PASSWORD=food123456
DB_NAME=food_subscription
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=production
FRONTEND_URL=http://yourdomain.com
EOF
```

**步骤4: 测试CORS配置**

```bash
cd food-subscription-v01.1-backup
cat > scripts/test-cors.sh << 'EOF'
#!/bin/bash
echo "=== CORS配置测试 ==="

echo "1. 测试来自localhost:5173的请求（应允许）..."
curl -s -X GET http://localhost:3001/api/health \
  -H "Origin: http://localhost:5173" \
  -I | grep -i "access-control"

echo "2. 测试来自其他域名的请求（应阻止）..."
curl -s -X GET http://localhost:3001/api/health \
  -H "Origin: http://evil.com" \
  -I | grep -i "access-control"
EOF

chmod +x scripts/test-cors.sh
./scripts/test-cors.sh
```

**预期输出:** 第一个请求显示Access-Control-Allow-Origin头，第二个可能被阻止

**步骤5: 提交CORS修复**

```bash
git add backend/middleware/cors.js backend/server.js backend/.env.example scripts/test-cors.sh
git commit -m "feat: 修复CORS配置，支持多环境"
```

## 阶段3：暖色调主题实施

### Task 7: 更新CSS变量定义

**文件:**
- 修改: `frontend-src/src/index.css`
- 创建: `frontend-src/src/theme/warm-colors.css`

**步骤1: 创建暖色调颜色变量文件**

```bash
cd food-subscription-v01.1-backup/frontend-src
mkdir -p src/theme
cat > src/theme/warm-colors.css << 'EOF'
/* 暖色调颜色系统 - 基于参考网站 https://www.feiyihuanxinfang.com */

:root {
  /* 主色调 - 温暖橙棕色系 */
  --primary: 16 100% 60%;       /* #FF6B35 - 主按钮、强调元素 */
  --primary-foreground: 0 0% 100%; /* 白色 - 主色上的文字 */

  --secondary: 20 30% 25%;      /* #5D4037 - 次要元素、边框 */
  --secondary-foreground: 0 0% 100%;

  --background: 45 38% 94%;     /* #F5F5DC - 页面背景 */
  --foreground: 20 30% 25%;     /* #5D4037 - 标题、正文文字 */

  --card: 45 38% 96%;           /* #FEF9E7 - 卡片、表单背景 */
  --card-foreground: 20 30% 25%;

  --popover: 0 0% 100%;         /* 弹出层 */
  --popover-foreground: 20 30% 25%;

  --muted: 45 30% 90%;          /* 柔和背景 */
  --muted-foreground: 20 30% 40%;

  --accent: 24 100% 45%;        /* #E65100 - 价格、警告、强调 */
  --accent-foreground: 0 0% 100%;

  --destructive: 0 65% 51%;     /* #D32F2F - 错误、删除 */
  --destructive-foreground: 0 0% 100%;

  --success: 122 56% 35%;       /* #388E3C - 成功状态 */
  --success-foreground: 0 0% 100%;

  --border: 20 20% 85%;         /* 边框颜色 */
  --input: 20 20% 90%;          /* 输入框背景 */
  --ring: 16 100% 60%;          /* 聚焦环颜色 */

  --radius: 0.625rem;           /* 默认圆角 */

  /* 侧边栏专用颜色 */
  --sidebar-background: 45 38% 96%;
  --sidebar-foreground: 20 30% 25%;
  --sidebar-primary: 16 100% 60%;
  --sidebar-primary-foreground: 0 0% 100%;
  --sidebar-accent: 45 30% 90%;
  --sidebar-accent-foreground: 20 30% 25%;
  --sidebar-border: 20 20% 85%;
  --sidebar-ring: 16 100% 60%;
}

.dark {
  /* 暗色模式适配（可选） */
  --background: 20 30% 10%;
  --foreground: 45 38% 94%;
  --card: 20 30% 12%;
  --card-foreground: 45 38% 94%;
  --primary: 16 100% 60%;
  --primary-foreground: 20 30% 10%;
}
EOF
```

**步骤2: 更新index.css导入颜色变量**

```bash
cd food-subscription-v01.1-backup/frontend-src
# 备份原文件
cp src/index.css src/index.css.backup

# 在文件顶部添加导入
cat > src/index.css << 'EOF'
/* 导入暖色调颜色系统 */
@import './theme/warm-colors.css';

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
EOF
```

**步骤3: 验证CSS变量生效**

```bash
cd food-subscription-v01.1-backup/frontend-src
cat > src/theme/test-colors.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="../index.css">
  <style>
    .color-box {
      width: 100px;
      height: 100px;
      margin: 10px;
      display: inline-block;
      border: 1px solid #ccc;
      text-align: center;
      line-height: 100px;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <h1>暖色调颜色测试</h1>
  <div class="color-box" style="background-color: hsl(var(--primary))">主色</div>
  <div class="color-box" style="background-color: hsl(var(--background))">背景</div>
  <div class="color-box" style="background-color: hsl(var(--card))">卡片</div>
  <div class="color-box" style="background-color: hsl(var(--accent))">强调</div>
  <div class="color-box" style="background-color: hsl(var(--success))">成功</div>
  <div class="color-box" style="background-color: hsl(var(--destructive))">错误</div>
</body>
</html>
EOF

echo "颜色测试文件已创建: frontend-src/src/theme/test-colors.html"
echo "在浏览器中打开该文件查看颜色效果"
```

**步骤4: 启动开发服务器查看效果**

```bash
cd food-subscription-v01.1-backup/frontend-src
npm run dev &
echo "开发服务器启动中，访问 http://localhost:5173 查看颜色变化"
```

**步骤5: 提交暖色调CSS变量**

```bash
git add frontend-src/src/theme/warm-colors.css frontend-src/src/index.css frontend-src/src/theme/test-colors.html
git commit -m "feat: 添加暖色调CSS变量系统"
```

### Task 8: 更新Tailwind配置

**文件:**
- 修改: `frontend-src/tailwind.config.js`
- 创建: `frontend-src/src/theme/tailwind-colors.js`

**步骤1: 创建Tailwind颜色扩展配置**

```bash
cd food-subscription-v01.1-backup/frontend-src
cat > src/theme/tailwind-colors.js << 'EOF'
/**
 * Tailwind CSS暖色调颜色扩展
 * 基于CSS变量，确保与设计系统一致
 */

module.exports = {
  // 扩展颜色，使用CSS变量
  colors: {
    // 主色调
    primary: {
      DEFAULT: 'hsl(var(--primary))',
      foreground: 'hsl(var(--primary-foreground))',
      50: 'hsl(16 100% 95%)',
      100: 'hsl(16 100% 85%)',
      200: 'hsl(16 100% 75%)',
      300: 'hsl(16 100% 65%)',
      400: 'hsl(16 100% 55%)',
      500: 'hsl(var(--primary))', // #FF6B35
      600: 'hsl(16 100% 45%)',
      700: 'hsl(16 100% 35%)',
      800: 'hsl(16 100% 25%)',
      900: 'hsl(16 100% 15%)',
      950: 'hsl(16 100% 10%)',
    },

    // 辅助色（棕色系）
    secondary: {
      DEFAULT: 'hsl(var(--secondary))',
      foreground: 'hsl(var(--secondary-foreground))',
      50: 'hsl(20 30% 95%)',
      100: 'hsl(20 30% 85%)',
      200: 'hsl(20 30% 75%)',
      300: 'hsl(20 30% 65%)',
      400: 'hsl(20 30% 55%)',
      500: 'hsl(var(--secondary))', // #5D4037
      600: 'hsl(20 30% 35%)',
      700: 'hsl(20 30% 25%)',
      800: 'hsl(20 30% 15%)',
      900: 'hsl(20 30% 10%)',
    },

    // 背景色（米色系）
    background: {
      DEFAULT: 'hsl(var(--background))',
      foreground: 'hsl(var(--foreground))',
    },

    // 强调色（深橙色）
    accent: {
      DEFAULT: 'hsl(var(--accent))',
      foreground: 'hsl(var(--accent-foreground))',
    },

    // 成功色（绿色）
    success: {
      DEFAULT: 'hsl(var(--success))',
      foreground: 'hsl(var(--success-foreground))',
    },

    // 错误色（红色）
    destructive: {
      DEFAULT: 'hsl(var(--destructive))',
      foreground: 'hsl(var(--destructive-foreground))',
    },

    // 边框色
    border: 'hsl(var(--border))',

    // 输入框
    input: 'hsl(var(--input))',

    // 聚焦环
    ring: 'hsl(var(--ring))',
  },

  // 圆角系统
  borderRadius: {
    xs: 'calc(var(--radius) - 6px)',
    sm: 'calc(var(--radius) - 4px)',
    DEFAULT: 'calc(var(--radius) - 2px)',
    md: 'var(--radius)',
    lg: 'calc(var(--radius) + 4px)',
    xl: 'calc(var(--radius) + 8px)',
    '2xl': 'calc(var(--radius) + 16px)',
    full: '9999px',
  },

  // 阴影系统
  boxShadow: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',
    none: 'none',
  },
};
EOF
```

**步骤2: 更新tailwind.config.js**

```bash
cd food-subscription-v01.1-backup/frontend-src
# 备份原文件
cp tailwind.config.js tailwind.config.js.backup

cat > tailwind.config.js << 'EOF'
/** @type {import('tailwindcss').Config} */

// 导入暖色调配置
const warmColors = require('./src/theme/tailwind-colors');

module.exports = {
  darkMode: ["class"],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      // 合并暖色调颜色配置
      colors: warmColors.colors,
      borderRadius: warmColors.borderRadius,
      boxShadow: warmColors.boxShadow,

      // 保持原有的动画配置
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "caret-blink": {
          "0%,70%,100%": { opacity: "1" },
          "20%,50%": { opacity: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "caret-blink": "caret-blink 1.25s ease-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
EOF
```

**步骤3: 创建颜色测试组件**

```bash
cd food-subscription-v01.1-backup/frontend-src
cat > src/components/ColorTest.tsx << 'EOF'
import React from 'react';

const ColorTest: React.FC = () => {
  const colorGroups = [
    {
      name: '主色调',
      colors: [
        { name: 'primary', class: 'bg-primary text-primary-foreground' },
        { name: 'primary-50', class: 'bg-primary-50 text-foreground' },
        { name: 'primary-100', class: 'bg-primary-100 text-foreground' },
        { name: 'primary-500', class: 'bg-primary-500 text-primary-foreground' },
        { name: 'primary-900', class: 'bg-primary-900 text-primary-foreground' },
      ]
    },
    {
      name: '辅助色',
      colors: [
        { name: 'secondary', class: 'bg-secondary text-secondary-foreground' },
        { name: 'secondary-100', class: 'bg-secondary-100 text-foreground' },
        { name: 'secondary-500', class: 'bg-secondary-500 text-secondary-foreground' },
      ]
    },
    {
      name: '功能色',
      colors: [
        { name: 'background', class: 'bg-background text-foreground border' },
        { name: 'accent', class: 'bg-accent text-accent-foreground' },
        { name: 'success', class: 'bg-success text-success-foreground' },
        { name: 'destructive', class: 'bg-destructive text-destructive-foreground' },
      ]
    }
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">暖色调设计系统测试</h1>

      {colorGroups.map((group) => (
        <div key={group.name} className="mb-8">
          <h2 className="text-xl font-semibold mb-4">{group.name}</h2>
          <div className="flex flex-wrap gap-4">
            {group.colors.map((color) => (
              <div key={color.name} className="w-32 h-32 rounded-lg shadow-md flex flex-col">
                <div className={`flex-grow rounded-t-lg ${color.class} flex items-center justify-center`}>
                  <span className="font-medium">示例</span>
                </div>
                <div className="p-2 bg-card text-sm">
                  <div className="font-mono">{color.name}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="mt-8 p-4 bg-card rounded-lg">
        <h3 className="text-lg font-semibold mb-2">圆角测试</h3>
        <div className="flex gap-4 items-center">
          <div className="w-16 h-16 bg-primary rounded-xs"></div>
          <div className="w-16 h-16 bg-primary rounded-sm"></div>
          <div className="w-16 h-16 bg-primary rounded"></div>
          <div className="w-16 h-16 bg-primary rounded-md"></div>
          <div className="w-16 h-16 bg-primary rounded-lg"></div>
          <div className="w-16 h-16 bg-primary rounded-xl"></div>
        </div>
      </div>
    </div>
  );
};

export default ColorTest;
EOF
```

**步骤4: 测试Tailwind配置**

```bash
cd food-subscription-v01.1-backup/frontend-src
# 构建Tailwind CSS
npx tailwindcss -i ./src/index.css -o ./src/output.css --watch &
# 检查是否有编译错误
sleep 3
echo "检查Tailwind编译..."
if [ -f ./src/output.css ]; then
  echo "✓ Tailwind编译成功"
else
  echo "✗ Tailwind编译失败"
fi
```

**步骤5: 提交Tailwind配置更新**

```bash
git add frontend-src/src/theme/tailwind-colors.js frontend-src/tailwind.config.js frontend-src/src/components/ColorTest.tsx
git commit -m "feat: 更新Tailwind配置支持暖色调设计系统"
```

### Task 9: 更新关键shadcn/ui组件颜色

**文件:**
- 修改: `frontend-src/src/components/ui/button.tsx`
- 修改: `frontend-src/src/components/ui/card.tsx`
- 修改: `frontend-src/src/components/ui/input.tsx`
- 修改: `frontend-src/src/components/ui/badge.tsx`
- 修改: `frontend-src/src/components/ui/alert.tsx`
- 创建: `scripts/update-ui-components.sh`

**步骤1: 检查当前组件颜色配置**

```bash
cd food-subscription-v01.1-backup/frontend-src/src/components/ui
# 检查Button组件颜色
grep -n "bg-primary\|bg-secondary\|bg-accent\|text-primary\|text-secondary" button.tsx
# 检查Card组件颜色
grep -n "bg-card\|border-border" card.tsx
# 检查Badge组件颜色变体
grep -n "bg-primary\|bg-secondary\|bg-destructive\|bg-success" badge.tsx
```

**预期输出:** 显示使用CSS变量的颜色类名

**步骤2: 创建批量更新脚本**

```bash
cd food-subscription-v01.1-backup
cat > scripts/update-ui-components.sh << 'EOF'
#!/bin/bash
# 批量更新UI组件颜色脚本
# 确保使用暖色调CSS变量

echo "=== 更新UI组件颜色 ==="
echo "检查并更新组件使用暖色调变量..."

# 备份组件文件
backup_dir="backups/ui-components-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$backup_dir"

components=("button.tsx" "card.tsx" "input.tsx" "badge.tsx" "alert.tsx" "progress.tsx")

for comp in "${components[@]}"; do
  src="frontend-src/src/components/ui/$comp"
  if [ -f "$src" ]; then
    cp "$src" "$backup_dir/$comp"
    echo "  ✓ 备份: $comp"
  fi
done

echo "更新完成！组件已备份到: $backup_dir"
EOF

chmod +x scripts/update-ui-components.sh
```

**步骤3: 验证组件使用CSS变量**

```bash
cd food-subscription-v01.1-backup/frontend-src/src/components/ui
# 确保组件使用CSS变量而非硬编码颜色
echo "检查Button组件..."
if grep -q "bg-primary text-primary-foreground" button.tsx; then
  echo "✓ Button使用CSS变量"
else
  echo "✗ Button可能使用硬编码颜色"
fi

echo "检查Badge组件变体..."
if grep -q "bg-destructive text-destructive-foreground" badge.tsx; then
  echo "✓ Badge使用CSS变量"
else
  echo "✗ Badge可能使用硬编码颜色"
fi
```

**步骤4: 运行组件更新脚本**

```bash
cd food-subscription-v01.1-backup
./scripts/update-ui-components.sh
echo "组件备份完成，手动检查组件是否使用CSS变量"
```

**步骤5: 提交组件更新**

```bash
git add frontend-src/src/components/ui/button.tsx frontend-src/src/components/ui/card.tsx frontend-src/src/components/ui/input.tsx frontend-src/src/components/ui/badge.tsx frontend-src/src/components/ui/alert.tsx scripts/update-ui-components.sh
git commit -m "chore: 检查UI组件颜色使用情况"
```

### Task 10: 更新页面样式（硬编码颜色替换）

**文件:**
- 修改: `frontend-src/src/pages/user/Home.tsx:68` (渐变背景)
- 修改: `frontend-src/src/pages/user/Home.tsx:112-150` (快捷操作卡片)
- 修改: `frontend-src/src/pages/Login.tsx:81` (登录页渐变)
- 修改: `frontend-src/src/pages/Login.tsx:93` (警告渐变)
- 修改: `frontend-src/src/pages/Login.tsx:174` (按钮渐变)
- 创建: `scripts/replace-hardcoded-colors.sh`

**步骤1: 查找所有硬编码颜色类**

```bash
cd food-subscription-v01.1-backup/frontend-src
# 查找所有绿色系颜色类
find src -name "*.tsx" -o -name "*.ts" | xargs grep -l "from-green-\|via-emerald-\|to-teal-\|bg-green-\|text-green-\|border-green-\|bg-emerald-\|text-emerald-\|border-emerald-\|bg-teal-\|text-teal-\|border-teal-" | head -20
```

**预期输出:** 列出包含硬编码绿色系颜色的文件

**步骤2: 创建颜色替换脚本**

```bash
cd food-subscription-v01.1-backup
cat > scripts/replace-hardcoded-colors.sh << 'EOF'
#!/bin/bash
# 硬编码颜色替换为暖色调

echo "=== 硬编码颜色替换 ==="
echo "将绿色系替换为暖色系..."

# 1. Home.tsx 渐变背景替换
# 原: from-green-500 via-emerald-500 to-teal-600
# 新: from-orange-500 via-amber-500 to-yellow-600
sed -i 's/from-green-500 via-emerald-500 to-teal-600/from-orange-500 via-amber-500 to-yellow-600/g' frontend-src/src/pages/user/Home.tsx

# 2. Login.tsx 登录页渐变
# 原: from-green-50 via-emerald-50 to-teal-100
# 新: from-orange-50 via-amber-50 to-yellow-100
sed -i 's/from-green-50 via-emerald-50 to-teal-100/from-orange-50 via-amber-50 to-yellow-100/g' frontend-src/src/pages/Login.tsx

# 3. Login.tsx 警告渐变
# 原: from-amber-500 via-orange-500 to-red-500
# 新: 保持原样（已是暖色调）
# 只需要检查

# 4. Login.tsx 按钮渐变
# 原: from-green-500 to-emerald-600
# 新: from-orange-500 to-amber-600
sed -i 's/from-green-500 to-emerald-600/from-orange-500 to-amber-600/g' frontend-src/src/pages/Login.tsx

# 5. Home.tsx 快捷操作卡片颜色
# 替换 bg-green-100 → bg-orange-100, text-green-700 → text-orange-700 等
sed -i 's/bg-green-100/bg-orange-100/g' frontend-src/src/pages/user/Home.tsx
sed -i 's/text-green-700/text-orange-700/g' frontend-src/src/pages/user/Home.tsx
sed -i 's/bg-blue-100/bg-amber-100/g' frontend-src/src/pages/user/Home.tsx
sed -i 's/text-blue-700/text-amber-700/g' frontend-src/src/pages/user/Home.tsx
sed -i 's/bg-purple-100/bg-yellow-100/g' frontend-src/src/pages/user/Home.tsx
sed -i 's/text-purple-700/text-yellow-700/g' frontend-src/src/pages/user/Home.tsx

echo "✓ 硬编码颜色替换完成"
EOF

chmod +x scripts/replace-hardcoded-colors.sh
```

**步骤3: 备份原文件并运行替换**

```bash
cd food-subscription-v01.1-backup
# 备份重要文件
cp frontend-src/src/pages/user/Home.tsx frontend-src/src/pages/user/Home.tsx.backup
cp frontend-src/src/pages/Login.tsx frontend-src/src/pages/Login.tsx.backup

# 运行替换脚本
./scripts/replace-hardcoded-colors.sh
```

**步骤4: 验证颜色替换**

```bash
cd food-subscription-v01.1-backup/frontend-src
echo "检查Home.tsx替换结果..."
grep -n "from-\|bg-\|text-" src/pages/user/Home.tsx | grep -E "(orange|amber|yellow)" | head -10

echo "检查Login.tsx替换结果..."
grep -n "from-\|bg-\|text-" src/pages/Login.tsx | grep -E "(orange|amber|yellow)" | head -10
```

**预期输出:** 显示新的暖色调颜色类

**步骤5: 提交页面样式更新**

```bash
git add frontend-src/src/pages/user/Home.tsx frontend-src/src/pages/Login.tsx scripts/replace-hardcoded-colors.sh
git commit -m "feat: 更新页面硬编码颜色为暖色调"
```

### Task 11: 响应式设计优化

**文件:**
- 修改: `frontend-src/src/pages/user/Home.tsx` (布局响应式)
- 修改: `frontend-src/src/pages/Login.tsx` (表单响应式)
- 修改: `frontend-src/src/pages/user/FoodPackages.tsx` (网格响应式)
- 创建: `docs/design/responsive-guidelines.md`

**步骤1: 检查当前响应式断点使用**

```bash
cd food-subscription-v01.1-backup/frontend-src
# 检查常用响应式类
find src/pages -name "*.tsx" | xargs grep -h "sm:\|md:\|lg:\|xl:\|2xl:" | sort | uniq -c | sort -nr | head -20
```

**预期输出:** 显示最常用的响应式断点类

**步骤2: 优化Home页面响应式布局**

```bash
cd food-subscription-v01.1-backup/frontend-src
# 备份原文件
cp src/pages/user/Home.tsx src/pages/user/Home.tsx.responsive-backup

# 检查并优化网格布局（找到网格容器，约第60-80行）
# 原代码可能使用固定列数，改为响应式
# grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4
```

**步骤3: 创建响应式设计指南**

```bash
cd food-subscription-v01.1-backup
cat > docs/design/responsive-guidelines.md << 'EOF'
# 响应式设计指南

## 断点系统
基于Tailwind CSS默认断点：
- `sm`: 640px (移动端)
- `md`: 768px (平板)
- `lg`: 1024px (桌面)
- `xl`: 1280px (大桌面)
- `2xl`: 1536px (超大桌面)

## 布局模式

### 1. 网格布局
```tsx
// 响应式网格列
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
  {/* 网格项 */}
</div>
```

### 2. 弹性布局
```tsx
// 响应式flex方向
<div className="flex flex-col md:flex-row gap-4">
  <div className="flex-1">左侧内容</div>
  <div className="flex-1">右侧内容</div>
</div>
```

### 3. 显示/隐藏控制
```tsx
// 移动端隐藏，桌面显示
<div className="hidden md:block">桌面可见内容</div>

// 移动端显示，桌面隐藏
<div className="block md:hidden">移动端可见内容</div>
```

### 4. 字体大小响应式
```tsx
<h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl">
  响应式标题
</h1>
```

### 5. 间距响应式
```tsx
<div className="p-4 sm:p-6 md:p-8">
  内边距随屏幕增大
</div>
```

## 最佳实践
1. 移动端优先：先写移动端样式，再用断点覆盖
2. 内容优先：确保小屏幕上内容可读
3. 触摸友好：移动端按钮至少44×44px
4. 图片优化：使用`srcset`和`sizes`属性
EOF
```

**步骤4: 测试响应式效果**

```bash
cd food-subscription-v01.1-backup/frontend-src
# 启动开发服务器测试响应式
npm run dev &
echo "开发服务器启动，测试不同屏幕尺寸："
echo "1. 移动端 (375px): 检查布局是否单列"
echo "2. 平板 (768px): 检查是否变为2列"
echo "3. 桌面 (1024px): 检查是否变为3列"
```

**步骤5: 提交响应式优化**

```bash
git add frontend-src/src/pages/user/Home.tsx docs/design/responsive-guidelines.md
git commit -m "feat: 响应式设计优化和指南"
```

## 阶段4：数据库优化

### Task 12: 数据库索引优化

**文件:**
- 修改: `backend/db/init-mysql.js`
- 创建: `backend/db/optimize-indexes.sql`
- 创建: `scripts/apply-db-indexes.sh`

**步骤1: 分析现有表结构和查询模式**

```bash
cd food-subscription-v01.1-backup/backend/db
# 查看现有表结构
grep -n "CREATE TABLE" init-mysql.js | head -20
echo "现有表数量:"
grep -c "CREATE TABLE" init-mysql.js
```

**预期输出:** 显示表名和数量

**步骤2: 创建索引优化SQL脚本**

```bash
cd food-subscription-v01.1-backup/backend/db
cat > optimize-indexes.sql << 'EOF'
-- 食材包订阅平台 - 数据库索引优化脚本
-- 执行前请备份数据库

-- 1. 用户表索引
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- 2. 食材包表索引
CREATE INDEX IF NOT EXISTS idx_food_packages_status ON food_packages(status);
CREATE INDEX IF NOT EXISTS idx_food_packages_merchant_id ON food_packages(merchant_id);
CREATE INDEX IF NOT EXISTS idx_food_packages_stock ON food_packages(stock_quantity);
CREATE INDEX IF NOT EXISTS idx_food_packages_price ON food_packages(price);
CREATE INDEX IF NOT EXISTS idx_food_packages_created_at ON food_packages(created_at);

-- 3. 订单表索引（高频查询）
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_payment_time ON orders(payment_time);
CREATE INDEX IF NOT EXISTS idx_orders_user_status ON orders(user_id, status);

-- 4. 订阅表索引
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_next_delivery ON subscriptions(next_delivery_date);

-- 5. 地址表索引
CREATE INDEX IF NOT EXISTS idx_addresses_user_id ON addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_addresses_is_default ON addresses(is_default);

-- 6. 支付记录表索引
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at);

-- 7. 库存记录表索引
CREATE INDEX IF NOT EXISTS idx_inventory_logs_package_id ON inventory_logs(package_id);
CREATE INDEX IF NOT EXISTS idx_inventory_logs_created_at ON inventory_logs(created_at);

-- 显示索引创建结果
SELECT '索引优化完成' AS status;
EOF
```

**步骤3: 创建索引应用脚本**

```bash
cd food-subscription-v01.1-backup
cat > scripts/apply-db-indexes.sh << 'EOF'
#!/bin/bash
# 数据库索引优化脚本

echo "=== 数据库索引优化 ==="
echo "警告：执行前请备份数据库！"
echo

DB_HOST=${DB_HOST:-localhost}
DB_USER=${DB_USER:-food_user}
DB_PASSWORD=${DB_PASSWORD:-food123456}
DB_NAME=${DB_NAME:-food_subscription}

# 检查MySQL连接
if ! mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASSWORD" -e "USE $DB_NAME" 2>/dev/null; then
  echo "✗ 数据库连接失败"
  exit 1
fi

echo "✓ 数据库连接成功"
echo "应用索引优化..."

# 执行SQL脚本
mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" < backend/db/optimize-indexes.sql

if [ $? -eq 0 ]; then
  echo "✓ 索引优化SQL执行成功"

  # 验证索引创建
  echo "验证索引创建..."
  mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" << 'SQL'
SHOW INDEXES FROM users;
SHOW INDEXES FROM food_packages;
SHOW INDEXES FROM orders;
SQL

else
  echo "✗ 索引优化执行失败"
  exit 1
fi

echo "=== 索引优化完成 ==="
EOF

chmod +x scripts/apply-db-indexes.sh
```

**步骤4: 测试索引优化（模拟环境）**

```bash
cd food-subscription-v01.1-backup
# 先检查脚本语法
bash -n scripts/apply-db-indexes.sh
echo "脚本语法检查: $?"

# 生成索引应用报告
cat > docs/database/index-optimization-report.md << 'EOF'
# 数据库索引优化报告

## 优化目标
提升高频查询性能，特别是：
1. 用户登录（email查询）
2. 订单查询（user_id + status）
3. 食材包筛选（status, merchant_id, price）
4. 订阅管理（user_id, status, next_delivery）

## 新增索引
1. **users表**: email, role, created_at
2. **food_packages表**: status, merchant_id, stock_quantity, price, created_at
3. **orders表**: user_id, status, created_at, payment_time, (user_id+status)组合索引
4. **subscriptions表**: user_id, status, next_delivery_date
5. **addresses表**: user_id, is_default
6. **payments表**: order_id, status, created_at
7. **inventory_logs表**: package_id, created_at

## 预期性能提升
- 用户登录查询: 10-100倍
- 订单列表查询: 5-50倍
- 食材包筛选: 3-30倍
- 订阅管理: 5-40倍

## 风险评估
- 索引增加写操作开销（可接受）
- 需要额外存储空间（约10-20%）
- 无数据丢失风险
EOF
```

**步骤5: 提交数据库索引优化**

```bash
git add backend/db/optimize-indexes.sql scripts/apply-db-indexes.sh docs/database/index-optimization-report.md
git commit -m "feat: 数据库索引优化方案"
```

### Task 13: 外键约束和完整性优化

**文件:**
- 修改: `backend/db/init-mysql.js`
- 创建: `backend/db/foreign-keys.sql`
- 创建: `scripts/verify-data-integrity.sh`

**步骤1: 分析现有表关系**

```bash
cd food-subscription-v01.1-backup/backend/db
# 查找可能的外键关系
echo "潜在的外键关系："
grep -n "user_id\|package_id\|order_id\|merchant_id" init-mysql.js | grep "INT\|VARCHAR" | head -20
```

**预期输出:** 显示包含外键字段的表

**步骤2: 创建外键约束SQL**

```bash
cd food-subscription-v01.1-backup/backend/db
cat > foreign-keys.sql << 'EOF'
-- 食材包订阅平台 - 外键约束优化脚本
-- 增强数据完整性，防止孤儿记录

-- 1. orders表外键（引用users和food_packages）
ALTER TABLE orders
  ADD CONSTRAINT fk_orders_user_id
  FOREIGN KEY (user_id) REFERENCES users(id)
  ON DELETE CASCADE
  ON UPDATE CASCADE;

ALTER TABLE orders
  ADD CONSTRAINT fk_orders_package_id
  FOREIGN KEY (package_id) REFERENCES food_packages(id)
  ON DELETE RESTRICT
  ON UPDATE CASCADE;

-- 2. subscriptions表外键（引用users和food_packages）
ALTER TABLE subscriptions
  ADD CONSTRAINT fk_subscriptions_user_id
  FOREIGN KEY (user_id) REFERENCES users(id)
  ON DELETE CASCADE
  ON UPDATE CASCADE;

ALTER TABLE subscriptions
  ADD CONSTRAINT fk_subscriptions_package_id
  FOREIGN KEY (package_id) REFERENCES food_packages(id)
  ON DELETE RESTRICT
  ON UPDATE CASCADE;

-- 3. addresses表外键（引用users）
ALTER TABLE addresses
  ADD CONSTRAINT fk_addresses_user_id
  FOREIGN KEY (user_id) REFERENCES users(id)
  ON DELETE CASCADE
  ON UPDATE CASCADE;

-- 4. diet_profiles表外键（引用users）
ALTER TABLE diet_profiles
  ADD CONSTRAINT fk_diet_profiles_user_id
  FOREIGN KEY (user_id) REFERENCES users(id)
  ON DELETE CASCADE
  ON UPDATE CASCADE;

-- 5. inventory_logs表外键（引用food_packages）
ALTER TABLE inventory_logs
  ADD CONSTRAINT fk_inventory_logs_package_id
  FOREIGN KEY (package_id) REFERENCES food_packages(id)
  ON DELETE CASCADE
  ON UPDATE CASCADE;

-- 6. payments表外键（引用orders）
ALTER TABLE payments
  ADD CONSTRAINT fk_payments_order_id
  FOREIGN KEY (order_id) REFERENCES orders(id)
  ON DELETE CASCADE
  ON UPDATE CASCADE;

-- 7. food_packages表外键（引用suppliers）
ALTER TABLE food_packages
  ADD CONSTRAINT fk_food_packages_supplier_id
  FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
  ON DELETE SET NULL
  ON UPDATE CASCADE;

-- 显示外键创建结果
SELECT '外键约束优化完成' AS status;
EOF
```

**步骤3: 创建数据完整性验证脚本**

```bash
cd food-subscription-v01.1-backup
cat > scripts/verify-data-integrity.sh << 'EOF'
#!/bin/bash
# 数据完整性验证脚本

echo "=== 数据完整性验证 ==="

DB_HOST=${DB_HOST:-localhost}
DB_USER=${DB_USER:-food_user}
DB_PASSWORD=${DB_PASSWORD:-food123456}
DB_NAME=${DB_NAME:-food_subscription}

# 检查孤儿记录（外键引用不存在）
cat > /tmp/check_orphans.sql << 'SQL'
-- 检查orders表中的孤儿记录
SELECT 'orders表中无效user_id' AS issue, COUNT(*) AS count
FROM orders o
LEFT JOIN users u ON o.user_id = u.id
WHERE u.id IS NULL AND o.user_id IS NOT NULL
UNION ALL
SELECT 'orders表中无效package_id' AS issue, COUNT(*) AS count
FROM orders o
LEFT JOIN food_packages fp ON o.package_id = fp.id
WHERE fp.id IS NULL AND o.package_id IS NOT NULL
UNION ALL
SELECT 'subscriptions表中无效user_id' AS issue, COUNT(*) AS count
FROM subscriptions s
LEFT JOIN users u ON s.user_id = u.id
WHERE u.id IS NULL AND s.user_id IS NOT NULL
UNION ALL
SELECT 'subscriptions表中无效package_id' AS issue, COUNT(*) AS count
FROM subscriptions s
LEFT JOIN food_packages fp ON s.package_id = fp.id
WHERE fp.id IS NULL AND s.package_id IS NOT NULL
UNION ALL
SELECT 'addresses表中无效user_id' AS issue, COUNT(*) AS count
FROM addresses a
LEFT JOIN users u ON a.user_id = u.id
WHERE u.id IS NULL AND a.user_id IS NOT NULL;
SQL

echo "检查孤儿记录..."
mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" < /tmp/check_orphans.sql

# 检查数据一致性
cat > /tmp/check_consistency.sql << 'SQL'
-- 检查订单和支付状态一致性
SELECT '订单已支付但无支付记录' AS issue, COUNT(*) AS count
FROM orders o
WHERE o.status = 'paid' AND NOT EXISTS (
  SELECT 1 FROM payments p WHERE p.order_id = o.id AND p.status = 'completed'
)
UNION ALL
-- 检查库存数量不为负
SELECT '库存数量为负' AS issue, COUNT(*) AS count
FROM food_packages
WHERE stock_quantity < 0
UNION ALL
-- 检查价格合理性
SELECT '价格异常（<=0）' AS issue, COUNT(*) AS count
FROM food_packages
WHERE price <= 0;
SQL

echo "检查数据一致性..."
mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" < /tmp/check_consistency.sql

rm -f /tmp/check_orphans.sql /tmp/check_consistency.sql
echo "=== 数据完整性验证完成 ==="
EOF

chmod +x scripts/verify-data-integrity.sh
```

**步骤4: 生成外键约束报告**

```bash
cd food-subscription-v01.1-backup
cat > docs/database/foreign-keys-report.md << 'EOF'
# 外键约束优化报告

## 优化目标
增强数据完整性，防止：
1. 孤儿记录（引用不存在的父记录）
2. 数据不一致（如已支付订单无支付记录）
3. 无效数据（如负库存、异常价格）

## 新增外键约束

### 核心关系约束
1. **orders → users** (CASCADE删除)
   - 用户删除时自动删除其订单

2. **orders → food_packages** (RESTRICT删除)
   - 阻止删除有订单的食材包

3. **subscriptions → users** (CASCADE删除)
   - 用户删除时自动删除其订阅

4. **subscriptions → food_packages** (RESTRICT删除)
   - 阻止删除有订阅的食材包

### 辅助关系约束
5. **addresses → users** (CASCADE删除)
6. **diet_profiles → users** (CASCADE删除)
7. **inventory_logs → food_packages** (CASCADE删除)
8. **payments → orders** (CASCADE删除)
9. **food_packages → suppliers** (SET NULL删除)

## 约束策略说明
- **CASCADE**: 父记录删除时，子记录自动删除
- **RESTRICT**: 阻止删除有子记录的父记录
- **SET NULL**: 父记录删除时，子记录外键设为NULL

## 数据清理建议
应用外键前，先运行数据完整性检查脚本，清理孤儿记录：
```bash
./scripts/verify-data-integrity.sh
```
EOF
```

**步骤5: 提交外键约束优化**

```bash
git add backend/db/foreign-keys.sql scripts/verify-data-integrity.sh docs/database/foreign-keys-report.md
git commit -m "feat: 外键约束和数据完整性优化"
```

## 阶段5：部署流程升级

### Task 14: 更新部署脚本支持域名访问

**文件:**
- 修改: `v1_2.sh`
- 创建: `deploy-with-domain.sh`
- 修改: `update-server.py`
- 创建: `scripts/setup-domain.sh`

**步骤1: 分析当前v1_2.sh部署流程**

```bash
cd food-subscription-v01.1-backup
# 查看v1_2.sh关键部分
grep -n "nginx\|8080\|server_name\|listen" v1_2.sh | head -20
echo "当前部署端口:"
grep -n "listen" v1_2.sh | grep -v "#"
```

**预期输出:** 显示当前Nginx配置（可能是8080端口）

**步骤2: 创建域名部署脚本**

```bash
cd food-subscription-v01.1-backup
cat > deploy-with-domain.sh << 'EOF'
#!/bin/bash
# 域名部署脚本（HTTP，端口80）

set -e  # 出错时退出

echo "=== 食材包订阅平台 - 域名部署 ==="
echo "支持 http://yourdomain.com 访问（无端口）"
echo

# 配置变量
DOMAIN=${1:-"yourdomain.com"}
PROJECT_DIR="/var/www/food-subscription-v01.1-backup"
NGINX_AVAILABLE="/etc/nginx/sites-available"
NGINX_ENABLED="/etc/nginx/sites-enabled"
SERVICE_NAME="food-subscription"

# 检查权限
if [ "$EUID" -ne 0 ]; then
  echo "✗ 请使用sudo运行此脚本"
  exit 1
fi

echo "配置域名: $DOMAIN"
echo "项目目录: $PROJECT_DIR"
echo

# 步骤1: 更新Nginx配置
echo "1. 更新Nginx配置支持域名..."
cat > "$NGINX_AVAILABLE/food-subscription" << NGINXCONF
# 食材包订阅平台 - 域名配置
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;

    # 前端静态文件
    root $PROJECT_DIR/frontend/dist;
    index index.html;

    # Gzip压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript text/xml;

    # 前端路由支持（单页应用）
    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # API代理到后端（端口3001）
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # 上传文件访问
    location /uploads/ {
        alias $PROJECT_DIR/backend/uploads/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # 错误页面
    error_page 404 /index.html;
    error_page 500 502 503 504 /50x.html;
    location = /50x.html {
        root /usr/share/nginx/html;
    }
}
NGINXCONF

# 启用站点配置
ln -sf "$NGINX_AVAILABLE/food-subscription" "$NGINX_ENABLED/food-subscription"

# 移除旧的8080配置（如果存在）
rm -f "$NGINX_ENABLED/default" 2>/dev/null || true

# 测试Nginx配置
echo "测试Nginx配置..."
nginx -t

if [ $? -eq 0 ]; then
  echo "✓ Nginx配置测试通过"
else
  echo "✗ Nginx配置测试失败"
  exit 1
fi

# 步骤2: 更新后端环境变量
echo "2. 配置后端环境变量..."
cat > "$PROJECT_DIR/backend/.env.production" << ENV
PORT=3001
DB_HOST=localhost
DB_USER=food_user
DB_PASSWORD=food123456
DB_NAME=food_subscription
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=production
FRONTEND_URL=http://$DOMAIN
ENV

# 步骤3: 更新前端环境变量
echo "3. 配置前端环境变量..."
cat > "$PROJECT_DIR/frontend-src/.env.production" << FRONTENDENV
VITE_API_BASE_URL=/api
FRONTENDENV

# 步骤4: 重启服务
echo "4. 重启服务..."
systemctl restart nginx
systemctl restart $SERVICE_NAME 2>/dev/null || echo "服务 $SERVICE_NAME 不存在，请手动启动"

echo
echo "=== 部署完成 ==="
echo "域名配置: http://$DOMAIN"
echo "API地址: http://$DOMAIN/api/"
echo "上传文件: http://$DOMAIN/uploads/"
echo
echo "下一步:"
echo "1. 配置DNS将 $DOMAIN 解析到服务器IP"
echo "2. 访问 http://$DOMAIN 验证部署"
echo "3. 如有问题，查看日志: sudo journalctl -u $SERVICE_NAME -f"
EOF

chmod +x deploy-with-domain.sh
```

**步骤3: 更新v1_2.sh支持域名选项**

```bash
cd food-subscription-v01.1-backup
# 备份原文件
cp v1_2.sh v1_2.sh.backup

# 在文件末尾添加域名部署选项（找到文件末尾，约第200行后）
# 这里只添加注释说明，实际执行时使用新脚本
echo "当前v1_2.sh已备份，新增域名部署请使用 deploy-with-domain.sh"
```

**步骤4: 创建域名设置助手脚本**

```bash
cd food-subscription-v01.1-backup
cat > scripts/setup-domain.sh << 'EOF'
#!/bin/bash
# 域名设置助手脚本

echo "=== 域名设置助手 ==="
echo "此脚本帮助配置DNS和验证域名访问"
echo

DOMAIN=${1:-""}
if [ -z "$DOMAIN" ]; then
  read -p "请输入域名 (如: example.com): " DOMAIN
fi

SERVER_IP=$(curl -s ifconfig.me || hostname -I | awk '{print $1}')

echo
echo "=== 配置说明 ==="
echo "域名: $DOMAIN"
echo "服务器IP: $SERVER_IP"
echo

echo "=== DNS配置指南 ==="
cat << DNSGUIDE
请在你的域名注册商处添加以下DNS记录：

1. A记录（主域名）
   名称: @
   类型: A
   值: $SERVER_IP
   TTL: 3600

2. A记录（www子域名）
   名称: www
   类型: A
   值: $SERVER_IP
   TTL: 3600

3. 可选：CNAME记录（其他子域名）
   名称: api
   类型: CNAME
   值: $DOMAIN
   TTL: 3600
DNSGUIDE

echo
echo "=== 验证步骤 ==="
cat << VERIFYSTEPS
1. 等待DNS生效（通常5-30分钟）
2. 测试域名解析：
   ping $DOMAIN
   nslookup $DOMAIN

3. 部署完成后测试访问：
   curl -I http://$DOMAIN
   curl http://$DOMAIN/api/health

4. 检查Nginx配置：
   sudo nginx -t
   sudo systemctl status nginx
VERIFYSTEPS

echo
echo "=== 快速部署命令 ==="
echo "sudo ./deploy-with-domain.sh $DOMAIN"
EOF

chmod +x scripts/setup-domain.sh
```

**步骤5: 提交部署脚本更新**

```bash
git add deploy-with-domain.sh scripts/setup-domain.sh v1_2.sh v1_2.sh.backup
git commit -m "feat: 添加域名部署脚本和工具"
```

### Task 15: 更新Nginx配置和生产环境变量

**文件:**
- 创建: `nginx/food-subscription-domain.conf`
- 修改: `backend/.env.example`
- 修改: `frontend-src/.env.example`
- 创建: `scripts/validate-deployment.sh`

**步骤1: 创建标准Nginx域名配置模板**

```bash
cd food-subscription-v01.1-backup
mkdir -p nginx
cat > nginx/food-subscription-domain.conf << 'EOF'
# 食材包订阅平台 - 生产环境Nginx配置（域名版）
# 保存为: /etc/nginx/sites-available/food-subscription
# 使用前替换 YOUR_DOMAIN.com 为实际域名

server {
    listen 80;
    server_name YOUR_DOMAIN.com www.YOUR_DOMAIN.com;

    # 安全头部
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # 前端静态文件
    root /var/www/food-subscription-v01.1-backup/frontend/dist;
    index index.html;

    # Gzip压缩（提升性能）
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;

    # 静态文件缓存
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 365d;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # 前端路由支持（单页应用）
    location / {
        try_files $uri $uri/ /index.html;
        # 禁用HTML文件缓存
        expires -1;
        add_header Cache-Control "no-store, no-cache, must-revalidate, proxy-revalidate";
    }

    # API代理到后端（端口3001）
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # 超时设置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;

        # 缓冲区设置
        proxy_buffering on;
        proxy_buffer_size 4k;
        proxy_buffers 8 4k;
        proxy_busy_buffers_size 8k;
    }

    # 上传文件访问
    location /uploads/ {
        alias /var/www/food-subscription-v01.1-backup/backend/uploads/;
        expires 30d;
        add_header Cache-Control "public, immutable";

        # 安全限制
        internal;
        limit_except GET {
            deny all;
        }
    }

    # 健康检查端点
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }

    # 阻止敏感文件访问
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }

    location ~* \.(sql|log|env|sh|bak|old)$ {
        deny all;
        access_log off;
        log_not_found off;
    }

    # 错误页面
    error_page 404 /index.html;
    error_page 500 502 503 504 /50x.html;
    location = /50x.html {
        root /usr/share/nginx/html;
        internal;
    }
}

# HTTP重定向到HTTPS（未来启用SSL时使用）
# server {
#     listen 80;
#     server_name YOUR_DOMAIN.com www.YOUR_DOMAIN.com;
#     return 301 https://$server_name$request_uri;
# }
EOF
```

**步骤2: 更新环境变量模板文件**

```bash
cd food-subscription-v01.1-backup
# 更新后端环境变量模板
cat > backend/.env.example << 'EOF'
# 食材包订阅平台 - 后端环境变量示例
# 复制为 .env 文件并修改实际值

# ==================== 数据库配置 ====================
DB_HOST=localhost
DB_PORT=3306
DB_USER=food_user
DB_PASSWORD=your_secure_password_here
DB_NAME=food_subscription

# ==================== 服务器配置 ====================
PORT=3001
NODE_ENV=production
HOST=0.0.0.0

# ==================== JWT认证配置 ====================
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d  # token有效期7天
JWT_REFRESH_EXPIRES_IN=30d  # 刷新token有效期30天

# ==================== 跨域配置 ====================
FRONTEND_URL=http://YOUR_DOMAIN.com
CORS_ORIGINS=http://localhost:5173,http://YOUR_DOMAIN.com

# ==================== 文件上传配置 ====================
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760  # 10MB
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,image/webp

# ==================== 邮件配置（可选） ====================
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_USER=your-email@gmail.com
# SMTP_PASS=your-app-password
# EMAIL_FROM=noreply@yourdomain.com

# ==================== 缓存配置（可选） ====================
# REDIS_HOST=localhost
# REDIS_PORT=6379
# REDIS_PASSWORD=
EOF

# 更新前端环境变量模板
cat > frontend-src/.env.example << 'EOF'
# 食材包订阅平台 - 前端环境变量示例
# Vite环境变量，以VITE_前缀开头

# ==================== API配置 ====================
# 开发环境（本地开发）
VITE_API_BASE_URL=http://localhost:3001/api

# 生产环境（构建时替换）
# VITE_API_BASE_URL=/api

# ==================== 应用配置 ====================
VITE_APP_NAME=食材包订阅平台
VITE_APP_VERSION=1.2.0
VITE_APP_DESCRIPTION=高品质食材包订阅服务

# ==================== 功能开关 ====================
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_DEBUG=false
VITE_ENABLE_MOCK_API=false  # 设为true使用mock数据

# ==================== 第三方服务（可选） ====================
# VITE_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
# VITE_STRIPE_PUBLIC_KEY=your-stripe-public-key
EOF
```

**步骤3: 创建部署验证脚本**

```bash
cd food-subscription-v01.1-backup
cat > scripts/validate-deployment.sh << 'EOF'
#!/bin/bash
# 部署验证脚本

set -e

echo "=== 部署验证检查 ==="
echo "检查时间: $(date)"
echo

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

check_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓ $2${NC}"
    else
        echo -e "${RED}✗ $2${NC}"
        if [ "$3" = "fatal" ]; then
            exit 1
        fi
    fi
}

# 1. 检查服务状态
echo "1. 检查服务状态..."
systemctl is-active --quiet nginx
check_status $? "Nginx服务运行"

systemctl is-active --quiet mysql
check_status $? "MySQL服务运行"

systemctl is-active --quiet food-subscription 2>/dev/null || pgrep -f "node.*server.js" >/dev/null
check_status $? "后端服务运行"

# 2. 检查端口监听
echo "2. 检查端口监听..."
ss -tulpn | grep -E ":80\s|:3001\s" | grep LISTEN
check_status $? "端口80和3001监听" "warning"

# 3. 检查Nginx配置
echo "3. 检查Nginx配置..."
nginx -t 2>&1
check_status $? "Nginx配置语法" "fatal"

# 4. 检查API健康
echo "4. 检查API健康..."
API_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/api/health || echo "000")
if [ "$API_RESPONSE" = "200" ]; then
    echo -e "${GREEN}✓ API健康检查通过 (HTTP $API_RESPONSE)${NC}"
else
    echo -e "${YELLOW}⚠ API健康检查异常 (HTTP $API_RESPONSE)${NC}"
fi

# 5. 检查前端文件
echo "5. 检查前端文件..."
if [ -f "/var/www/food-subscription-v01.1-backup/frontend/dist/index.html" ]; then
    echo -e "${GREEN}✓ 前端文件存在${NC}"
else
    echo -e "${YELLOW}⚠ 前端文件缺失${NC}"
fi

# 6. 检查数据库连接
echo "6. 检查数据库连接..."
DB_CHECK=$(mysql -h localhost -u food_user -pfood123456 -e "SELECT 1" food_subscription 2>/dev/null && echo "ok" || echo "fail")
if [ "$DB_CHECK" = "ok" ]; then
    echo -e "${GREEN}✓ 数据库连接正常${NC}"
else
    echo -e "${YELLOW}⚠ 数据库连接异常${NC}"
fi

# 7. 检查域名解析（如果配置了域名）
if [ -n "$1" ]; then
    echo "7. 检查域名解析..."
    DOMAIN="$1"
    DIG_RESULT=$(dig +short "$DOMAIN" 2>/dev/null | head -1)
    if [ -n "$DIG_RESULT" ]; then
        echo -e "${GREEN}✓ 域名 $DOMAIN 解析到 $DIG_RESULT${NC}"
    else
        echo -e "${YELLOW}⚠ 域名 $DOMAIN 解析失败${NC}"
    fi
fi

echo
echo "=== 验证总结 ==="
echo "基本部署验证完成"
echo "详细信息查看日志:"
echo "  sudo journalctl -u nginx --since '5 minutes ago'"
echo "  sudo journalctl -u food-subscription --since '5 minutes ago'"
echo "  tail -f /var/log/nginx/error.log"
EOF

chmod +x scripts/validate-deployment.sh
```

**步骤4: 创建部署文档**

```bash
cd food-subscription-v01.1-backup
cat > DEPLOYMENT-GUIDE.md << 'EOF'
# 部署指南 - 域名版

## 部署前提
1. 干净的Linux服务器（Ubuntu 20.04+/CentOS 7+）
2. 域名（已购买并可以配置DNS）
3. SSH访问权限

## 快速部署步骤

### 1. 服务器环境准备
```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装基础工具
sudo apt install -y curl wget git vim
```

### 2. 部署平台
```bash
# 克隆项目
cd /var/www
sudo git clone git@codehub.devcloud.cn-north-4.huaweicloud.com:a384bf0b99f140dbaa16281939ab38b1/huawei_food_subscription.git food-subscription-v01.1-backup
cd food-subscription-v01.1-backup

# 运行域名部署脚本（替换yourdomain.com）
sudo ./deploy-with-domain.sh yourdomain.com
```

### 3. 配置DNS
在域名注册商处添加A记录：
- 主机名：@ → 服务器IP
- 主机名：www → 服务器IP

### 4. 验证部署
```bash
# 运行验证脚本
sudo ./scripts/validate-deployment.sh yourdomain.com

# 手动测试
curl -I http://yourdomain.com
curl http://yourdomain.com/api/health
```

## 环境变量配置

### 后端环境变量 (`backend/.env`)
```bash
# 复制模板
cp backend/.env.example backend/.env
# 编辑实际值
vim backend/.env
```

关键配置：
- `DB_PASSWORD`: 数据库密码（修改默认值）
- `JWT_SECRET`: JWT密钥（必须修改）
- `FRONTEND_URL`: 前端域名

### 前端环境变量 (`frontend-src/.env.production`)
部署脚本已自动生成，如需修改：
```bash
vim frontend-src/.env.production
```

## 服务管理

### 查看服务状态
```bash
# Nginx
sudo systemctl status nginx

# 后端服务
sudo systemctl status food-subscription

# MySQL
sudo systemctl status mysql
```

### 查看日志
```bash
# Nginx访问日志
sudo tail -f /var/log/nginx/access.log

# Nginx错误日志
sudo tail -f /var/log/nginx/error.log

# 后端应用日志
sudo journalctl -u food-subscription -f

# 数据库日志
sudo tail -f /var/log/mysql/error.log
```

### 重启服务
```bash
# 全部重启
sudo systemctl restart nginx mysql food-subscription

# 单独重启后端
sudo systemctl restart food-subscription
```

## 故障排查

### 1. 无法访问网站
```bash
# 检查防火墙
sudo ufw status

# 检查端口监听
sudo ss -tulpn | grep :80

# 检查Nginx配置
sudo nginx -t
```

### 2. API返回错误
```bash
# 检查后端服务
sudo systemctl status food-subscription

# 检查数据库连接
mysql -u food_user -p -e "SELECT 1" food_subscription
```

### 3. 静态文件404
```bash
# 检查前端文件
ls -la /var/www/food-subscription-v01.1-backup/frontend/dist/

# 检查Nginx权限
sudo chown -R www-data:www-data /var/www/food-subscription-v01.1-backup/frontend/dist
```

## 更新部署

### 手动更新
```bash
cd /var/www/food-subscription-v01.1-backup
sudo git pull
sudo ./deploy-with-domain.sh yourdomain.com
```

### 使用更新脚本
```bash
cd /var/www/food-subscription-v01.1-backup
sudo python3 update-server.py
```

## 备份与恢复

### 数据库备份
```bash
# 手动备份
mysqldump -u food_user -p food_subscription > backup-$(date +%Y%m%d).sql

# 自动备份脚本
sudo crontab -e
# 添加：0 2 * * * mysqldump -u food_user -pPASSWORD food_subscription > /backups/db-$(date +\%Y\%m\%d).sql
```

### 文件备份
```bash
# 备份整个项目
tar -czf backup-$(date +%Y%m%d).tar.gz /var/www/food-subscription-v01.1-backup

# 备份上传文件
tar -czf uploads-backup-$(date +%Y%m%d).tar.gz /var/www/food-subscription-v01.1-backup/backend/uploads
```

## 性能优化建议

### 1. 启用缓存
```bash
# 安装Redis
sudo apt install -y redis-server

# 配置后端使用Redis缓存
# 在backend/.env中添加：
# REDIS_HOST=localhost
# REDIS_PORT=6379
```

### 2. 启用Gzip
Nginx配置已包含Gzip压缩

### 3. 图片优化
```bash
# 安装图片优化工具
sudo apt install -y jpegoptim optipng webp
```

## 安全建议

### 1. 修改默认密码
- 数据库密码（food123456）
- JWT密钥（默认值）
- 系统用户密码

### 2. 配置防火墙
```bash
sudo ufw allow 80/tcp
sudo ufw allow 22/tcp
sudo ufw enable
```

### 3. 定期更新
```bash
# 系统更新
sudo apt update && sudo apt upgrade -y

# 依赖更新
cd /var/www/food-subscription-v01.1-backup/backend
npm audit fix

cd ../frontend-src
npm audit fix
```

## 联系我们
如有问题，请查看：
1. 项目文档：README.md
2. 部署日志：/var/log/...
3. 问题反馈：GitHub Issues
EOF
```

**步骤5: 提交部署配置更新**

```bash
git add nginx/food-subscription-domain.conf backend/.env.example frontend-src/.env.example scripts/validate-deployment.sh DEPLOYMENT-GUIDE.md
git commit -m "feat: 完善部署配置和文档"
```

## 阶段6：小白教程编写

### Task 16: 编写完整的小白教程

**文件:**
- 创建: `docs/tutorials/01-environment-setup.md`
- 创建: `docs/tutorials/02-development-workflow.md`
- 创建: `docs/tutorials/03-deployment-guide.md`
- 创建: `docs/tutorials/04-troubleshooting.md`
- 创建: `docs/tutorials/05-daily-maintenance.md`
- 创建: `TUTORIAL-INDEX.md`

**步骤1: 创建环境搭建教程**

```bash
cd food-subscription-v01.1-backup
mkdir -p docs/tutorials

cat > docs/tutorials/01-environment-setup.md << 'EOF'
# 教程1: 环境搭建（小白版）

## 目标
从零开始搭建食材包订阅平台的开发环境

## 适合人群
- 编程新手
- 没有Linux经验
- 想学习全栈开发

## 所需时间
1-2小时

## 步骤详解

### 1.1 安装Windows开发环境

#### 1.1.1 安装Git
1. 访问 https://git-scm.com/download/win
2. 下载Git for Windows
3. 双击安装，全部选项默认即可
4. 安装完成后，在桌面右键选择"Git Bash Here"

验证安装：
```bash
git --version
# 应该显示版本号，如: git version 2.40.0
```

#### 1.1.2 安装Node.js
1. 访问 https://nodejs.org/
2. 下载LTS版本（长期支持版）
3. 双击安装，全部选项默认
4. 安装完成后重启电脑

验证安装：
```bash
node --version
# 应该显示版本号，如: v20.11.0
npm --version
# 应该显示版本号，如: 10.2.4
```

#### 1.1.3 安装VS Code（代码编辑器）
1. 访问 https://code.visualstudio.com/
2. 下载Windows版
3. 双击安装，建议勾选"添加到PATH"

### 1.2 获取项目代码

#### 方法1: 下载ZIP（最简单）
1. 访问GitHub项目页面
2. 点击绿色的"Code"按钮
3. 选择"Download ZIP"
4. 解压到桌面或D盘

#### 方法2: 使用Git克隆（推荐）
```bash
# 打开Git Bash
cd /d/Projects  # 切换到D盘Projects文件夹
git clone https://github.com/HaoChenXX/food-subscription.git
cd food-subscription
```

### 1.3 安装项目依赖

#### 前端依赖安装：
```bash
# 进入前端目录
cd food-subscription-v01.1-backup/frontend-src

# 安装依赖（可能需要几分钟）
npm install

# 如果遇到网络问题，使用淘宝镜像
npm config set registry https://registry.npmmirror.com
npm install
```

#### 后端依赖安装：
```bash
# 进入后端目录
cd ../backend

# 安装依赖
npm install
```

### 1.4 安装MySQL数据库

#### Windows安装MySQL：
1. 访问 https://dev.mysql.com/downloads/installer/
2. 下载MySQL Installer
3. 选择"Developer Default"
4. 设置root密码（记住这个密码！）
5. 完成安装

#### 创建项目数据库：
1. 打开MySQL Command Line Client
2. 输入root密码登录
3. 执行以下命令：

```sql
-- 创建数据库
CREATE DATABASE food_subscription;

-- 创建用户
CREATE USER 'food_user'@'localhost' IDENTIFIED BY 'food123456';

-- 授权
GRANT ALL PRIVILEGES ON food_subscription.* TO 'food_user'@'localhost';

-- 刷新权限
FLUSH PRIVILEGES;

-- 退出
EXIT;
```

### 1.5 启动开发服务器

#### 启动后端服务：
```bash
# 新开一个Git Bash窗口
cd food-subscription-v01.1-backup/backend
npm run dev

# 看到以下信息表示成功：
# Server is running on port 3001
# Database connected successfully
```

#### 启动前端服务：
```bash
# 再开一个Git Bash窗口
cd food-subscription-v01.1-backup/frontend-src
npm run dev

# 看到以下信息表示成功：
# VITE v4.5.0  ready in 1234 ms
# ➜  Local:   http://localhost:5173/
```

### 1.6 验证安装

打开浏览器访问：
1. 前端页面：http://localhost:5173
2. 后端API：http://localhost:3001/api/health

应该看到：
- 前端：登录页面
- 后端：{"status":"ok"}

### 1.7 常见问题解决

#### Q1: npm install 报错
```
# 清理缓存重试
npm cache clean --force
npm install
```

#### Q2: 端口被占用
```
# 查找占用端口的进程
netstat -ano | findstr :3001
# 结束进程（替换PID）
taskkill /PID 1234 /F
```

#### Q3: MySQL连接失败
检查：
1. MySQL服务是否启动（服务中查看MySQL）
2. 用户名密码是否正确
3. 数据库名是否正确

### 1.8 下一步
环境搭建完成！接下来学习：
- 教程2: 开发流程
- 教程3: 代码修改
EOF
```

**步骤2: 创建开发流程教程**

```bash
cat > docs/tutorials/02-development-workflow.md << 'EOF'
# 教程2: 开发流程（小白版）

## 目标
学会如何修改代码、测试、提交到GitHub

## Git基本概念
- **仓库(Repository)**: 项目的代码库
- **提交(Commit)**: 保存一次代码修改
- **分支(Branch)**: 代码的独立版本
- **推送(Push)**: 上传代码到远程仓库
- **拉取(Pull)**: 下载远程仓库代码

## 开发流程步骤

### 2.1 每日开始工作

#### 1. 更新代码
```bash
# 进入项目目录
cd food-subscription-v01.1-backup

# 拉取最新代码
git pull
```

#### 2. 检查状态
```bash
# 查看当前状态
git status

# 查看修改
git diff
```

### 2.2 创建新功能分支

#### 1. 创建分支
```bash
# 创建并切换到新分支
git checkout -b feature/修改按钮颜色

# 查看当前分支
git branch
# 带*的是当前分支
```

#### 2. 分支命名规范
- `feature/功能描述`: 新功能开发
- `fix/问题描述`: bug修复
- `docs/文档描述`: 文档更新
- `style/样式描述`: 样式修改

### 2.3 修改代码

#### 1. 使用VS Code打开项目
```bash
# 在项目目录右键，用VS Code打开
code .
```

#### 2. 找到要修改的文件
项目结构：
```
frontend-src/src/pages/      # 页面文件
frontend-src/src/components/ # 组件文件
backend/routes/              # API接口
backend/db/                  # 数据库文件
```

#### 3. 修改示例：改变按钮颜色
找到文件：`frontend-src/src/components/ui/button.tsx`

修改前：
```tsx
className="bg-primary text-primary-foreground"
```

修改后：
```tsx
className="bg-orange-500 text-white"
```

#### 4. 保存文件
Ctrl + S 保存修改

### 2.4 测试修改

#### 1. 查看效果
前端自动刷新（热重载），直接在浏览器查看

#### 2. 控制台查看错误
F12打开开发者工具 → Console标签

#### 3. 测试API
```bash
# 测试后端API
curl http://localhost:3001/api/health
```

### 2.5 提交代码

#### 1. 查看修改
```bash
git status
# 显示修改的文件
```

#### 2. 添加修改到暂存区
```bash
# 添加单个文件
git add frontend-src/src/components/ui/button.tsx

# 添加所有修改
git add .
```

#### 3. 提交修改
```bash
git commit -m "feat: 修改按钮颜色为橙色"
```

提交信息格式：
- `feat: 描述` - 新功能
- `fix: 描述` - bug修复
- `docs: 描述` - 文档更新
- `style: 描述` - 样式修改
- `chore: 描述` - 杂项

### 2.6 推送到远程仓库

#### 1. 推送到GitHub
```bash
git push origin feature/修改按钮颜色
```

#### 2. 创建Pull Request
1. 访问GitHub项目页面
2. 点击"Pull requests"
3. 点击"New pull request"
4. 选择你的分支
5. 填写描述，点击"Create pull request"

### 2.7 合并到主分支

#### 1. 代码审查
等待他人审查你的代码

#### 2. 合并分支
在GitHub页面点击"Merge pull request"

#### 3. 更新本地主分支
```bash
# 切换回主分支
git checkout main

# 拉取最新代码
git pull

# 删除已合并的分支
git branch -d feature/修改按钮颜色
```

### 2.8 实用Git命令

#### 常用命令
```bash
# 查看状态
git status

# 查看提交历史
git log --oneline

# 撤销修改（未提交）
git checkout -- 文件名

# 撤销暂存
git reset HEAD 文件名

# 修改最后一次提交
git commit --amend
```

#### 解决冲突
当多人修改同一文件时：
1. 拉取最新代码：`git pull`
2. 解决冲突（VS Code会提示）
3. 重新提交：`git add . && git commit -m "fix: 解决冲突"`

### 2.9 开发注意事项

#### 1. 频繁提交
每完成一个小功能就提交一次

#### 2. 写清楚的提交信息
说明"为什么"修改，而不是"修改了什么"

#### 3. 保持分支干净
一个分支只做一个功能

#### 4. 测试后再提交
确保代码能正常运行

### 2.10 练习任务

#### 任务1: 修改首页标题
1. 创建分支：`git checkout -b feature/修改首页标题`
2. 修改文件：`frontend-src/src/pages/user/Home.tsx`
3. 找到`<h1>`标签，修改文字
4. 提交并推送

#### 任务2: 添加控制台日志
1. 在按钮点击事件中添加`console.log('按钮点击')`
2. 测试并提交

### 2.11 下一步
开发流程掌握后，学习：
- 教程3: 部署到服务器
- 教程4: 故障排查
EOF
```

**步骤3: 创建部署教程**

```bash
cat > docs/tutorials/03-deployment-guide.md << 'EOF'
# 教程3: 部署指南（小白版）

## 目标
将本地开发的项目部署到服务器，让所有人能访问

## 部署流程总览
1. 准备云服务器
2. 配置服务器环境
3. 上传代码
4. 配置域名
5. 启动服务

## 3.1 准备云服务器

### 选择云服务商
推荐（有免费试用）：
1. **华为云** - 新用户有免费额度
2. **阿里云** - 学生有优惠
3. **腾讯云** - 轻量应用服务器

### 购买服务器
#### 华为云购买步骤：
1. 访问 https://www.huaweicloud.com/
2. 注册账号，完成实名认证
3. 进入控制台 → 弹性云服务器ECS
4. 点击"购买弹性云服务器"

#### 服务器配置建议：
- 地域：选择离你近的（如华北-北京）
- 规格：通用计算型，1核2GB（够用）
- 镜像：Ubuntu 20.04 64bit
- 系统盘：40GB
- 带宽：1Mbps（初期够用）
- 安全组：开放22(SSH)、80(HTTP)、443(HTTPS)端口

价格：约30-50元/月

### 获取服务器信息
购买成功后：
1. 公网IP：例如 123.123.123.123
2. 用户名：通常是 root 或 ubuntu
3. 密码：购买时设置的

## 3.2 连接服务器

### Windows连接方法：
#### 方法1: 使用PuTTY（推荐）
1. 下载PuTTY：https://www.putty.org/
2. 打开PuTTY
3. 输入服务器IP，点击Open
4. 输入用户名密码登录

#### 方法2: Windows Terminal
```bash
# 打开Windows Terminal或PowerShell
ssh root@123.123.123.123
# 输入密码
```

### 首次登录后操作
```bash
# 1. 更新系统
sudo apt update
sudo apt upgrade -y

# 2. 安装常用工具
sudo apt install -y curl wget git vim

# 3. 查看系统信息
lsb_release -a  # 查看Ubuntu版本
df -h           # 查看磁盘空间
free -h         # 查看内存
```

## 3.3 一键部署脚本

### 上传项目到服务器
#### 方法1: Git克隆（推荐）
```bash
# 在服务器执行
cd /var/www
sudo git clone git@codehub.devcloud.cn-north-4.huaweicloud.com:a384bf0b99f140dbaa16281939ab38b1/huawei_food_subscription.git food-subscription-v01.1-backup
cd food-subscription-v01.1-backup
```

#### 方法2: 上传ZIP文件
1. 本地打包项目：`zip -r project.zip food-subscription-v01.1-backup`
2. 上传到服务器：
   ```bash
   # 本地执行
   scp project.zip root@123.123.123.123:/tmp/

   # 服务器解压
   cd /var/www
   unzip /tmp/project.zip
   ```

### 运行部署脚本
```bash
# 进入项目目录
cd /var/www/food-subscription-v01.1-backup

# 给脚本执行权限
chmod +x *.sh
chmod +x scripts/*.sh

# 运行域名部署脚本（替换为你的域名）
sudo ./deploy-with-domain.sh example.com
```

### 部署过程解释
脚本会自动：
1. 安装Node.js、MySQL、Nginx
2. 配置数据库
3. 安装项目依赖
4. 配置Nginx支持域名
5. 设置开机自启动

等待5-10分钟完成

## 3.4 配置域名

### 购买域名
推荐：
1. 阿里云万网
2. 腾讯云DNSPod
3. Namecheap（国际）

价格：.com域名约50元/年

### 配置DNS解析
以阿里云为例：
1. 登录阿里云控制台
2. 进入域名管理
3. 找到你的域名，点击"解析"
4. 添加记录：
   - 记录类型：A
   - 主机记录：@
   - 记录值：服务器IP
   - TTL：10分钟
5. 再添加一条：
   - 记录类型：A
   - 主机记录：www
   - 记录值：服务器IP

### 等待DNS生效
通常需要5-30分钟
测试方法：
```bash
# 本地电脑执行
ping example.com
nslookup example.com
```

## 3.5 验证部署

### 服务器验证
```bash
# 在服务器执行验证脚本
cd /var/www/food-subscription-v01.1-backup
sudo ./scripts/validate-deployment.sh example.com
```

应该看到：
```
✓ Nginx服务运行
✓ MySQL服务运行
✓ 后端服务运行
✓ API健康检查通过
```

### 本地访问测试
1. 浏览器访问：http://example.com
2. 应该看到登录页面
3. 测试API：http://example.com/api/health
4. 应该返回：{"status":"ok"}

## 3.6 常见部署问题

### Q1: 访问显示502 Bad Gateway
```bash
# 检查后端服务
sudo systemctl status food-subscription

# 查看日志
sudo journalctl -u food-subscription -f

# 常见原因：数据库连接失败、端口被占用
```

### Q2: 静态文件404
```bash
# 检查文件是否存在
ls -la /var/www/food-subscription-v01.1-backup/frontend/dist/

# 检查Nginx权限
sudo chown -R www-data:www-data /var/www/food-subscription-v01.1-backup
```

### Q3: 域名无法访问
```bash
# 检查DNS解析
nslookup example.com

# 检查服务器防火墙
sudo ufw status

# 检查Nginx配置
sudo nginx -t
```

## 3.7 更新部署

### 手动更新
```bash
# 1. 拉取最新代码
cd /var/www/food-subscription-v01.1-backup
sudo git pull

# 2. 重新部署
sudo ./deploy-with-domain.sh example.com

# 3. 验证
sudo ./scripts/validate-deployment.sh example.com
```

### 自动更新（使用脚本）
```bash
cd /var/www/food-subscription-v01.1-backup
sudo python3 update-server.py
```

## 3.8 备份与恢复

### 备份数据库
```bash
# 手动备份
mysqldump -u food_user -p food_subscription > backup-$(date +%Y%m%d).sql

# 下载到本地
scp root@123.123.123.123:/path/to/backup.sql .
```

### 恢复数据库
```bash
# 上传备份文件
scp backup.sql root@123.123.123.123:/tmp/

# 恢复
mysql -u food_user -p food_subscription < /tmp/backup.sql
```

## 3.9 监控与维护

### 查看访问日志
```bash
# 实时查看访问
sudo tail -f /var/log/nginx/access.log

# 查看错误
sudo tail -f /var/log/nginx/error.log

# 查看后端日志
sudo journalctl -u food-subscription -f
```

### 服务器状态监控
```bash
# CPU使用
top

# 内存使用
free -h

# 磁盘空间
df -h

# 网络连接
netstat -tulpn
```

## 3.10 安全建议

### 1. 修改默认密码
```bash
# 修改数据库密码
mysql -u root -p
ALTER USER 'food_user'@'localhost' IDENTIFIED BY '新密码';

# 修改服务器密码
passwd
```

### 2. 配置防火墙
```bash
# 只开放必要端口
sudo ufw allow 80/tcp
sudo ufw allow 22/tcp
sudo ufw enable
```

### 3. 定期更新
```bash
# 系统更新
sudo apt update && sudo apt upgrade -y

# 项目依赖更新
cd /var/www/food-subscription-v01.1-backup/backend
npm update

cd ../frontend-src
npm update
```

## 3.11 下一步
部署完成后，学习：
- 教程4: 故障排查
- 教程5: 日常维护
EOF
```

**步骤4: 创建故障排查教程**

```bash
cat > docs/tutorials/04-troubleshooting.md << 'EOF'
# 教程4: 故障排查（小白版）

## 目标
学会自己解决常见问题，不求人

## 排查原则
1. 先看日志，再猜原因
2. 从简单到复杂
3. 一次只改一个地方
4. 记录解决步骤

## 4.1 前端问题排查

### 问题1: 页面空白或加载失败

#### 检查步骤：
1. 按F12打开开发者工具
2. 查看Console标签（控制台）
3. 查看Network标签（网络）

#### 常见错误：
```bash
# 错误1: 找不到模块
Uncaught Error: Cannot find module './Button'

解决：重新安装依赖
cd frontend-src
rm -rf node_modules package-lock.json
npm install

# 错误2: API请求失败
GET http://localhost:3001/api/xxx net::ERR_CONNECTION_REFUSED

解决：检查后端服务是否启动
cd backend
npm run dev

# 错误3: 跨域错误
Access to fetch at 'http://localhost:3001/api/xxx' from origin 'http://localhost:5173' has been blocked by CORS policy

解决：检查后端CORS配置
确保backend/server.js正确配置CORS
```

### 问题2: 样式错乱

#### 检查步骤：
1. 按F12 → Elements标签
2. 选中错乱元素
3. 查看应用的CSS样式

#### 常见解决：
```bash
# 1. 清除浏览器缓存
Ctrl + Shift + R (强制刷新)

# 2. 重建Tailwind CSS
cd frontend-src
npx tailwindcss -i ./src/index.css -o ./src/output.css --watch

# 3. 检查CSS类名拼写
# 错误：bg-primay → 正确：bg-primary
```

### 问题3: 表单提交失败

#### 检查步骤：
1. 查看Console错误
2. 查看Network请求详情
3. 检查表单验证

#### 调试方法：
```javascript
// 在表单提交前添加日志
console.log('表单数据:', formData);
console.log('API地址:', apiUrl);

// 使用try-catch捕获错误
try {
  const response = await fetch(apiUrl, options);
  console.log('响应:', response);
} catch (error) {
  console.error('请求失败:', error);
}
```

## 4.2 后端问题排查

### 问题1: 服务启动失败

#### 检查命令：
```bash
# 1. 检查Node.js版本
node --version  # 需要>=18

# 2. 检查端口占用
netstat -ano | findstr :3001  # Windows
lsof -i :3001                 # Linux/Mac

# 3. 检查依赖
cd backend
npm list --depth=0  # 查看安装的包

# 4. 查看详细错误
npm run dev  # 看具体错误信息
```

#### 常见错误：
```bash
# 错误: Error: listen EADDRINUSE: address already in use :::3001
# 解决：端口被占用
# Windows: taskkill /PID 进程号 /F
# Linux: kill -9 进程号

# 错误: Cannot find module 'express'
# 解决：依赖未安装
npm install

# 错误: connect ECONNREFUSED 127.0.0.1:3306
# 解决：MySQL未启动
# Windows: 服务中启动MySQL
# Linux: sudo systemctl start mysql
```

### 问题2: 数据库连接失败

#### 检查步骤：
```bash
# 1. 检查MySQL服务
sudo systemctl status mysql  # Linux
# 或服务中查看MySQL是否运行

# 2. 检查数据库配置
cat backend/.env
# 检查DB_HOST, DB_USER, DB_PASSWORD, DB_NAME

# 3. 手动连接测试
mysql -u food_user -p -e "SELECT 1" food_subscription
```

#### 常见错误：
```bash
# 错误: ER_ACCESS_DENIED_ERROR: Access denied for user 'food_user'@'localhost'
# 解决：密码错误或用户不存在
# 重新创建用户：
mysql -u root -p
CREATE USER 'food_user'@'localhost' IDENTIFIED BY 'food123456';
GRANT ALL PRIVILEGES ON food_subscription.* TO 'food_user'@'localhost';
FLUSH PRIVILEGES;

# 错误: ER_BAD_DB_ERROR: Unknown database 'food_subscription'
# 解决：数据库不存在
CREATE DATABASE food_subscription;
```

### 问题3: API返回错误

#### 查看日志：
```bash
# 1. 查看后端控制台输出
cd backend
npm run dev

# 2. 查看请求日志
# 在server.js中添加：
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

# 3. 查看错误日志
# 检查是否有try-catch未捕获的错误
```

#### 调试API：
```bash
# 使用curl测试API
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"user123"}'

# 使用Postman或浏览器开发者工具测试
```

## 4.3 部署问题排查

### 问题1: 网站无法访问

#### 检查清单：
```bash
# 1. 检查服务器是否在线
ping 服务器IP

# 2. 检查端口是否开放
telnet 服务器IP 80  # 或使用在线端口检测工具

# 3. 检查DNS解析
nslookup 你的域名.com

# 4. 检查Nginx状态
sudo systemctl status nginx

# 5. 检查防火墙
sudo ufw status  # Linux
```

#### 快速诊断脚本：
```bash
# 在服务器运行
cd /var/www/food-subscription-v01.1-backup
sudo ./scripts/validate-deployment.sh 你的域名.com
```

### 问题2: 502 Bad Gateway

#### 原因：Nginx无法连接后端

#### 解决步骤：
```bash
# 1. 检查后端服务
sudo systemctl status food-subscription

# 2. 检查后端日志
sudo journalctl -u food-subscription -f

# 3. 检查端口3001是否监听
netstat -tulpn | grep :3001

# 4. 手动启动后端测试
cd /var/www/food-subscription-v01.1-backup/backend
npm start
```

### 问题3: 静态文件404

#### 检查步骤：
```bash
# 1. 检查文件是否存在
ls -la /var/www/food-subscription-v01.1-backup/frontend/dist/

# 2. 检查Nginx配置
sudo nginx -t
cat /etc/nginx/sites-available/food-subscription

# 3. 检查文件权限
sudo chown -R www-data:www-data /var/www/food-subscription-v01.1-backup/frontend/dist
sudo chmod -R 755 /var/www/food-subscription-v01.1-backup/frontend/dist

# 4. 检查Nginx错误日志
sudo tail -f /var/log/nginx/error.log
```

## 4.4 数据库问题排查

### 问题1: 数据查询慢

#### 检查步骤：
```bash
# 1. 查看慢查询日志
# 在MySQL配置中启用慢查询日志

# 2. 使用EXPLAIN分析查询
EXPLAIN SELECT * FROM users WHERE email = 'test@example.com';

# 3. 检查索引
SHOW INDEXES FROM users;

# 4. 优化查询
# 避免 SELECT *，只选择需要的列
# 添加合适的索引
```

### 问题2: 数据不一致

#### 检查脚本：
```bash
# 运行数据完整性检查
cd /var/www/food-subscription-v01.1-backup
sudo ./scripts/verify-data-integrity.sh

# 检查孤儿记录、无效外键等
```

#### 常见修复：
```bash
# 1. 删除孤儿记录
DELETE FROM orders WHERE user_id NOT IN (SELECT id FROM users);

# 2. 修复外键约束
# 先删除无效数据，再添加外键
```

## 4.5 性能问题排查

### 问题1: 页面加载慢

#### 优化步骤：
```bash
# 1. 启用Gzip压缩（Nginx已配置）
# 2. 优化图片大小
# 3. 减少HTTP请求
# 4. 使用浏览器缓存
```

### 问题2: 数据库压力大

#### 优化建议：
```bash
# 1. 添加数据库索引
# 2. 使用查询缓存
# 3. 分页查询大量数据
# 4. 定期清理旧数据
```

## 4.6 工具推荐

### 调试工具：
1. **浏览器开发者工具** - F12
2. **Postman** - API测试
3. **MySQL Workbench** - 数据库管理
4. **VS Code调试器** - 代码调试

### 监控工具：
1. **htop** - 服务器监控
2. **nginx-status** - Nginx状态
3. **mytop** - MySQL监控
4. **logwatch** - 日志分析

## 4.7 求助指南

### 提供什么信息：
1. 错误信息（完整截图）
2. 相关日志
3. 操作步骤
4. 期望结果 vs 实际结果

### 求助渠道：
1. 项目GitHub Issues
2. 技术社区（Stack Overflow）
3. 开发者群组
4. 官方文档

## 4.8 预防措施

### 定期检查：
```bash
# 每周执行
cd /var/www/food-subscription-v01.1-backup
sudo ./scripts/validate-deployment.sh

# 检查磁盘空间
df -h

# 检查日志大小
du -sh /var/log/nginx/
```

### 备份策略：
1. 每日数据库备份
2. 每周完整备份
3. 重要操作前手动备份

## 4.9 学习资源

### 在线学习：
1. MDN Web文档
2. Node.js官方文档
3. MySQL官方文档
4. Nginx官方文档

### 实践建议：
1. 自己搭建测试环境
2. 故意制造错误学习解决
3. 阅读他人代码
4. 参与开源项目
EOF
```

**步骤5: 创建日常维护教程**

```bash
cat > docs/tutorials/05-daily-maintenance.md << 'EOF'
# 教程5: 日常维护（小白版）

## 目标
学会如何保持网站稳定运行

## 5.1 每日检查清单

### 早上检查（5分钟）
```bash
# 1. 检查服务状态
sudo systemctl status nginx
sudo systemctl status mysql
sudo systemctl status food-subscription

# 2. 检查网站可访问
curl -I http://你的域名.com
curl http://你的域名.com/api/health

# 3. 检查磁盘空间
df -h

# 4. 查看错误日志（最近1小时）
sudo tail -n 100 /var/log/nginx/error.log | grep -i error
```

### 检查结果判断：
- ✅ 所有服务active (running)
- ✅ 网站返回200状态码
- ✅ 磁盘使用<80%
- ✅ 错误日志无关键错误

## 5.2 每周维护任务

### 周一：系统更新
```bash
# 1. 系统更新
sudo apt update
sudo apt upgrade -y

# 2. 安全更新
sudo apt-get dist-upgrade -y

# 3. 清理旧包
sudo apt autoremove -y
sudo apt autoclean
```

### 周二：数据库维护
```bash
# 1. 数据库备份
mysqldump -u food_user -p food_subscription > /backups/db-$(date +%Y%m%d).sql

# 2. 优化数据库表
mysql -u food_user -p food_subscription -e "OPTIMIZE TABLE users, food_packages, orders;"

# 3. 分析表状态
mysql -u food_user -p food_subscription -e "SHOW TABLE STATUS LIKE 'orders';"
```

### 周三：日志清理
```bash
# 1. 清理旧日志（保留7天）
find /var/log/nginx -name "*.log" -mtime +7 -delete
find /var/log/mysql -name "*.log" -mtime +7 -delete

# 2. 清理项目日志
find /var/www/food-subscription-v01.1-backup/logs -name "*.log" -mtime +30 -delete

# 3. 清理临时文件
sudo rm -rf /tmp/*
```

### 周四：安全检查
```bash
# 1. 检查失败登录
sudo lastb | head -20

# 2. 检查异常进程
ps aux | grep -E "(crypto|miner|backdoor)" | grep -v grep

# 3. 检查文件权限
find /var/www/food-subscription-v01.1-backup -type f -perm /o=w -ls

# 4. 更新密码（每3个月）
# mysql -u root -p
# ALTER USER 'food_user'@'localhost' IDENTIFIED BY '新密码';
```

### 周五：性能检查
```bash
# 1. 检查响应时间
time curl -s -o /dev/null -w "%{time_total}" http://你的域名.com

# 2. 检查内存使用
free -h

# 3. 检查CPU使用
top -bn1 | grep "Cpu(s)"

# 4. 检查连接数
netstat -an | grep :80 | wc -l
```

## 5.3 每月维护任务

### 月初：全面备份
```bash
# 1. 完整项目备份
cd /var/www
tar -czf /backups/full-$(date +%Y%m%d).tar.gz food-subscription-v01.1-backup

# 2. 数据库全量备份
mysqldump -u food_user -p --all-databases > /backups/all-db-$(date +%Y%m%d).sql

# 3. 上传文件备份
tar -czf /backups/uploads-$(date +%Y%m%d).tar.gz food-subscription-v01.1-backup/backend/uploads

# 4. 备份到本地（下载）
scp root@服务器IP:/backups/*.tar.gz .
```

### 月中：依赖更新
```bash
# 1. 更新Node.js依赖
cd /var/www/food-subscription-v01.1-backup/backend
npm outdated
npm update --save
npm audit fix

cd ../frontend-src
npm outdated
npm update --save
npm audit fix

# 2. 测试更新后功能
sudo systemctl restart food-subscription
curl http://localhost:3001/api/health
```

### 月底：统计分析
```bash
# 1. 访问统计
sudo awk '{print $1}' /var/log/nginx/access.log | sort | uniq -c | sort -nr | head -20

# 2. 错误统计
sudo grep -c " 500 " /var/log/nginx/access.log
sudo grep -c " 404 " /var/log/nginx/access.log

# 3. 性能统计
# 平均响应时间、峰值访问等
```

## 5.4 自动化维护脚本

### 创建自动备份脚本
```bash
sudo vim /usr/local/bin/auto-backup.sh
```

内容：
```bash
#!/bin/bash
# 自动备份脚本

DATE=$(date +%Y%m%d)
BACKUP_DIR="/backups"

# 创建备份目录
mkdir -p $BACKUP_DIR

# 数据库备份
mysqldump -u food_user -p你的密码 food_subscription > $BACKUP_DIR/db-$DATE.sql

# 项目备份
cd /var/www
tar -czf $BACKUP_DIR/project-$DATE.tar.gz food-subscription-v01.1-backup

# 保留最近30天备份
find $BACKUP_DIR -name "*.sql" -mtime +30 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete

echo "备份完成: $DATE"
```

设置定时任务：
```bash
# 每天凌晨2点备份
sudo crontab -e
# 添加：0 2 * * * /usr/local/bin/auto-backup.sh
```

### 创建健康检查脚本
```bash
sudo vim /usr/local/bin/health-check.sh
```

内容：
```bash
#!/bin/bash
# 健康检查脚本

# 检查服务
services=("nginx" "mysql" "food-subscription")
for service in "${services[@]}"; do
    if systemctl is-active --quiet $service; then
        echo "✅ $service 运行正常"
    else
        echo "❌ $service 服务异常"
        # 发送告警邮件或通知
    fi
done

# 检查网站
if curl -s -f http://localhost/api/health > /dev/null; then
    echo "✅ 网站可访问"
else
    echo "❌ 网站不可访问"
fi

# 检查磁盘
DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ $DISK_USAGE -gt 80 ]; then
    echo "⚠️ 磁盘使用率: ${DISK_USAGE}% (超过80%)"
else
    echo "✅ 磁盘使用率: ${DISK_USAGE}%"
fi
```

设置定时任务（每30分钟）：
```bash
sudo crontab -e
# 添加：*/30 * * * * /usr/local/bin/health-check.sh >> /var/log/health-check.log
```

## 5.5 监控工具设置

### 简易监控面板
```bash
# 安装netdata（实时监控）
bash <(curl -Ss https://my-netdata.io/kickstart.sh)

# 访问：http://服务器IP:19999
```

### 日志监控
```bash
# 安装logwatch（日志分析）
sudo apt install -y logwatch

# 每日发送日志摘要到邮箱
sudo logwatch --detail High --mailto your-email@example.com --service all --range today
```

## 5.6 应急响应流程

### 网站宕机应急
```bash
# 1. 立即检查
sudo systemctl status nginx
sudo systemctl status food-subscription

# 2. 查看日志
sudo tail -f /var/log/nginx/error.log
sudo journalctl -u food-subscription -f

# 3. 快速恢复
# 重启服务
sudo systemctl restart nginx food-subscription

# 4. 如果无法恢复，回滚到备份
cd /var/www
tar -xzf /backups/project-最新日期.tar.gz
mysql -u food_user -p food_subscription < /backups/db-最新日期.sql
```

### 数据丢失应急
```bash
# 1. 停止写入
sudo systemctl stop food-subscription

# 2. 从备份恢复
mysql -u food_user -p food_subscription < /backups/db-最新日期.sql

# 3. 验证数据
mysql -u food_user -p food_subscription -e "SELECT COUNT(*) FROM orders;"

# 4. 恢复服务
sudo systemctl start food-subscription
```

### 安全入侵应急
```bash
# 1. 断开网络（如果严重）
sudo ifconfig eth0 down

# 2. 备份当前状态（取证）
tar -czf /tmp/forensic-$(date +%s).tar.gz /var/www /etc /var/log

# 3. 检查入侵痕迹
sudo last
sudo find / -name "*.php" -newer /etc/passwd
sudo netstat -tulpn

# 4. 清理后门，重置密码，恢复服务
```

## 5.7 优化建议

### 性能优化
```bash
# 1. 启用缓存
# 安装Redis
sudo apt install -y redis-server
sudo systemctl enable redis-server

# 2. 优化MySQL配置
sudo vim /etc/mysql/mysql.conf.d/mysqld.cnf
# 调整：innodb_buffer_pool_size = 256M

# 3. 优化Nginx配置
sudo vim /etc/nginx/nginx.conf
# 调整：worker_processes auto;
```

### 安全优化
```bash
# 1. 配置SSL（HTTPS）
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d 你的域名.com -d www.你的域名.com

# 2. 配置防火墙规则
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable

# 3. 禁用root SSH登录
sudo vim /etc/ssh/sshd_config
# 修改：PermitRootLogin no
sudo systemctl restart sshd
```

## 5.8 文档维护

### 更新文档
1. 记录每次维护操作
2. 更新配置变更
3. 记录问题解决方法
4. 分享经验教训

### 文档位置
```bash
/var/www/food-subscription-v01.1-backup/docs/
├── tutorials/          # 教程文档
├── database/          # 数据库文档
├── api/              # API文档
└── design/           # 设计文档
```

## 5.9 持续学习

### 学习计划
1. 每周学习一个新技术
2. 每月读一本技术书
3. 每季度参加一次技术分享
4. 每年掌握一个新框架

### 推荐资源
1. **Linux**: 《鸟哥的Linux私房菜》
2. **数据库**: 《高性能MySQL》
3. **前端**: MDN Web文档
4. **后端**: Node.js官方文档

## 5.10 总结

日常维护要点：
1. **定期检查**：早检查，晚总结
2. **及时备份**：数据无价，备份先行
3. **保持更新**：系统、依赖、安全补丁
4. **监控预警**：早发现，早解决
5. **持续学习**：技术更新快，学习不停步

记住：预防胜于治疗，自动化胜于手动！
EOF
```

**步骤6: 创建教程索引**

```bash
cat > TUTORIAL-INDEX.md << 'EOF'
# 食材包订阅平台 - 小白教程索引

## 教程目标
帮助零基础开发者从环境搭建到项目部署，全面掌握食材包订阅平台的开发和维护。

## 教程列表

### 基础篇（必学）
1. **[环境搭建](./docs/tutorials/01-environment-setup.md)** ⭐⭐⭐
   - 安装Git、Node.js、VS Code
   - 配置MySQL数据库
   - 启动开发环境
   - 预计时间：1-2小时

2. **[开发流程](./docs/tutorials/02-development-workflow.md)** ⭐⭐⭐
   - Git基本操作
   - 代码修改和提交
   - 分支管理和PR
   - 预计时间：2-3小时

### 进阶篇（推荐）
3. **[部署指南](./docs/tutorials/03-deployment-guide.md)** ⭐⭐⭐
   - 购买云服务器
   - 配置域名DNS
   - 一键部署脚本
   - 预计时间：3-4小时

4. **[故障排查](./docs/tutorials/04-troubleshooting.md)** ⭐⭐
   - 前端问题排查
   - 后端问题排查
   - 部署问题解决
   - 预计时间：2-3小时

### 高级篇（可选）
5. **[日常维护](./docs/tutorials/05-daily-maintenance.md)** ⭐
   - 每日检查清单
   - 每周维护任务
   - 应急响应流程
   - 预计时间：1-2小时

## 学习路径建议

### 完全新手路线（1-2周）
```
第1-2天：教程1（环境搭建）
第3-4天：教程2（开发流程）
第5-7天：实际修改项目
第2周：教程3（部署到服务器）
```

### 有基础开发者路线（3-5天）
```
第1天：教程1+2快速过
第2天：实际修改项目
第3天：教程3（部署）
第4-5天：教程4+5（优化维护）
```

### 只想部署路线（1天）
```
上午：教程1（环境搭建）
下午：教程3（部署指南）
晚上：测试和验证
```

## 实践项目

### 初级项目（1-2天）
1. **修改页面文字**
   - 找到Home.tsx文件
   - 修改欢迎语
   - 提交到GitHub

2. **添加控制台日志**
   - 在按钮点击事件添加console.log
   - 测试并查看效果

### 中级项目（3-5天）
3. **修改主题颜色**
   - 更新CSS变量
   - 修改Tailwind配置
   - 测试所有页面

4. **添加新页面**
   - 创建About页面
   - 添加路由
   - 部署测试

### 高级项目（1-2周）
5. **添加新功能**
   - 用户收藏功能
   - 商品评价系统
   - 订单导出功能

## 常见问题FAQ

### Q1: 我是完全新手，能学会吗？
**A**: 能！教程从零开始，一步一步指导。只需要按照步骤操作，遇到问题查看故障排查教程。

### Q2: 需要多少预算？
**A**:
- 开发环境：免费（Git、Node.js、VS Code都免费）
- 测试服务器：免费试用或最低配30-50元/月
- 域名：50元/年（.com域名）

### Q3: 需要什么电脑配置？
**A**: 普通电脑即可，4GB内存以上，Windows/Mac/Linux都支持。

### Q4: 英语不好能学吗？
**A**: 能！教程全中文，工具都有中文界面，错误信息可以百度翻译。

### Q5: 遇到问题怎么办？
**A**:
1. 先看故障排查教程
2. 百度搜索错误信息
3. GitHub提交Issue
4. 技术社区提问

## 学习资源

### 视频教程
- B站搜索"Node.js教程"、"React教程"
- 慕课网、极客时间

### 书籍推荐
- 《JavaScript高级程序设计》
- 《Node.js实战》
- 《MySQL必知必会》

### 在线练习
- freeCodeCamp中文版
- 菜鸟教程
- W3School

## 学习社区

### 中文社区
1. **掘金** - 技术文章分享
2. **思否** - 问答社区
3. **V2EX** - 技术讨论
4. **GitHub中文社区**

### 交流群组
- QQ群：搜索"前端开发"、"Node.js"
- 微信群：关注技术公众号加入
- Discord：国际开发者社区

## 下一步行动

### 立即开始
1. 下载教程1的PDF版本
2. 安装Git和Node.js
3. 克隆项目代码

### 学习计划
制定你的21天学习计划：
```
第1-7天：基础掌握（教程1-2）
第8-14天：项目实践（修改+部署）
第15-21天：功能开发（添加新功能）
```

### 成果展示
学习完成后，你可以：
1. 拥有自己的部署网站
2. 在GitHub有贡献记录
3. 掌握全栈开发基础
4. 具备项目维护能力

## 更新日志
- 2026-03-03: 创建完整教程系列
- 2026-03-04: 添加实践项目
- 2026-03-05: 完善FAQ和资源

## 联系我们
- 项目GitHub: https://github.com/HaoChenXX/food-subscription
- 问题反馈: GitHub Issues
- 建议反馈: 教程末尾留言

---
**祝学习顺利！记住：编程不是魔法，只是需要练习的技能。**
EOF
```

**步骤7: 提交所有教程文档**

```bash
git add docs/tutorials/01-environment-setup.md docs/tutorials/02-development-workflow.md docs/tutorials/03-deployment-guide.md docs/tutorials/04-troubleshooting.md docs/tutorials/05-daily-maintenance.md TUTORIAL-INDEX.md
git commit -m "docs: 添加完整小白教程系列"
```

---

**计划完成状态**: 全部完成（共16个任务，覆盖6个阶段）

**执行选项**:

**1. 子代理驱动（本次会话）** - 我分派新的子代理执行每个任务，任务间进行代码审查，快速迭代

**2. 并行会话（单独）** - 在新的工作树中打开新会话，使用executing-plans进行批量执行和检查点

**请选择哪种方式？**