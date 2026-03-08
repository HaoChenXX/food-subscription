/**
 * 插入演示数据脚本
 * 为用户 user@example.com (id=3) 创建演示订单和订阅
 */

const mysql = require('mysql2/promise');

const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'food_user',
  password: process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : 'food123456',
  database: process.env.DB_NAME || 'food_subscription',
  charset: 'utf8mb4'
};

async function insertDemoData() {
  console.log('========================================');
  console.log('开始插入演示数据...');
  console.log('========================================\n');

  let connection;
  try {
    connection = await mysql.createConnection(DB_CONFIG);
    console.log('✓ 已连接到数据库');

    const userId = 3; // user@example.com
    const now = new Date();
    
    // 生成订单ID
    const orderId1 = `ORD${Date.now()}${Math.floor(Math.random() * 1000)}`;
    const orderId2 = `ORD${Date.now() + 1}${Math.floor(Math.random() * 1000)}`;
    const orderId3 = `ORD${Date.now() + 2}${Math.floor(Math.random() * 1000)}`;
    
    // 生成订阅ID
    const subId = `SUB${Date.now()}${Math.floor(Math.random() * 1000)}`;

    // 获取食材包信息
    const [packages] = await connection.execute(
      'SELECT id, name, price, image FROM food_packages WHERE id IN (1, 2, 3)'
    );

    if (packages.length < 3) {
      console.error('食材包数据不足，请先初始化数据库');
      process.exit(1);
    }

    // 插入订单1：待支付
    await connection.execute(`
      INSERT INTO orders (id, user_id, package_id, quantity, total_amount, status, 
        delivery_address, contact_name, contact_phone, remark, created_at, updated_at)
      VALUES (?, ?, ?, 1, ?, 'pending_payment',
        ?, '张三', '13700137000', '请尽快发货',
        DATE_SUB(NOW(), INTERVAL 2 HOUR), DATE_SUB(NOW(), INTERVAL 2 HOUR))
    `, [
      orderId1,
      userId,
      packages[0].id,
      packages[0].price,
      JSON.stringify({ province: '北京市', city: '北京市', district: '朝阳区', detail: '建国路88号SOHO现代城1号楼101室' })
    ]);
    console.log(`✓ 创建订单1 (待支付): ${orderId1} - ${packages[0].name} ¥${packages[0].price}`);

    // 插入订单2：进行中 (paid/preparing)
    await connection.execute(`
      INSERT INTO orders (id, user_id, package_id, quantity, total_amount, status, 
        payment_method, payment_time,
        delivery_address, contact_name, contact_phone, remark, created_at, updated_at)
      VALUES (?, ?, ?, 1, ?, 'preparing',
        'mock', DATE_SUB(NOW(), INTERVAL 1 DAY),
        ?, '张三', '13700137000', '配送前请联系我',
        DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 12 HOUR))
    `, [
      orderId2,
      userId,
      packages[1].id,
      packages[1].price,
      JSON.stringify({ province: '北京市', city: '北京市', district: '海淀区', detail: '中关村大街1号中关村广场购物中心B2层' })
    ]);
    console.log(`✓ 创建订单2 (进行中): ${orderId2} - ${packages[1].name} ¥${packages[1].price}`);

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
      orderId3,
      userId,
      packages[2].id,
      packages[2].price * 2,
      JSON.stringify({ province: '北京市', city: '北京市', district: '西城区', detail: '金融大街7号英蓝国际金融中心' })
    ]);
    console.log(`✓ 创建订单3 (已完成): ${orderId3} - ${packages[2].name} ¥${packages[2].price * 2}`);

    // 插入订阅：进行中
    const nextDelivery = new Date();
    nextDelivery.setDate(nextDelivery.getDate() + 3); // 3天后配送
    
    await connection.execute(`
      INSERT INTO subscriptions (id, user_id, package_id, frequency, quantity, total_amount, status,
        start_date, next_delivery_date,
        delivery_address, contact_name, contact_phone, created_at, updated_at)
      VALUES (?, ?, ?, 'weekly', 1, ?, 'active',
        DATE_SUB(NOW(), INTERVAL 7 DAY), ?,
        ?, '张三', '13700137000', DATE_SUB(NOW(), INTERVAL 7 DAY), NOW())
    `, [
      subId,
      userId,
      packages[0].id,
      packages[0].price,
      nextDelivery,
      JSON.stringify({ province: '北京市', city: '北京市', district: '朝阳区', detail: '建国路88号SOHO现代城1号楼101室' })
    ]);
    console.log(`✓ 创建订阅 (进行中): ${subId} - ${packages[0].name} 每周配送`);

    console.log('\n========================================');
    console.log('演示数据插入完成！');
    console.log('========================================');
    console.log('\n订单统计:');
    console.log('  - 总订单: 3');
    console.log('  - 待支付: 1');
    console.log('  - 进行中: 1');
    console.log('  - 已完成: 1');
    console.log('\n订阅统计:');
    console.log('  - 进行中: 1');
    console.log('  - 已暂停: 0');
    console.log('  - 已取消: 0');
    console.log('\n请使用以下账号登录查看:');
    console.log('  邮箱: user@example.com');
    console.log('  密码: user123');
    console.log('========================================');

  } catch (error) {
    console.error('\n插入失败:', error.message);
    if (error.code === 'ER_DUP_ENTRY') {
      console.error('\n提示: 演示数据可能已存在，如需重新插入请先清空orders和subscriptions表');
    }
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
}

// 运行插入
insertDemoData();
