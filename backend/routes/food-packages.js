/**
 * 食材包路由
 */

const express = require('express');
const { query } = require('../db/connection');
const { authMiddleware, merchantMiddleware } = require('../middleware/auth');
const { formatFoodPackage, safeJsonParse } = require('../utils/helpers');

const router = express.Router();

// 获取所有食材包（公开接口）
router.get('/', async (req, res) => {
  try {
    const { level, search } = req.query;
    let sql = 'SELECT * FROM food_packages WHERE status = "active"';
    const params = [];
    
    if (level) {
      sql += ' AND level = ?';
      params.push(level);
    }
    
    if (search) {
      sql += ' AND (name LIKE ? OR description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    
    sql += ' ORDER BY created_at DESC';
    
    const packages = await query(sql, params);
    res.json(packages.map(formatFoodPackage));
  } catch (error) {
    console.error('获取食材包错误:', error);
    res.status(500).json({ message: '获取食材包失败' });
  }
});

// 获取单个食材包
router.get('/:id', async (req, res) => {
  try {
    const packages = await query('SELECT * FROM food_packages WHERE id = ?', [req.params.id]);
    
    if (packages.length === 0) {
      return res.status(404).json({ message: '食材包不存在' });
    }
    
    res.json(formatFoodPackage(packages[0]));
  } catch (error) {
    console.error('获取食材包错误:', error);
    res.status(500).json({ message: '获取食材包失败' });
  }
});

// 创建食材包（商家/管理员）
router.post('/', authMiddleware, merchantMiddleware, async (req, res) => {
  try {
    const {
      name, description, level, price, originalPrice, image,
      tags, ingredients, recipes, seasonings, nutritionInfo,
      stockQuantity
    } = req.body;
    
    const result = await query(
      `INSERT INTO food_packages 
       (name, description, level, price, original_price, image, tags, 
        ingredients, recipes, seasonings, nutrition_info, stock_quantity, merchant_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, description, level, price, originalPrice, image,
       JSON.stringify(tags || []), JSON.stringify(ingredients || []),
       JSON.stringify(recipes || []), JSON.stringify(seasonings || []),
       JSON.stringify(nutritionInfo || {}), stockQuantity || 100, req.user.id]
    );
    
    const packages = await query('SELECT * FROM food_packages WHERE id = ?', [result.insertId]);
    res.status(201).json(formatFoodPackage(packages[0]));
  } catch (error) {
    console.error('创建食材包错误:', error);
    res.status(500).json({ message: '创建食材包失败' });
  }
});

// 更新食材包（商家/管理员）
router.put('/:id', authMiddleware, merchantMiddleware, async (req, res) => {
  try {
    const {
      name, description, level, price, originalPrice, image,
      tags, ingredients, recipes, seasonings, nutritionInfo,
      stockQuantity, status
    } = req.body;
    
    // 检查权限
    const existing = await query('SELECT * FROM food_packages WHERE id = ?', [req.params.id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: '食材包不存在' });
    }
    
    if (req.user.role !== 'admin' && existing[0].merchant_id !== req.user.id) {
      return res.status(403).json({ message: '无权修改此食材包' });
    }
    
    await query(
      `UPDATE food_packages SET 
        name = ?, description = ?, level = ?, price = ?, original_price = ?,
        image = ?, tags = ?, ingredients = ?, recipes = ?, seasonings = ?,
        nutrition_info = ?, stock_quantity = ?, status = ?
       WHERE id = ?`,
      [name, description, level, price, originalPrice, image,
       JSON.stringify(tags || []), JSON.stringify(ingredients || []),
       JSON.stringify(recipes || []), JSON.stringify(seasonings || []),
       JSON.stringify(nutritionInfo || {}), stockQuantity, status, req.params.id]
    );
    
    const packages = await query('SELECT * FROM food_packages WHERE id = ?', [req.params.id]);
    res.json(formatFoodPackage(packages[0]));
  } catch (error) {
    console.error('更新食材包错误:', error);
    res.status(500).json({ message: '更新食材包失败' });
  }
});

// 删除食材包（商家/管理员）
router.delete('/:id', authMiddleware, merchantMiddleware, async (req, res) => {
  try {
    // 检查权限
    const existing = await query('SELECT * FROM food_packages WHERE id = ?', [req.params.id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: '食材包不存在' });
    }
    
    if (req.user.role !== 'admin' && existing[0].merchant_id !== req.user.id) {
      return res.status(403).json({ message: '无权删除此食材包' });
    }
    
    await query('DELETE FROM food_packages WHERE id = ?', [req.params.id]);
    res.json({ message: '食材包已删除' });
  } catch (error) {
    console.error('删除食材包错误:', error);
    res.status(500).json({ message: '删除食材包失败' });
  }
});

// 更新库存（商家/管理员）- 修复版
router.post('/:id/inventory', authMiddleware, merchantMiddleware, async (req, res) => {
  try {
    const { quantity, type, remark } = req.body;
    
    // 检查权限
    const existing = await query('SELECT * FROM food_packages WHERE id = ?', [req.params.id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: '食材包不存在' });
    }
    
    if (req.user.role !== 'admin' && existing[0].merchant_id !== req.user.id) {
      return res.status(403).json({ message: '无权修改此食材包库存' });
    }
    
    const currentQty = existing[0].stock_quantity;
    let newQty = currentQty;
    
    switch (type) {
      case 'in':
        newQty = currentQty + parseInt(quantity);
        break;
      case 'out':
        newQty = currentQty - parseInt(quantity);
        if (newQty < 0) newQty = 0;
        break;
      case 'adjust':
        newQty = parseInt(quantity);
        break;
      default:
        return res.status(400).json({ message: '无效的库存操作类型' });
    }
    
    // 更新库存
    await query('UPDATE food_packages SET stock_quantity = ? WHERE id = ?', [newQty, req.params.id]);
    
    // 记录库存变动
    await query(
      'INSERT INTO inventory_logs (package_id, merchant_id, change_quantity, current_quantity, type, remark) VALUES (?, ?, ?, ?, ?, ?)',
      [req.params.id, req.user.id, type === 'out' ? -quantity : quantity, newQty, type, remark || '']
    );
    
    res.json({ 
      message: '库存更新成功',
      previousQuantity: currentQty,
      currentQuantity: newQty,
      change: type === 'out' ? -quantity : (type === 'in' ? quantity : quantity - currentQty)
    });
  } catch (error) {
    console.error('更新库存错误:', error);
    res.status(500).json({ message: '更新库存失败: ' + error.message });
  }
});

// 获取库存记录
router.get('/:id/inventory-logs', authMiddleware, merchantMiddleware, async (req, res) => {
  try {
    const logs = await query(
      'SELECT * FROM inventory_logs WHERE package_id = ? ORDER BY created_at DESC',
      [req.params.id]
    );
    res.json(logs);
  } catch (error) {
    console.error('获取库存记录错误:', error);
    res.status(500).json({ message: '获取库存记录失败' });
  }
});

// 获取商家的所有订单（商家/管理员）
router.get('/merchant/orders', authMiddleware, merchantMiddleware, async (req, res) => {
  try {
    // 获取商家创建的所有食材包ID
    const packages = await query(
      'SELECT id FROM food_packages WHERE merchant_id = ?',
      [req.user.id]
    );
    
    const packageIds = packages.map(p => p.id);
    
    if (packageIds.length === 0) {
      return res.json([]);
    }
    
    // 获取这些食材包的所有订单
    const placeholders = packageIds.map(() => '?').join(',');
    const orders = await query(
      `SELECT o.*, fp.name as package_name, fp.image as package_image,
              u.name as user_name, u.email as user_email, u.phone as user_phone
       FROM orders o 
       LEFT JOIN food_packages fp ON o.package_id = fp.id 
       LEFT JOIN users u ON o.user_id = u.id
       WHERE o.package_id IN (${placeholders})
       ORDER BY o.created_at DESC`,
      packageIds
    );
    
    res.json(orders.map(order => ({
      ...order,
      delivery_address: safeJsonParse(order.delivery_address, {})
    })));
  } catch (error) {
    console.error('获取商家订单错误:', error);
    res.status(500).json({ message: '获取订单失败' });
  }
});

module.exports = router;
