/**
 * 饮食画像路由 - 修复版
 */

const express = require('express');
const { query } = require('../db/connection');
const { authMiddleware } = require('../middleware/auth');
const { safeJsonParse } = require('../utils/helpers');

const router = express.Router();

// 获取用户的饮食画像
router.get('/', authMiddleware, async (req, res) => {
  try {
    const profiles = await query('SELECT * FROM diet_profiles WHERE user_id = ?', [req.user.id]);
    
    if (profiles.length === 0) {
      return res.status(404).json({ message: '饮食画像不存在' });
    }
    
    const profile = profiles[0];
    res.json({
      id: profile.id,
      userId: profile.user_id,
      age: profile.age,
      gender: profile.gender,
      height: profile.height,
      weight: profile.weight,
      activityLevel: profile.activity_level,
      healthGoals: safeJsonParse(profile.health_goals, []),
      dietaryRestrictions: safeJsonParse(profile.dietary_restrictions, []),
      preferredCuisines: safeJsonParse(profile.preferred_cuisines, []),
      allergies: profile.allergies,
      calorieTarget: profile.calorie_target,
      createdAt: profile.created_at,
      updatedAt: profile.updated_at
    });
  } catch (error) {
    console.error('获取饮食画像错误:', error);
    res.status(500).json({ message: '获取饮食画像失败' });
  }
});

// 创建/更新饮食画像 - 修复版
router.post('/', authMiddleware, async (req, res) => {
  try {
    const {
      age,
      gender,
      height,
      weight,
      activityLevel,
      healthGoals,
      dietaryRestrictions,
      preferredCuisines,
      allergies,
      calorieTarget
    } = req.body;
    
    // 检查是否已存在
    const existing = await query('SELECT id FROM diet_profiles WHERE user_id = ?', [req.user.id]);
    
    const healthGoalsJson = JSON.stringify(healthGoals || []);
    const restrictionsJson = JSON.stringify(dietaryRestrictions || []);
    const cuisinesJson = JSON.stringify(preferredCuisines || []);
    
    if (existing.length > 0) {
      // 更新
      await query(
        `UPDATE diet_profiles SET 
          age = ?, gender = ?, height = ?, weight = ?, 
          activity_level = ?, health_goals = ?, dietary_restrictions = ?,
          preferred_cuisines = ?, allergies = ?, calorie_target = ?
         WHERE user_id = ?`,
        [age, gender, height, weight, activityLevel, healthGoalsJson, 
         restrictionsJson, cuisinesJson, allergies, calorieTarget, req.user.id]
      );
    } else {
      // 创建
      await query(
        `INSERT INTO diet_profiles 
         (user_id, age, gender, height, weight, activity_level, 
          health_goals, dietary_restrictions, preferred_cuisines, allergies, calorie_target)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [req.user.id, age, gender, height, weight, activityLevel,
         healthGoalsJson, restrictionsJson, cuisinesJson, allergies, calorieTarget]
      );
    }
    
    // 返回更新后的数据
    const profiles = await query('SELECT * FROM diet_profiles WHERE user_id = ?', [req.user.id]);
    const profile = profiles[0];
    
    res.json({
      id: profile.id,
      userId: profile.user_id,
      age: profile.age,
      gender: profile.gender,
      height: profile.height,
      weight: profile.weight,
      activityLevel: profile.activity_level,
      healthGoals: safeJsonParse(profile.health_goals, []),
      dietaryRestrictions: safeJsonParse(profile.dietary_restrictions, []),
      preferredCuisines: safeJsonParse(profile.preferred_cuisines, []),
      allergies: profile.allergies,
      calorieTarget: profile.calorie_target,
      createdAt: profile.created_at,
      updatedAt: profile.updated_at
    });
  } catch (error) {
    console.error('保存饮食画像错误:', error);
    res.status(500).json({ message: '保存饮食画像失败: ' + error.message });
  }
});

// 删除饮食画像
router.delete('/', authMiddleware, async (req, res) => {
  try {
    await query('DELETE FROM diet_profiles WHERE user_id = ?', [req.user.id]);
    res.json({ message: '饮食画像已删除' });
  } catch (error) {
    console.error('删除饮食画像错误:', error);
    res.status(500).json({ message: '删除饮食画像失败' });
  }
});

module.exports = router;
