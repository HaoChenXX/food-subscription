/**
 * 食材包订阅平台 - 后端服务
 * Node.js + Express + SQLite
 */

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// 数据目录
const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// 上传目录
const UPLOAD_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// 数据文件路径
const DB_FILES = {
  users: path.join(DATA_DIR, 'users.json'),
  products: path.join(DATA_DIR, 'products.json'),
  orders: path.join(DATA_DIR, 'orders.json'),
  subscriptions: path.join(DATA_DIR, 'subscriptions.json'),
  foodPackages: path.join(DATA_DIR, 'food-packages.json'),
  dietProfiles: path.join(DATA_DIR, 'diet-profiles.json'),
  suppliers: path.join(DATA_DIR, 'suppliers.json'),
  addresses: path.join(DATA_DIR, 'addresses.json')
};

// 初始化数据文件
function initDataFile(filePath, defaultData = []) {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2), 'utf8');
  }
}

// 初始化所有数据文件
Object.values(DB_FILES).forEach(file => initDataFile(file));

// 读取数据
function readData(filePath) {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

// 写入数据
function writeData(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(UPLOAD_DIR));

// 认证中间件
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: '未提供认证令牌' });
  }
  
  const token = authHeader.substring(7);
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: '无效的认证令牌' });
  }
};

// ========== 认证路由 ==========

// 注册
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name, phone } = req.body;
    
    if (!email || !password || !name) {
      return res.status(400).json({ message: '请填写所有必填字段' });
    }
    
    const users = readData(DB_FILES.users);
    
    // 检查邮箱是否已存在
    if (users.find(u => u.email === email)) {
      return res.status(400).json({ message: '该邮箱已被注册' });
    }
    
    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // 创建新用户
    const newUser = {
      id: Date.now().toString(),
      email,
      password: hashedPassword,
      name,
      phone: phone || '',
      role: 'user',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    users.push(newUser);
    writeData(DB_FILES.users, users);
    
    // 生成 JWT
    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    // 返回用户信息（不包含密码）
    const { password: _, ...userWithoutPassword } = newUser;
    res.status(201).json({ user: userWithoutPassword, token });
  } catch (error) {
    console.error('注册错误:', error);
    res.status(500).json({ message: '注册失败，请稍后重试' });
  }
});

// 登录
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: '请填写邮箱和密码' });
    }
    
    const users = readData(DB_FILES.users);
    const user = users.find(u => u.email === email);
    
    if (!user) {
      return res.status(401).json({ message: '用户不存在' });
    }
    
    // 验证密码
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: '密码错误' });
    }
    
    // 生成 JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    // 返回用户信息（不包含密码）
    const { password: _, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword, token });
  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({ message: '登录失败，请稍后重试' });
  }
});

// 获取当前用户信息
app.get('/api/auth/profile', authMiddleware, (req, res) => {
  try {
    const users = readData(DB_FILES.users);
    const user = users.find(u => u.id === req.user.userId);
    
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }
    
    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    console.error('获取用户信息错误:', error);
    res.status(500).json({ message: '获取用户信息失败' });
  }
});

// ========== 食材包路由 ==========

// 获取所有食材包
app.get('/api/food-packages', (req, res) => {
  try {
    const packages = readData(DB_FILES.foodPackages);
    res.json(packages);
  } catch (error) {
    res.status(500).json({ message: '获取食材包失败' });
  }
});

// 获取单个食材包
app.get('/api/food-packages/:id', (req, res) => {
  try {
    const packages = readData(DB_FILES.foodPackages);
    const pkg = packages.find(p => p.id === req.params.id);
    
    if (!pkg) {
      return res.status(404).json({ message: '食材包不存在' });
    }
    
    res.json(pkg);
  } catch (error) {
    res.status(500).json({ message: '获取食材包失败' });
  }
});

// ========== 订单路由 ==========

// 获取用户的所有订单
app.get('/api/orders', authMiddleware, (req, res) => {
  try {
    const orders = readData(DB_FILES.orders);
    const userOrders = orders.filter(o => o.userId === req.user.userId);
    res.json(userOrders);
  } catch (error) {
    res.status(500).json({ message: '获取订单失败' });
  }
});

// 获取单个订单
app.get('/api/orders/:id', authMiddleware, (req, res) => {
  try {
    const orders = readData(DB_FILES.orders);
    const order = orders.find(o => o.id === req.params.id && o.userId === req.user.userId);
    
    if (!order) {
      return res.status(404).json({ message: '订单不存在' });
    }
    
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: '获取订单失败' });
  }
});

// 创建订单
app.post('/api/orders', authMiddleware, (req, res) => {
  try {
    const orders = readData(DB_FILES.orders);
    const newOrder = {
      id: 'ORD' + Date.now(),
      userId: req.user.userId,
      ...req.body,
      status: 'pending_payment',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    orders.push(newOrder);
    writeData(DB_FILES.orders, orders);
    
    res.status(201).json(newOrder);
  } catch (error) {
    res.status(500).json({ message: '创建订单失败' });
  }
});

// ========== 订阅路由 ==========

// 获取用户的所有订阅
app.get('/api/subscriptions', authMiddleware, (req, res) => {
  try {
    const subscriptions = readData(DB_FILES.subscriptions);
    const userSubscriptions = subscriptions.filter(s => s.userId === req.user.userId);
    res.json(userSubscriptions);
  } catch (error) {
    res.status(500).json({ message: '获取订阅失败' });
  }
});

// 创建订阅
app.post('/api/subscriptions', authMiddleware, (req, res) => {
  try {
    const subscriptions = readData(DB_FILES.subscriptions);
    const newSubscription = {
      id: 'SUB' + Date.now(),
      userId: req.user.userId,
      ...req.body,
      status: 'active',
      startDate: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };
    
    subscriptions.push(newSubscription);
    writeData(DB_FILES.subscriptions, subscriptions);
    
    res.status(201).json(newSubscription);
  } catch (error) {
    res.status(500).json({ message: '创建订阅失败' });
  }
});

// ========== 饮食画像路由 ==========

// 获取用户的饮食画像
app.get('/api/diet-profile', authMiddleware, (req, res) => {
  try {
    const profiles = readData(DB_FILES.dietProfiles);
    const profile = profiles.find(p => p.userId === req.user.userId);
    
    if (!profile) {
      return res.status(404).json({ message: '饮食画像不存在' });
    }
    
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: '获取饮食画像失败' });
  }
});

// 创建/更新饮食画像
app.post('/api/diet-profile', authMiddleware, (req, res) => {
  try {
    const profiles = readData(DB_FILES.dietProfiles);
    const existingIndex = profiles.findIndex(p => p.userId === req.user.userId);
    
    const profileData = {
      id: existingIndex >= 0 ? profiles[existingIndex].id : 'DP' + Date.now(),
      userId: req.user.userId,
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    
    if (existingIndex >= 0) {
      profiles[existingIndex] = profileData;
    } else {
      profiles.push(profileData);
    }
    
    writeData(DB_FILES.dietProfiles, profiles);
    res.json(profileData);
  } catch (error) {
    res.status(500).json({ message: '保存饮食画像失败' });
  }
});

// ========== 地址路由 ==========

// 获取用户的所有地址
app.get('/api/addresses', authMiddleware, (req, res) => {
  try {
    const addresses = readData(DB_FILES.addresses);
    const userAddresses = addresses.filter(a => a.userId === req.user.userId);
    res.json(userAddresses);
  } catch (error) {
    res.status(500).json({ message: '获取地址失败' });
  }
});

// 创建地址
app.post('/api/addresses', authMiddleware, (req, res) => {
  try {
    const addresses = readData(DB_FILES.addresses);
    const newAddress = {
      id: 'ADDR' + Date.now(),
      userId: req.user.userId,
      ...req.body,
      createdAt: new Date().toISOString()
    };
    
    addresses.push(newAddress);
    writeData(DB_FILES.addresses, addresses);
    
    res.status(201).json(newAddress);
  } catch (error) {
    res.status(500).json({ message: '创建地址失败' });
  }
});

// ========== 管理员路由 ==========

// 获取所有用户（管理员）
app.get('/api/admin/users', authMiddleware, (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: '权限不足' });
    }
    
    const users = readData(DB_FILES.users);
    const usersWithoutPassword = users.map(u => {
      const { password: _, ...rest } = u;
      return rest;
    });
    
    res.json(usersWithoutPassword);
  } catch (error) {
    res.status(500).json({ message: '获取用户列表失败' });
  }
});

// 获取所有订单（管理员）
app.get('/api/admin/orders', authMiddleware, (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'merchant') {
      return res.status(403).json({ message: '权限不足' });
    }
    
    const orders = readData(DB_FILES.orders);
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: '获取订单列表失败' });
  }
});

// ========== 健康检查 ==========
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 处理
app.use((req, res) => {
  res.status(404).json({ message: '接口不存在' });
});

// 错误处理
app.use((err, req, res, next) => {
  console.error('服务器错误:', err);
  res.status(500).json({ message: '服务器内部错误' });
});

// 启动服务器
app.listen(PORT, '0.0.0.0', () => {
  console.log(`=================================`);
  console.log(`食材包订阅平台后端服务已启动`);
  console.log(`监听端口: ${PORT}`);
  console.log(`数据目录: ${DATA_DIR}`);
  console.log(`=================================`);
});

module.exports = app;
