/**
 * 订单路由 - 包含支付功能修复
 */

const express = require('express');
const { query, transaction } = require('../db/connection');
const { authMiddleware } = require('../middleware/auth');
const { generateOrderId, formatFoodPackage, safeJsonParse } = require('../utils/helpers');

const router = express.Router();

// 获取用户的所有订单
router.get('/', authMiddleware, async (req, res) => {
  try {
    console.log('获取订单列表 - 用户ID:', req.user.id);

    const orders = await query(
      `SELECT o.*, fp.name as package_name, fp.image as package_image
       FROM orders o
       LEFT JOIN food_packages fp ON o.package_id = fp.id
       WHERE o.user_id = ?
       ORDER BY o.created_at DESC`,
      [req.user.id]
    );

    console.log('查询到的订单数量:', orders.length);
    console.log('订单数据:', JSON.stringify(orders, null, 2));

    res.json(orders.map(order => ({
      ...order,
      delivery_address: safeJsonParse(order.delivery_address, {})
    })));
  } catch (error) {
    console.error('获取订单错误:', error);
    res.status(500).json({ message: '获取订单失败' });
  }
});

// 获取单个订单
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const orders = await query(
      `SELECT o.*, fp.name as package_name, fp.image as package_image 
       FROM orders o 
       LEFT JOIN food_packages fp ON o.package_id = fp.id 
       WHERE o.id = ? AND o.user_id = ?`,
      [req.params.id, req.user.id]
    );
    
    if (orders.length === 0) {
      return res.status(404).json({ message: '订单不存在' });
    }
    
    const order = orders[0];
    res.json({
      ...order,
      delivery_address: safeJsonParse(order.delivery_address, {})
    });
  } catch (error) {
    console.error('获取订单错误:', error);
    res.status(500).json({ message: '获取订单失败' });
  }
});

// 创建订单
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { packageId, quantity, deliveryAddress, contactName, contactPhone, remark } = req.body;

    console.log('创建订单 - 用户ID:', req.user.id);
    console.log('订单数据:', { packageId, quantity, deliveryAddress, contactName, contactPhone, remark });

    // 参数校验和默认值处理
    if (!packageId) {
      return res.status(400).json({ message: 'packageId 不能为空' });
    }

    // 获取食材包信息
    const packages = await query('SELECT * FROM food_packages WHERE id = ? AND status = "active"', [packageId]);
    if (packages.length === 0) {
      return res.status(404).json({ message: '食材包不存在或已下架' });
    }

    const pkg = packages[0];
    const qty = parseInt(quantity) || 1;

    // 检查库存
    if (pkg.stock_quantity < qty) {
      return res.status(400).json({ message: '库存不足' });
    }

    const orderId = generateOrderId();
    const totalAmount = parseFloat(pkg.price) * qty;

    console.log('生成的订单ID:', orderId);

    // 处理可能为 undefined 的参数
    const safeContactName = contactName || '';
    const safeContactPhone = contactPhone || '';
    const safeRemark = remark || '';
    const safeDeliveryAddress = deliveryAddress || {};

    // 创建订单
    await query(
      `INSERT INTO orders
       (id, user_id, package_id, quantity, total_amount, status,
        delivery_address, contact_name, contact_phone, remark)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [orderId, req.user.id, packageId, qty, totalAmount, 'pending_payment',
       JSON.stringify(safeDeliveryAddress), safeContactName, safeContactPhone, safeRemark]
    );
    
    // 扣减库存
    await query('UPDATE food_packages SET stock_quantity = stock_quantity - ? WHERE id = ?', 
      [quantity, packageId]);
    
    // 记录库存变动
    await query(
      'INSERT INTO inventory_logs (package_id, merchant_id, change_quantity, current_quantity, type, remark) VALUES (?, ?, ?, ?, ?, ?)',
      [packageId, pkg.merchant_id, -quantity, pkg.stock_quantity - quantity, 'sale', `订单: ${orderId}`]
    );
    
    const orders = await query(
      `SELECT o.*, fp.name as package_name, fp.image as package_image 
       FROM orders o 
       LEFT JOIN food_packages fp ON o.package_id = fp.id 
       WHERE o.id = ?`,
      [orderId]
    );
    
    res.status(201).json({
      ...orders[0],
      delivery_address: safeJsonParse(orders[0].delivery_address, {})
    });
  } catch (error) {
    console.error('创建订单错误:', error);
    res.status(500).json({ message: '创建订单失败: ' + error.message });
  }
});

// 模拟支付 - 修复版
router.post('/:id/pay', authMiddleware, async (req, res) => {
  try {
    const { paymentMethod = 'mock' } = req.body;

    console.log('支付订单 - 订单ID:', req.params.id, '用户ID:', req.user.id);

    // 获取订单
    const orders = await query('SELECT * FROM orders WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]);
    
    if (orders.length === 0) {
      return res.status(404).json({ message: '订单不存在' });
    }
    
    const order = orders[0];
    
    if (order.status !== 'pending_payment') {
      return res.status(400).json({ message: '订单状态不允许支付' });
    }
    
    const transactionId = `PAY${Date.now()}${Math.floor(Math.random() * 1000)}`;
    
    // 更新订单状态
    await query(
      'UPDATE orders SET status = ?, payment_method = ?, payment_time = NOW() WHERE id = ?',
      ['paid', paymentMethod, req.params.id]
    );
    
    // 创建支付记录
    await query(
      'INSERT INTO payments (order_id, user_id, amount, payment_method, transaction_id, status, paid_at) VALUES (?, ?, ?, ?, ?, ?, NOW())',
      [req.params.id, req.user.id, order.total_amount, paymentMethod, transactionId, 'success']
    );
    
    // 返回更新后的订单
    const updatedOrders = await query(
      `SELECT o.*, fp.name as package_name, fp.image as package_image 
       FROM orders o 
       LEFT JOIN food_packages fp ON o.package_id = fp.id 
       WHERE o.id = ?`,
      [req.params.id]
    );
    
    res.json({
      message: '支付成功',
      transactionId,
      order: {
        ...updatedOrders[0],
        delivery_address: safeJsonParse(updatedOrders[0].delivery_address, {})
      }
    });
  } catch (error) {
    console.error('支付错误:', error);
    res.status(500).json({ message: '支付失败: ' + error.message });
  }
});

// 取消订单
router.post('/:id/cancel', authMiddleware, async (req, res) => {
  try {
    const orders = await query('SELECT * FROM orders WHERE id = ? AND user_id = ?', 
      [req.params.id, req.user.id]);
    
    if (orders.length === 0) {
      return res.status(404).json({ message: '订单不存在' });
    }
    
    const order = orders[0];
    
    if (order.status !== 'pending_payment' && order.status !== 'paid') {
      return res.status(400).json({ message: '订单状态不允许取消' });
    }
    
    // 恢复库存
    await query('UPDATE food_packages SET stock_quantity = stock_quantity + ? WHERE id = ?',
      [order.quantity, order.package_id]);
    
    // 更新订单状态
    await query('UPDATE orders SET status = ? WHERE id = ?', ['cancelled', req.params.id]);
    
    res.json({ message: '订单已取消' });
  } catch (error) {
    console.error('取消订单错误:', error);
    res.status(500).json({ message: '取消订单失败' });
  }
});

module.exports = router;
