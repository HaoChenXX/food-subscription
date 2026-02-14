/**
 * 食材包订阅平台 - 后端服务 v1.2
 * Node.js + Express + MySQL
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// 初始化数据库连接
const { initPool } = require('./db/connection');

// 导入路由
const authRoutes = require('./routes/auth');
const foodPackageRoutes = require('./routes/food-packages');
const orderRoutes = require('./routes/orders');
const subscriptionRoutes = require('./routes/subscriptions');
const dietProfileRoutes = require('./routes/diet-profile');
const addressRoutes = require('./routes/addresses');
const uploadRoutes = require('./routes/upload');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 3001;

// 确保上传目录存在
const UPLOAD_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静态文件服务 - 上传的图片
app.use('/uploads', express.static(UPLOAD_DIR));

// 路由
app.use('/api/auth', authRoutes);
app.use('/api/food-packages', foodPackageRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/diet-profile', dietProfileRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/admin', adminRoutes);

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    version: '1.2.0'
  });
});

// 404 处理
app.use((req, res) => {
  res.status(404).json({ message: '接口不存在' });
});

// 错误处理
app.use((err, req, res, next) => {
  console.error('服务器错误:', err);
  res.status(500).json({ message: '服务器内部错误', error: err.message });
});

// 初始化数据库并启动服务器
async function startServer() {
  try {
    console.log('正在初始化数据库连接...');
    await initPool();
    console.log('数据库连接成功');
    
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`=================================`);
      console.log(`食材包订阅平台后端服务已启动`);
      console.log(`版本: 1.2.0 (MySQL版)`);
      console.log(`监听端口: ${PORT}`);
      console.log(`上传目录: ${UPLOAD_DIR}`);
      console.log(`=================================`);
    });
  } catch (error) {
    console.error('启动失败:', error);
    process.exit(1);
  }
}

startServer();

module.exports = app;
