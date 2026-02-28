/**
 * 食材包路由
 */

const express = require('express');
const { query } = require('../db/connection');
const { authMiddleware, merchantMiddleware, adminMiddleware } = require('../middleware/auth');
const { formatFoodPackage, safeJsonParse } = require('../utils/helpers');

const router = express.Router();

// 获取推荐食材包
router.get('/recommended', async (req, res) => {
  try {
    const { profileId } = req.query;
    console.log('获取推荐食材包 - profileId:', profileId);
    
    // 推荐逻辑：优先返回有库存的活跃商品
    let sql = 'SELECT * FROM food_packages WHERE status = "active" AND stock_quantity > 0';
    
    // 这里可以根据 profileId 查询用户画像，然后个性化推荐
    // 暂时按评分和销量排序返回推荐
    sql += ' ORDER BY rating DESC, sold_count DESC LIMIT 4';
    
    const packages = await query(sql);
    console.log('推荐商品数量:', packages.length);
    
    // 如果不够4个，补充其他活跃商品
    if (packages.length < 4) {
      const existingIds = packages.map(p => p.id);
      const placeholders = existingIds.length > 0 ? existingIds.map(() => '?').join(',') : '0';
      const morePackages = await query(
        `SELECT * FROM food_packages 
         WHERE status = "active" 
         AND stock_quantity > 0
         ${existingIds.length > 0 ? `AND id NOT IN (${placeholders})` : ''}
         ORDER BY created_at DESC 
         LIMIT ${4 - packages.length}`,
        existingIds
      );
      packages.push(...morePackages);
    }
    
    res.json(packages.map(formatFoodPackage));
  } catch (error) {
    console.error('获取推荐食材包错误:', error);
    res.status(500).json({ message: '获取推荐失败' });
  }
});

// 获取限时特惠食材包
router.get('/limited', async (req, res) => {
  try {
    const packages = await query(
      'SELECT * FROM food_packages WHERE status = "active" AND is_limited = 1 ORDER BY created_at DESC LIMIT 6'
    );
    res.json(packages.map(formatFoodPackage));
  } catch (error) {
    console.error('获取限时特惠错误:', error);
    res.status(500).json({ message: '获取限时特惠失败' });
  }
});

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

// 获取单个食材包（包含食材库存信息）
router.get('/:id', async (req, res) => {
  try {
    const packages = await query('SELECT * FROM food_packages WHERE id = ?', [req.params.id]);
    
    if (packages.length === 0) {
      return res.status(404).json({ message: '食材包不存在' });
    }
    
    const packageData = formatFoodPackage(packages[0]);
    
    // 获取食材包的食材库存信息
    const ingredientStocks = await query(`
      SELECT i.id, i.name, i.category, i.origin, i.stock_quantity, i.unit, i.status,
             pi.quantity as required_quantity, pi.unit as required_unit
      FROM package_ingredients pi
      JOIN ingredients i ON pi.ingredient_id = i.id
      WHERE pi.package_id = ? AND i.status = 'active'
    `, [req.params.id]);
    
    // 检查每种食材的库存是否充足
    const ingredientsWithStock = ingredientStocks.map(ing => ({
      ...ing,
      isStockSufficient: ing.stock_quantity >= ing.required_quantity,
      stockStatus: ing.stock_quantity >= ing.required_quantity ? '充足' : 
                   ing.stock_quantity > 0 ? '紧张' : '缺货'
    }));
    
    // 判断整体库存状态
    const allSufficient = ingredientsWithStock.every(ing => ing.isStockSufficient);
    const hasStock = ingredientsWithStock.some(ing => ing.stock_quantity > 0);
    
    packageData.ingredientStocks = ingredientsWithStock;
    packageData.stockStatus = {
      allSufficient,
      hasStock,
      status: allSufficient ? '充足' : hasStock ? '部分缺货' : '缺货',
      canOrder: allSufficient && packageData.stockQuantity > 0
    };
    
    res.json(packageData);
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
      stockQuantity, cookTime, servingSize, difficulty, rating, reviewCount, soldCount, isLimited, limitedTime
    } = req.body;

    const result = await query(
      `INSERT INTO food_packages
       (name, description, level, price, original_price, image, tags,
        ingredients, recipes, seasonings, nutrition_info, stock_quantity, merchant_id,
        cook_time, serving_size, difficulty, rating, review_count, sold_count, is_limited, limited_time)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, description, level, price, originalPrice, image,
       JSON.stringify(tags || []), JSON.stringify(ingredients || []),
       JSON.stringify(recipes || []), JSON.stringify(seasonings || []),
       JSON.stringify(nutritionInfo || {}), stockQuantity || 100, req.user.id,
       cookTime || 0, servingSize || 2, difficulty || 'medium', rating || 4.5, reviewCount || 0, soldCount || 0, isLimited ? 1 : 0, limitedTime || null]
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
      stockQuantity, status, cookTime, servingSize, difficulty, rating, reviewCount, soldCount, isLimited, limitedTime
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
        nutrition_info = ?, stock_quantity = ?, status = ?,
        cook_time = ?, serving_size = ?, difficulty = ?, rating = ?, review_count = ?, sold_count = ?, is_limited = ?, limited_time = ?
       WHERE id = ?`,
      [name, description, level, price, originalPrice, image,
       JSON.stringify(tags || []), JSON.stringify(ingredients || []),
       JSON.stringify(recipes || []), JSON.stringify(seasonings || []),
       JSON.stringify(nutritionInfo || {}), stockQuantity, status,
       cookTime || 0, servingSize || 2, difficulty || 'medium', rating || 4.5, reviewCount || 0, soldCount || 0, isLimited ? 1 : 0, limitedTime || null,
       req.params.id]
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

// 获取所有库存数据（管理员）
router.get('/admin/inventory', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    // 获取所有食材包库存
    const packages = await query(
      `SELECT id, name, image, level, price, stock_quantity, status,
              CASE 
                WHEN level = 'basic' THEN 20
                WHEN level = 'intermediate' THEN 15
                WHEN level = 'advanced' THEN 10
                ELSE 20
              END as min_stock
       FROM food_packages 
       WHERE status != 'deleted'
       ORDER BY stock_quantity ASC`
    );
    
    // 获取所有食材库存
    const ingredients = await query(
      `SELECT i.*, s.name as supplier_name 
       FROM ingredients i 
       LEFT JOIN suppliers s ON i.supplier_id = s.id 
       WHERE i.status = 'active'
       ORDER BY i.stock_quantity ASC`
    );
    
    // 获取库存统计
    const totalValue = packages.reduce((sum, pkg) => sum + (parseFloat(pkg.price) * pkg.stock_quantity), 0);
    const lowStockCount = packages.filter(pkg => pkg.stock_quantity < 20).length;
    
    // 格式化数据
    const inventory = {
      packages: packages.map(pkg => ({
        id: pkg.id.toString(),
        name: pkg.name,
        image: pkg.image || 'https://via.placeholder.com/40',
        category: pkg.level === 'basic' ? '基础套餐' : 
                  pkg.level === 'intermediate' ? '进阶套餐' : '精品套餐',
        stock: pkg.stock_quantity,
        minStock: pkg.min_stock,
        unit: '份',
        price: parseFloat(pkg.price),
        status: pkg.status,
        isLow: pkg.stock_quantity < pkg.min_stock,
        isOut: pkg.stock_quantity === 0
      })),
      ingredients: ingredients.map(ing => ({
        id: ing.id.toString(),
        name: ing.name,
        category: ing.category,
        stock: ing.stock_quantity,
        minStock: ing.min_stock,
        unit: ing.unit,
        origin: ing.origin,
        supplier: ing.supplier_name,
        isLow: ing.stock_quantity < ing.min_stock,
        isOut: ing.stock_quantity === 0
      })),
      stats: {
        totalPackages: packages.length,
        totalIngredients: ingredients.length,
        totalValue: Math.round(totalValue),
        lowStockCount,
        outOfStockCount: packages.filter(p => p.stock_quantity === 0).length
      }
    };
    
    res.json(inventory);
  } catch (error) {
    console.error('获取管理员库存错误:', error);
    res.status(500).json({ message: '获取库存失败' });
  }
});

// 获取商家的库存数据（商家/管理员）
router.get('/merchant/inventory', authMiddleware, merchantMiddleware, async (req, res) => {
  try {
    const merchantId = req.user.id;
    
    // 获取商家的所有食材包及其库存
    const packages = await query(
      `SELECT id, name, image, level, price, stock_quantity, status,
              CASE 
                WHEN level = 'basic' THEN 20
                WHEN level = 'intermediate' THEN 15
                WHEN level = 'advanced' THEN 10
                ELSE 20
              END as min_stock
       FROM food_packages 
       WHERE merchant_id = ? AND status != 'deleted'
       ORDER BY stock_quantity ASC`,
      [merchantId]
    );
    
    // 格式化数据
    const inventory = packages.map(pkg => ({
      id: pkg.id.toString(),
      name: pkg.name,
      image: pkg.image || 'https://via.placeholder.com/40',
      category: pkg.level === 'basic' ? '基础套餐' : 
                pkg.level === 'intermediate' ? '进阶套餐' : '精品套餐',
      stock: pkg.stock_quantity,
      minStock: pkg.min_stock,
      unit: '份',
      price: parseFloat(pkg.price),
      status: pkg.status,
      isLow: pkg.stock_quantity < pkg.min_stock,
      isOut: pkg.stock_quantity === 0
    }));
    
    res.json(inventory);
  } catch (error) {
    console.error('获取商家库存错误:', error);
    res.status(500).json({ message: '获取库存失败' });
  }
});

// 获取库存预警数据
router.get('/merchant/stock-alerts', authMiddleware, merchantMiddleware, async (req, res) => {
  try {
    const merchantId = req.user.id;
    
    // 获取低库存和缺货的食材包
    const packages = await query(
      `SELECT id, name, image, level, price, stock_quantity, status,
              CASE 
                WHEN level = 'basic' THEN 20
                WHEN level = 'intermediate' THEN 15
                WHEN level = 'advanced' THEN 10
                ELSE 20
              END as min_stock
       FROM food_packages 
       WHERE merchant_id = ? 
         AND status = 'active'
         AND stock_quantity < CASE 
                WHEN level = 'basic' THEN 20
                WHEN level = 'intermediate' THEN 15
                WHEN level = 'advanced' THEN 10
                ELSE 20
              END
       ORDER BY stock_quantity ASC`,
      [merchantId]
    );
    
    // 格式化为预警数据
    const alerts = packages.map(pkg => ({
      id: `alert-${pkg.id}`,
      productId: pkg.id.toString(),
      productName: pkg.name,
      currentStock: pkg.stock_quantity,
      minStock: pkg.min_stock,
      alertType: pkg.stock_quantity === 0 ? 'out_of_stock' : 'low_stock',
      resolved: false
    }));
    
    res.json(alerts);
  } catch (error) {
    console.error('获取库存预警错误:', error);
    res.status(500).json({ message: '获取库存预警失败' });
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
