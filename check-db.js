const mysql = require('mysql2/promise');

async function check() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'food_user',
    password: 'food123456',
    database: 'food_subscription'
  });
  
  console.log('=== 检查食材包表结构 ===');
  const [cols] = await conn.execute('SHOW COLUMNS FROM food_packages');
  cols.forEach(c => console.log('  ' + c.Field + ': ' + c.Type));
  
  console.log('\n=== 检查食材包数据 ===');
  const [rows] = await conn.execute('SELECT id, name, status FROM food_packages LIMIT 5');
  if (rows.length === 0) {
    console.log('  没有数据！');
  } else {
    rows.forEach(r => console.log('  ID:' + r.id, '名称:' + r.name, '状态:' + r.status));
  }
  
  console.log('\n=== active 状态的数量 ===');
  const [active] = await conn.execute('SELECT COUNT(*) as count FROM food_packages WHERE status = "active"');
  console.log('  active: ' + active[0].count);
  
  await conn.end();
}

check().catch(console.error);
