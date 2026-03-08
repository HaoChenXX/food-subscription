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
    try {
      const [existingOrders] = await connection.execute(
        'SELECT COUNT(*) as count FROM orders WHERE user_id = ?',
        [userId]
      );
      
      if (existingOrders[0].count > 0) {
        console.log(`\n! 用户 ${userId} 已有 ${existingOrders[0].count} 个订单`);
        console.log('  如需重新插入，请先清空 orders 和 subscriptions 表');
        console.log('  SQL: TRUNCATE TABLE orders; TRUNCATE TABLE subscriptions;');
      }
    } catch (e) {
      // 忽略错误，继续执行
    }

    // 获取食材包信息（不依赖status字段）
    const [packages] = await connection.execute(
      'SELECT id, name, price, image FROM food_packages LIMIT 3'
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

    // 获取orders表的字段
    const [orderColumns] = await connection.execute('SHOW COLUMNS FROM orders');
    const orderFields = orderColumns.map((c) => c.Field);
    console.log('  订单表字段:', orderFields.join(', '));
    
    const hasStatus = orderFields.includes('status');
    const hasPaymentMethod = orderFields.includes('payment_method');
    const hasPaymentTime = orderFields.includes('payment_time');

    // 构建插入SQL - 订单1：待支付
    let order1Fields = ['id', 'user_id', 'package_id', 'quantity', 'total_amount'];
    let order1Values = [orderId1, userId, packages[0].id, 1, packages[0].price];
    
    if (hasStatus) { order1Fields.push('status'); order1Values.push('pending_payment'); }
    if (hasPaymentMethod) { order1Fields.push('payment_method'); order1Values.push(null); }
    if (hasPaymentTime) { order1Fields.push('payment_time'); order1Values.push(null); }
    
    await connection.execute(
      `INSERT INTO orders (${order1Fields.join(', ')}, delivery_address, contact_name, contact_phone, remark, created_at, updated_at)
       VALUES (${order1Fields.map(() => '?').join(', ')}, ?, '张三', '13700137000', '请尽快发货', DATE_SUB(NOW(), INTERVAL 2 HOUR), DATE_SUB(NOW(), INTERVAL 2 HOUR))`,
      [...order1Values, address1]
    );
    console.log(`\n✓ 创建订单1 [待支付]`);
    console.log(`  ID: ${orderId1}`);
    console.log(`  商品: ${packages[0].name}`);
    console.log(`  金额: ¥${packages[0].price}`);

    // 订单2：进行中
    let order2Fields = ['id', 'user_id', 'package_id', 'quantity', 'total_amount'];
    let order2Values = [orderId2, userId, packages[1].id, 1, packages[1].price];
    
    if (hasStatus) { order2Fields.push('status'); order2Values.push('preparing'); }
    if (hasPaymentMethod) { order2Fields.push('payment_method'); order2Values.push('mock'); }
    if (hasPaymentTime) { order2Fields.push('payment_time'); order2Values.push(new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' ')); }
    
    await connection.execute(
      `INSERT INTO orders (${order2Fields.join(', ')}, delivery_address, contact_name, contact_phone, remark, created_at, updated_at)
       VALUES (${order2Fields.map(() => '?').join(', ')}, ?, '张三', '13700137000', '配送前请联系我', DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 12 HOUR))`,
      [...order2Values, address2]
    );
    console.log(`\n✓ 创建订单2 [进行中]`);
    console.log(`  ID: ${orderId2}`);
    console.log(`  商品: ${packages[1].name}`);
    console.log(`  金额: ¥${packages[1].price}`);

    // 订单3：已完成
    let order3Fields = ['id', 'user_id', 'package_id', 'quantity', 'total_amount'];
    let order3Values = [orderId3, userId, packages[2].id, 2, packages[2].price * 2];
    
    if (hasStatus) { order3Fields.push('status'); order3Values.push('completed'); }
    if (hasPaymentMethod) { order3Fields.push('payment_method'); order3Values.push('mock'); }
    if (hasPaymentTime) { order3Fields.push('payment_time'); order3Values.push(new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' ')); }
    
    await connection.execute(
      `INSERT INTO orders (${order3Fields.join(', ')}, delivery_address, contact_name, contact_phone, remark, created_at, updated_at)
       VALUES (${order3Fields.map(() => '?').join(', ')}, ?, '张三', '13700137000', '', DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_SUB(NOW(), INTERVAL 3 DAY))`,
      [...order3Values, address3]
    );
    console.log(`\n✓ 创建订单3 [已完成]`);
    console.log(`  ID: ${orderId3}`);
    console.log(`  商品: ${packages[2].name} × 2`);
    console.log(`  金额: ¥${packages[2].price * 2}`);

    // 获取subscriptions表的字段
    const [subColumns] = await connection.execute('SHOW COLUMNS FROM subscriptions');
    const subFields = subColumns.map((c) => c.Field);
    console.log('  订阅表字段:', subFields.join(', '));
    
    const subHasStatus = subFields.includes('status');
    const subHasFrequency = subFields.includes('frequency');
    const subHasNextDelivery = subFields.includes('next_delivery_date');

    // 插入订阅
    const nextDelivery = new Date();
    nextDelivery.setDate(nextDelivery.getDate() + 3);
    
    let subInsertFields = ['id', 'user_id', 'package_id', 'quantity', 'total_amount'];
    let subInsertValues = [subId, userId, packages[0].id, 1, packages[0].price];
    
    if (subHasStatus) { subInsertFields.push('status'); subInsertValues.push('active'); }
    if (subHasFrequency) { subInsertFields.push('frequency'); subInsertValues.push('weekly'); }
    if (subHasNextDelivery) { subInsertFields.push('next_delivery_date'); subInsertValues.push(nextDelivery.toISOString().slice(0, 19).replace('T', ' ')); }
    
    await connection.execute(
      `INSERT INTO subscriptions (${subInsertFields.join(', ')}, delivery_address, contact_name, contact_phone, created_at, updated_at)
       VALUES (${subInsertFields.map(() => '?').join(', ')}, ?, '张三', '13700137000', DATE_SUB(NOW(), INTERVAL 7 DAY), NOW())`,
      [...subInsertValues, address1]
    );
    console.log(`\n✓ 创建订阅 [进行中]`);
    console.log(`  ID: ${subId}`);
    console.log(`  商品: ${packages[0].name}`);
    console.log(`  周期: 每周配送`);
    console.log(`  下次配送: ${nextDelivery.toISOString().split('T')[0]}`);

    // 统计结果（简化版，只统计总数）
    const [orderCount] = await connection.execute(
      'SELECT COUNT(*) as total FROM orders WHERE user_id = ?', [userId]
    );
    const [subCount] = await connection.execute(
      'SELECT COUNT(*) as total FROM subscriptions WHERE user_id = ?', [userId]
    );

    console.log('\n========================================');
    console.log('演示数据插入完成！');
    console.log('========================================');
    console.log('\n【订单统计】');
    console.log(`  总订单: ${orderCount[0].total}`);
    console.log('  待支付: 1');
    console.log('  进行中: 1');
    console.log('  已完成: 1');
    console.log('\n【订阅统计】');
    console.log(`  进行中: ${subCount[0].total}`);
    console.log('  已暂停: 0');
    console.log('  已取消: 0');
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
