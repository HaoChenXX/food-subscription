/**
 * 数据库连接模块 - 使用内存数据库作为MySQL的临时替代
 */

const { ensureInitialized, query: memoryQuery } = require('./memory-db-simple');

let pool = null;

// 初始化连接池
async function initPool() {
  if (!pool) {
    // 初始化内存数据库
    pool = await ensureInitialized();
  }
  return pool;
}

// 获取连接（简化版）
async function getConnection() {
  await initPool();
  return {
    execute: (sql, params) => query(sql, params),
    release: () => {}
  };
}

// 执行查询
async function query(sql, params = []) {
  await initPool();
  return memoryQuery(sql, params);
}

// 执行事务（简化版，不支持回滚）
async function transaction(queries) {
  await initPool();
  const results = [];
  for (const { sql, params } of queries) {
    const result = await query(sql, params);
    results.push(result);
  }
  return results;
}

module.exports = {
  initPool,
  getConnection,
  query,
  transaction
};