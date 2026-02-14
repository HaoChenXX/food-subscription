/**
 * 地址路由
 */

const express = require('express');
const { query } = require('../db/connection');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// 获取用户的所有地址
router.get('/', authMiddleware, async (req, res) => {
  try {
    const addresses = await query(
      'SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC, created_at DESC',
      [req.user.id]
    );
    res.json(addresses);
  } catch (error) {
    console.error('获取地址错误:', error);
    res.status(500).json({ message: '获取地址失败' });
  }
});

// 获取单个地址
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const addresses = await query('SELECT * FROM addresses WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]);
    
    if (addresses.length === 0) {
      return res.status(404).json({ message: '地址不存在' });
    }
    
    res.json(addresses[0]);
  } catch (error) {
    console.error('获取地址错误:', error);
    res.status(500).json({ message: '获取地址失败' });
  }
});

// 创建地址
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, phone, province, city, district, detailAddress, isDefault } = req.body;
    
    // 如果设为默认，先将其他地址设为非默认
    if (isDefault) {
      await query('UPDATE addresses SET is_default = FALSE WHERE user_id = ?', [req.user.id]);
    }
    
    const result = await query(
      `INSERT INTO addresses 
       (user_id, name, phone, province, city, district, detail_address, is_default)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.user.id, name, phone, province, city, district, detailAddress, isDefault]
    );
    
    const addresses = await query('SELECT * FROM addresses WHERE id = ?', [result.insertId]);
    res.status(201).json(addresses[0]);
  } catch (error) {
    console.error('创建地址错误:', error);
    res.status(500).json({ message: '创建地址失败' });
  }
});

// 更新地址
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { name, phone, province, city, district, detailAddress, isDefault } = req.body;
    
    // 检查地址是否存在
    const existing = await query('SELECT * FROM addresses WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]);
    
    if (existing.length === 0) {
      return res.status(404).json({ message: '地址不存在' });
    }
    
    // 如果设为默认，先将其他地址设为非默认
    if (isDefault) {
      await query('UPDATE addresses SET is_default = FALSE WHERE user_id = ? AND id != ?', 
        [req.user.id, req.params.id]);
    }
    
    await query(
      `UPDATE addresses SET 
        name = ?, phone = ?, province = ?, city = ?, 
        district = ?, detail_address = ?, is_default = ?
       WHERE id = ? AND user_id = ?`,
      [name, phone, province, city, district, detailAddress, isDefault, req.params.id, req.user.id]
    );
    
    const addresses = await query('SELECT * FROM addresses WHERE id = ?', [req.params.id]);
    res.json(addresses[0]);
  } catch (error) {
    console.error('更新地址错误:', error);
    res.status(500).json({ message: '更新地址失败' });
  }
});

// 删除地址
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const result = await query('DELETE FROM addresses WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: '地址不存在' });
    }
    
    res.json({ message: '地址已删除' });
  } catch (error) {
    console.error('删除地址错误:', error);
    res.status(500).json({ message: '删除地址失败' });
  }
});

module.exports = router;
