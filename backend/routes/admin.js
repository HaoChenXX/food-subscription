/**
 * 管理员路由
 */

const express = require('express');
const { query } = require('../db/connection');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const { formatUser, safeJsonParse } = require('../utils/helpers');

const router = express.Router();

// 获取所有用户（管理员）
router.get('/users', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const users = await query('SELECT id, email, name, phone, role, avatar, created_at, updated_at FROM users ORDER BY created_at DESC');
    res.json(users);
  } catch (error) {
    console.error('获取用户列表错误:', error);
    res.status(500).json({ message: '获取用户列表失败' });
  }
});

// 获取所有订单（管理员）
router.get('/orders', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const orders = await query(
      `SELECT o.*, u.name as user_name, u.email as user_email, fp.name as package_name 
       FROM orders o 
       LEFT JOIN users u ON o.user_id = u.id
       LEFT JOIN food_packages fp ON o.package_id = fp.id
       ORDER BY o.created_at DESC`
    );
    res.json(orders.map(order => ({
      ...order,
      delivery_address: safeJsonParse(order.delivery_address, {})
    })));
  } catch (error) {
    console.error('获取订单列表错误:', error);
    res.status(500).json({ message: '获取订单列表失败' });
  }
});

// 获取所有订阅（管理员）
router.get('/subscriptions', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const subscriptions = await query(
      `SELECT s.*, u.name as user_name, u.email as user_email, fp.name as package_name 
       FROM subscriptions s 
       LEFT JOIN users u ON s.user_id = u.id
       LEFT JOIN food_packages fp ON s.package_id = fp.id
       ORDER BY s.created_at DESC`
    );
    res.json(subscriptions);
  } catch (error) {
    console.error('获取订阅列表错误:', error);
    res.status(500).json({ message: '获取订阅列表失败' });
  }
});

// 获取统计数据
router.get('/statistics', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    // 用户统计
    const [userStats] = await query('SELECT COUNT(*) as total FROM users');
    const [userStatsToday] = await query('SELECT COUNT(*) as today FROM users WHERE DATE(created_at) = CURDATE()');
    
    // 订单统计
    const [orderStats] = await query('SELECT COUNT(*) as total, SUM(total_amount) as total_amount FROM orders WHERE status != "cancelled"');
    const [orderStatsToday] = await query('SELECT COUNT(*) as today, SUM(total_amount) as today_amount FROM orders WHERE DATE(created_at) = CURDATE() AND status != "cancelled"');
    
    // 订单状态统计
    const orderStatusStats = await query(
      'SELECT status, COUNT(*) as count FROM orders GROUP BY status'
    );
    
    // 食材包统计
    const [packageStats] = await query('SELECT COUNT(*) as total FROM food_packages');
    const [lowStockPackages] = await query('SELECT COUNT(*) as count FROM food_packages WHERE stock_quantity < 20');
    
    res.json({
      users: {
        total: userStats.total,
        today: userStatsToday.today
      },
      orders: {
        total: orderStats.total,
        totalAmount: orderStats.total_amount || 0,
        today: orderStatsToday.today,
        todayAmount: orderStatsToday.today_amount || 0,
        byStatus: orderStatusStats
      },
      packages: {
        total: packageStats.total,
        lowStock: lowStockPackages.count
      }
    });
  } catch (error) {
    console.error('获取统计数据错误:', error);
    res.status(500).json({ message: '获取统计数据失败' });
  }
});

// 更新订单状态（管理员）
router.put('/orders/:id/status', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending_payment', 'paid', 'preparing', 'delivered', 'completed', 'cancelled'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: '无效的订单状态' });
    }
    
    await query('UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?', [status, req.params.id]);
    
    res.json({ message: '订单状态已更新' });
  } catch (error) {
    console.error('更新订单状态错误:', error);
    res.status(500).json({ message: '更新订单状态失败' });
  }
});

// 删除用户（管理员）
router.delete('/users/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    // 不能删除自己
    if (parseInt(req.params.id) === req.user.id) {
      return res.status(400).json({ message: '不能删除自己' });
    }
    
    await query('DELETE FROM users WHERE id = ?', [req.params.id]);
    res.json({ message: '用户已删除' });
  } catch (error) {
    console.error('删除用户错误:', error);
    res.status(500).json({ message: '删除用户失败' });
  }
});

module.exports = router;
