/**
 * 认证路由
 */

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../db/connection');
const { authMiddleware, JWT_SECRET } = require('../middleware/auth');
const { formatUser } = require('../utils/helpers');

const router = express.Router();

// 注册
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, phone, role } = req.body;
    
    if (!email || !password || !name) {
      return res.status(400).json({ message: '请填写所有必填字段' });
    }
    
    // 验证角色（只允许 user 或 merchant）
    const userRole = role === 'merchant' ? 'merchant' : 'user';
    
    // 检查邮箱是否已存在
    const existingUsers = await query('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
      return res.status(400).json({ message: '该邮箱已被注册' });
    }
    
    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // 创建新用户
    const avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${Date.now()}`;
    
    const result = await query(
      'INSERT INTO users (email, password, name, phone, role, avatar) VALUES (?, ?, ?, ?, ?, ?)',
      [email, hashedPassword, name, phone || '', userRole, avatar]
    );
    
    const newUser = await query('SELECT * FROM users WHERE id = ?', [result.insertId]);
    
    // 生成 JWT
    const token = jwt.sign(
      { userId: newUser[0].id, email: newUser[0].email, role: newUser[0].role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.status(201).json({ 
      user: formatUser(newUser[0]), 
      token 
    });
  } catch (error) {
    console.error('注册错误:', error);
    res.status(500).json({ message: '注册失败，请稍后重试' });
  }
});

// 登录
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: '请填写邮箱和密码' });
    }
    
    const users = await query('SELECT * FROM users WHERE email = ?', [email]);
    
    if (users.length === 0) {
      return res.status(401).json({ message: '用户不存在' });
    }
    
    const user = users[0];
    
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
    
    res.json({ 
      user: formatUser(user), 
      token 
    });
  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({ message: '登录失败，请稍后重试' });
  }
});

// 获取当前用户信息
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const users = await query('SELECT * FROM users WHERE id = ?', [req.user.id]);
    
    if (users.length === 0) {
      return res.status(404).json({ message: '用户不存在' });
    }
    
    res.json(formatUser(users[0]));
  } catch (error) {
    console.error('获取用户信息错误:', error);
    res.status(500).json({ message: '获取用户信息失败' });
  }
});

// 更新用户信息
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { name, phone, avatar } = req.body;
    
    await query(
      'UPDATE users SET name = ?, phone = ?, avatar = ? WHERE id = ?',
      [name, phone, avatar, req.user.id]
    );
    
    const users = await query('SELECT * FROM users WHERE id = ?', [req.user.id]);
    res.json(formatUser(users[0]));
  } catch (error) {
    console.error('更新用户信息错误:', error);
    res.status(500).json({ message: '更新用户信息失败' });
  }
});

module.exports = router;
