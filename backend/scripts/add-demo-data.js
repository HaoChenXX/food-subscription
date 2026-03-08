/**
 * 插入演示数据脚本 - 服务器端直接运行
 * 用法: cd /var/www/food-subscription-v01.1-backup/backend && node scripts/add-demo-data.js
 */

const mysql = require('mysql2/promise');

const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'food_user',
  password: process.env.DB_PASSWORD || 'food123456',
  database: process.env.DB_NAME || 'food_subscription',
  charset: 'utf8mb4'
};

async function addDemoData() {
  console.log('========================================');
  console.log('开始插入演示数据...');
  console.log('========================================\n');

  let connection;
  try {
    connection = await mysql.createConnection(DB_CONFIG);
    console.log('✓ 已连接到数据库');

    const userId = 3; // user@example.com
    
    // 检查是否已有演示数据
    const [existingOrders] = await connection.execute(
      'SELECT COUNT(*) as count FROM orders WHERE user_id = ?',
      [userId]
    );
    
    if (existingOrders[0].count > 0) {
      console.log(`\n! 用户 ${userId} 已有 ${existingOrders[0].count} 个订单`);
      console.log('  如需重新插入，请先清空 orders 和 subscriptions 表');
      console.log('  SQL: TRUNCATE TABLE orders; TRUNCATE TABLE subscriptions;');
      // 不退出，继续检查订阅
    }

    // 获取食材包信息
    const [packages] = await connection.execute(
      'SELECT id, name, price, image FROM food_packages WHERE status = "active" LIMIT 3'
    );

    if (packages.length < 3) {
      console.error('\n✗ 食材包数据不足，请先初始化数据库');
      process.exit(1);
    }

    console.log(`\n找到 ${packages.length} 个食材包用于创建演示数据`);

    // 生成订单ID
    const timestamp = Date.now();
    const orderId1 = `ORD${timestamp}001`;
    const orderId2 = `ORD${timestamp}002`;
    const orderId3 = `ORD${timestamp}003`;
    
    // 生成订阅ID
    const subId = `SUB${timestamp}001`;

    // 地址信息
    const address1 = JSON.stringify({
      province: '北京市',
      city: '北京市',
      district: '朝阳区',
      detail: '建国路88号SOHO现代城1号楼101室'
    });
    const address2 = JSON.stringify({
      province: '北京市',
      city: '北京市',
      district: '海淀区',
      detail: '中关村大街1号中关村广场购物中心B2层'
    });
    const address3 = JSON.stringify({
      province: '北京市',
      city: '北京市',
      district: '西城区',
      detail: '金融大街7号英蓝国际金融中心'
    });

    // 插入订单1：待支付
    await connection.execute(`
      INSERT INTO orders (id, user_id, package_id, quantity, total_amount, status, 
        delivery_address, contact_name, contact_phone, remark, created_at, updated_at)
      VALUES (?, ?, ?, 1, ?, 'pending_payment',
        ?, '张三', '13700137000', '请尽快发货',
        DATE_SUB(NOW(), INTERVAL 2 HOUR), DATE_SUB(NOW(), INTERVAL 2 HOUR))
    `, [
      orderId1, userId, packages[0].id, packages[0].price, address1
    ]);
    console.log(`\n✓ 创建订单1 [待支付]`);
    console.log(`  ID: ${orderId1}`);
    console.log(`  商品: ${packages[0].name}`);
    console.log(`  金额: ¥${packages[0].price}`);

    // 插入订单2：进行中 (preparing)
    await connection.execute(`
      INSERT INTO orders (id, user_id, package_id, quantity, total_amount, status, 
        payment_method, payment_time,
        delivery_address, contact_name, contact_phone, remark, created_at, updated_at)
      VALUES (?, ?, ?, 1, ?, 'preparing',
        'mock', DATE_SUB(NOW(), INTERVAL 23 HOUR),
        ?, '张三', '13700137000', '配送前请联系我',
        DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 12 HOUR))
    `, [
      orderId2, userId, packages[1].id, packages[1].price, address2
    ]);
    console.log(`\n✓ 创建订单2 [进行中]`);
    console.log(`  ID: ${orderId2}`);
    console.log(`  商品: ${packages[1].name}`);
    console.log(`  金额: ¥${packages[1].price}`);

    // 插入订单3：已完成
    await connection.execute(`
      INSERT INTO orders (id, user_id, package_id, quantity, total_amount, status, 
        payment_method, payment_time,
        delivery_address, contact_name, contact_phone, remark, created_at, updated_at)
      VALUES (?, ?, ?, 2, ?, 'completed',
        'mock', DATE_SUB(NOW(), INTERVAL 5 DAY),
        ?, '张三', '13700137000', '',
        DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_SUB(NOW(), INTERVAL 3 DAY))
    `, [
      orderId3, userId, packages[2].id, packages[2].price * 2, address3
    ]);
    console.log(`\n✓ 创建订单3 [已完成]`);
    console.log(`  ID: ${orderId3}`);
    console.log(`  商品: ${packages[2].name} × 2`);
    console.log(`  金额: ¥${packages[2].price * 2}`);

    // 插入订阅：进行中
    const nextDelivery = new Date();
    nextDelivery.setDate(nextDelivery.getDate() + 3);
    
    await connection.execute(`
      INSERT INTO subscriptions (id, user_id, package_id, frequency, quantity, total_amount, status,
        start_date, next_delivery_date,
        delivery_address, contact_name, contact_phone, created_at, updated_at)
      VALUES (?, ?, ?, 'weekly', 1, ?, 'active',
        DATE_SUB(NOW(), INTERVAL 7 DAY), ?,
        ?, '张三', '13700137000', DATE_SUB(NOW(), INTERVAL 7 DAY), NOW())
    `, [
      subId, userId, packages[0].id, packages[0].price,
      nextDelivery.toISOString().slice(0, 19).replace('T', ' '),
      address1
    ]);
    console.log(`\n✓ 创建订阅 [进行中]`);
    console.log(`  ID: ${subId}`);
    console.log(`  商品: ${packages[0].name}`);
    console.log(`  周期: 每周配送`);
    console.log(`  下次配送: ${nextDelivery.toISOString().split('T')[0]}`);

    // 统计结果
    const [orderStats] = await connection.execute(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'pending_payment' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status IN ('paid', 'preparing', 'shipped') THEN 1 ELSE 0 END) as processing,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed
      FROM orders WHERE user_id = ?
    `, [userId]);

    const [subStats] = await connection.execute(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN status = 'paused' THEN 1 ELSE 0 END) as paused,
        SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled
      FROM subscriptions WHERE user_id = ?
    `, [userId]);

    console.log('\n========================================');
    console.log('演示数据插入完成！');
    console.log('========================================');
    console.log('\n【订单统计】');
    console.log(`  总订单: ${orderStats[0].total}`);
    console.log(`  待支付: ${orderStats[0].pending}`);
    console.log(`  进行中: ${orderStats[0].processing}`);
    console.log(`  已完成: ${orderStats[0].completed}`);
    console.log('\n【订阅统计】');
    console.log(`  进行中: ${subStats[0].active}`);
    console.log(`  已暂停: ${subStats[0].paused}`);
    console.log(`  已取消: ${subStats[0].cancelled}`);
    console.log('\n【登录信息】');
    console.log('  邮箱: user@example.com');
    console.log('  密码: user123');
    console.log('========================================');

  } catch (error) {
    console.error('\n✗ 插入失败:', error.message);
    if (error.code === 'ER_DUP_ENTRY') {
      console.error('\n提示: 数据已存在，如需重新插入请执行:');
      console.error('  TRUNCATE TABLE orders;');
      console.error('  TRUNCATE TABLE subscriptions;');
    }
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
}

// 运行插入
addDemoData();
