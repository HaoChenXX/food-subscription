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

// 格式化食材包数据
function formatFoodPackage(pkg) {
  if (!pkg) return null;
  return {
    ...pkg,
    tags: safeJsonParse(pkg.tags, []),
    ingredients: safeJsonParse(pkg.ingredients, []),
    recipes: safeJsonParse(pkg.recipes, []),
    seasonings: safeJsonParse(pkg.seasonings, []),
    nutrition_info: safeJsonParse(pkg.nutrition_info, {})
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
