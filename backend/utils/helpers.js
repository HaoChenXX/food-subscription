/**
 * 工具函数
 */

// 生成订单号
function generateOrderId() {
  const prefix = 'ORD';
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}${timestamp}${random}`;
}

// 生成订阅号
function generateSubscriptionId() {
  const prefix = 'SUB';
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}${timestamp}${random}`;
}

// 生成地址ID
function generateAddressId() {
  const prefix = 'ADDR';
  const timestamp = Date.now().toString();
  return `${prefix}${timestamp}`;
}

// 格式化日期
function formatDate(date) {
  return new Date(date).toISOString().split('T')[0];
}

// 计算下一次配送日期
function calculateNextDeliveryDate(frequency, startDate = new Date()) {
  const date = new Date(startDate);
  switch (frequency) {
    case 'weekly':
      date.setDate(date.getDate() + 7);
      break;
    case 'biweekly':
      date.setDate(date.getDate() + 14);
      break;
    case 'monthly':
      date.setMonth(date.getMonth() + 1);
      break;
  }
  return date;
}

// 安全地解析JSON
function safeJsonParse(str, defaultValue = null) {
  try {
    if (typeof str === 'string') {
      return JSON.parse(str);
    }
    return str || defaultValue;
  } catch {
    return defaultValue;
  }
}

// 格式化用户数据（移除密码）
function formatUser(user) {
  if (!user) return null;
  const { password, ...userWithoutPassword } = user;
  return {
    ...userWithoutPassword,
    created_at: user.created_at,
    updated_at: user.updated_at
  };
}

// 格式化食材包数据 - 转换为前端期望的格式
function formatFoodPackage(pkg) {
  if (!pkg) return null;
  
  // 解析 JSON 字段
  const tags = safeJsonParse(pkg.tags, []);
  const ingredients = safeJsonParse(pkg.ingredients, []);
  const recipes = safeJsonParse(pkg.recipes, []);
  const seasonings = safeJsonParse(pkg.seasonings, []);
  const nutritionInfo = safeJsonParse(pkg.nutrition_info, {});
  
  // 计算总烹饪时间（从食谱步骤中累加）
  let cookTime = 0;
  if (recipes && recipes.length > 0 && recipes[0].steps) {
    cookTime = recipes[0].steps.reduce((sum, step) => sum + (step.duration || 0), 0);
  }
  
  // 估算份量（根据食材数量估算，或默认2人份）
  const servingSize = ingredients.length > 0 ? Math.min(2 + Math.floor(ingredients.length / 3), 6) : 2;
  
  // 根据等级判断难度
  const difficultyMap = { basic: 'easy', intermediate: 'medium', advanced: 'hard' };
  const difficulty = difficultyMap[pkg.level] || 'medium';
  
  return {
    id: pkg.id.toString(),
    name: pkg.name,
    description: pkg.description,
    level: pkg.level === 'intermediate' ? 'advanced' : pkg.level, // 前端只有 basic/advanced/premium
    price: parseFloat(pkg.price),
    originalPrice: parseFloat(pkg.original_price || pkg.price),
    image: pkg.image,
    tags: tags,
    ingredients: ingredients,
    recipes: recipes,
    seasonings: seasonings,
    nutritionInfo: nutritionInfo,
    // 前端需要的额外字段（默认值或计算）
    servingSize: servingSize,
    cookTime: cookTime,
    difficulty: difficulty,
    rating: 4.5 + Math.random() * 0.5, // 临时：随机评分 4.5-5.0
    reviewCount: Math.floor(Math.random() * 200) + 50, // 临时：随机评论数 50-250
    soldCount: Math.floor(Math.random() * 500) + 100, // 临时：随机销量 100-600
    isLimited: pkg.is_limited === 1,
    limitedTime: pkg.is_limited ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() : undefined,
    // 保留原始字段
    stockQuantity: pkg.stock_quantity,
    status: pkg.status,
    merchantId: pkg.merchant_id,
    createdAt: pkg.created_at,
    updatedAt: pkg.updated_at
  };
}

module.exports = {
  generateOrderId,
  generateSubscriptionId,
  generateAddressId,
  formatDate,
  calculateNextDeliveryDate,
  safeJsonParse,
  formatUser,
  formatFoodPackage
};
