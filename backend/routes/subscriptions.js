/**
 * 订阅路由
 */

const express = require('express');
const { query } = require('../db/connection');
const { authMiddleware } = require('../middleware/auth');
const { generateSubscriptionId, calculateNextDeliveryDate, safeJsonParse } = require('../utils/helpers');

const router = express.Router();

// 获取用户的所有订阅
router.get('/', authMiddleware, async (req, res) => {
  try {
    const subscriptions = await query(
      `SELECT s.*, fp.name as package_name, fp.image as package_image 
       FROM subscriptions s 
       LEFT JOIN food_packages fp ON s.package_id = fp.id 
       WHERE s.user_id = ? 
       ORDER BY s.created_at DESC`,
      [req.user.id]
    );
    
    res.json(subscriptions.map(sub => ({
      ...sub,
      delivery_address: safeJsonParse(sub.delivery_address, {})
    })));
  } catch (error) {
    console.error('获取订阅错误:', error);
    res.status(500).json({ message: '获取订阅失败' });
  }
});

// 获取单个订阅
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const subscriptions = await query(
      `SELECT s.*, fp.name as package_name, fp.image as package_image 
       FROM subscriptions s 
       LEFT JOIN food_packages fp ON s.package_id = fp.id 
       WHERE s.id = ? AND s.user_id = ?`,
      [req.params.id, req.user.id]
    );
    
    if (subscriptions.length === 0) {
      return res.status(404).json({ message: '订阅不存在' });
    }
    
    const sub = subscriptions[0];
    res.json({
      ...sub,
      delivery_address: safeJsonParse(sub.delivery_address, {})
    });
  } catch (error) {
    console.error('获取订阅错误:', error);
    res.status(500).json({ message: '获取订阅失败' });
  }
});

// 创建订阅
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { packageId, frequency, quantity, duration, deliveryAddress, contactName, contactPhone } = req.body;
    
    // 获取食材包信息
    const packages = await query('SELECT * FROM food_packages WHERE id = ? AND status = "active"', [packageId]);
    if (packages.length === 0) {
      return res.status(404).json({ message: '食材包不存在或已下架' });
    }
    
    const pkg = packages[0];
    const subscriptionId = generateSubscriptionId();
    const totalAmount = pkg.price * quantity * duration;
    
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + duration);
    
    const nextDeliveryDate = calculateNextDeliveryDate(frequency, startDate);
    
    await query(
      `INSERT INTO subscriptions 
       (id, user_id, package_id, frequency, quantity, total_amount,
        start_date, end_date, next_delivery_date, delivery_address, contact_name, contact_phone)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [subscriptionId, req.user.id, packageId, frequency, quantity, totalAmount,
       startDate, endDate, nextDeliveryDate, JSON.stringify(deliveryAddress), contactName, contactPhone]
    );
    
    const subscriptions = await query(
      `SELECT s.*, fp.name as package_name, fp.image as package_image 
       FROM subscriptions s 
       LEFT JOIN food_packages fp ON s.package_id = fp.id 
       WHERE s.id = ?`,
      [subscriptionId]
    );
    
    res.status(201).json({
      ...subscriptions[0],
      delivery_address: safeJsonParse(subscriptions[0].delivery_address, {})
    });
  } catch (error) {
    console.error('创建订阅错误:', error);
    res.status(500).json({ message: '创建订阅失败: ' + error.message });
  }
});

// 暂停订阅
router.post('/:id/pause', authMiddleware, async (req, res) => {
  try {
    const subscriptions = await query('SELECT * FROM subscriptions WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]);
    
    if (subscriptions.length === 0) {
      return res.status(404).json({ message: '订阅不存在' });
    }
    
    if (subscriptions[0].status !== 'active') {
      return res.status(400).json({ message: '只能暂停活跃的订阅' });
    }
    
    await query('UPDATE subscriptions SET status = ? WHERE id = ?', ['paused', req.params.id]);
    res.json({ message: '订阅已暂停' });
  } catch (error) {
    console.error('暂停订阅错误:', error);
    res.status(500).json({ message: '暂停订阅失败' });
  }
});

// 恢复订阅
router.post('/:id/resume', authMiddleware, async (req, res) => {
  try {
    const subscriptions = await query('SELECT * FROM subscriptions WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]);
    
    if (subscriptions.length === 0) {
      return res.status(404).json({ message: '订阅不存在' });
    }
    
    if (subscriptions[0].status !== 'paused') {
      return res.status(400).json({ message: '只能恢复暂停的订阅' });
    }
    
    await query('UPDATE subscriptions SET status = ? WHERE id = ?', ['active', req.params.id]);
    res.json({ message: '订阅已恢复' });
  } catch (error) {
    console.error('恢复订阅错误:', error);
    res.status(500).json({ message: '恢复订阅失败' });
  }
});

// 取消订阅
router.post('/:id/cancel', authMiddleware, async (req, res) => {
  try {
    const subscriptions = await query('SELECT * FROM subscriptions WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]);
    
    if (subscriptions.length === 0) {
      return res.status(404).json({ message: '订阅不存在' });
    }
    
    await query('UPDATE subscriptions SET status = ? WHERE id = ?', ['cancelled', req.params.id]);
    res.json({ message: '订阅已取消' });
  } catch (error) {
    console.error('取消订阅错误:', error);
    res.status(500).json({ message: '取消订阅失败' });
  }
});

module.exports = router;
