/**
 * 认证中间件
 */

const jwt = require('jsonwebtoken');
const { query } = require('../db/connection');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// 验证 JWT 令牌
const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: '未提供认证令牌' });
  }
  
  const token = authHeader.substring(7);
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // 验证用户是否仍然存在
    const users = await query('SELECT id, email, role, name FROM users WHERE id = ?', [decoded.userId]);
    if (users.length === 0) {
      return res.status(401).json({ message: '用户不存在' });
    }
    
    req.user = users[0];
    next();
  } catch (error) {
    return res.status(401).json({ message: '无效的认证令牌' });
  }
};

// 检查是否为管理员
const adminMiddleware = async (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: '权限不足，需要管理员权限' });
  }
  next();
};

// 检查是否为商家或管理员
const merchantMiddleware = async (req, res, next) => {
  if (req.user.role !== 'admin' && req.user.role !== 'merchant') {
    return res.status(403).json({ message: '权限不足' });
  }
  next();
};

module.exports = {
  authMiddleware,
  adminMiddleware,
  merchantMiddleware,
  JWT_SECRET
};
