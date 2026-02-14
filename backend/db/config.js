/**
 * 数据库配置文件
 */

const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'food_user',
  password: process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : 'food123456',
  database: process.env.DB_NAME || 'food_subscription',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4'
};

module.exports = { DB_CONFIG };
