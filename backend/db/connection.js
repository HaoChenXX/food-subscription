/**
 * MySQL 数据库连接模块
 */

const mysql = require('mysql2/promise');
const { DB_CONFIG } = require('./config');

let pool = null;

// 初始化连接池
async function initPool() {
  if (!pool) {
    pool = mysql.createPool(DB_CONFIG);
  }
  return pool;
}

// 获取连接
async function getConnection() {
  const p = await initPool();
  return p.getConnection();
}

// 执行查询
async function query(sql, params = []) {
  const p = await initPool();
  const [results] = await p.execute(sql, params);
  return results;
}

// 执行事务
async function transaction(queries) {
  const connection = await getConnection();
  try {
    await connection.beginTransaction();
    const results = [];
    for (const { sql, params } of queries) {
      const [result] = await connection.execute(sql, params);
      results.push(result);
    }
    await connection.commit();
    return results;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

module.exports = {
  initPool,
  getConnection,
  query,
  transaction
};
