/**
 * MySQL 数据库初始化脚本
 * 创建表结构和初始数据
 */

const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

// 数据库配置（使用 food_user 用户）
const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'food_user',
  password: process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : 'food123456',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4'
};

const DB_NAME = process.env.DB_NAME || 'food_subscription';

const TABLES_SQL = `
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  role ENUM('admin', 'merchant', 'user') DEFAULT 'user',
  avatar VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS food_packages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  level ENUM('basic', 'intermediate', 'advanced') DEFAULT 'basic',
  price DECIMAL(10, 2) NOT NULL,
  original_price DECIMAL(10, 2),
  image VARCHAR(500),
  tags JSON,
  ingredients JSON,
  recipes JSON,
  seasonings JSON,
  nutrition_info JSON,
  is_limited BOOLEAN DEFAULT FALSE,
  stock_quantity INT DEFAULT 100,
  merchant_id INT,
  status ENUM('active', 'inactive', 'sold_out') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_level (level),
  INDEX idx_status (status),
  INDEX idx_merchant (merchant_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS orders (
  id VARCHAR(50) PRIMARY KEY,
  user_id INT NOT NULL,
  package_id INT NOT NULL,
  quantity INT DEFAULT 1,
  total_amount DECIMAL(10, 2) NOT NULL,
  status ENUM('pending_payment', 'paid', 'preparing', 'delivered', 'completed', 'cancelled') DEFAULT 'pending_payment',
  payment_method VARCHAR(50),
  payment_time TIMESTAMP NULL,
  delivery_address JSON,
  contact_name VARCHAR(100),
  contact_phone VARCHAR(20),
  remark TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS subscriptions (
  id VARCHAR(50) PRIMARY KEY,
  user_id INT NOT NULL,
  package_id INT NOT NULL,
  frequency ENUM('weekly', 'biweekly', 'monthly') DEFAULT 'weekly',
  quantity INT DEFAULT 1,
  total_amount DECIMAL(10, 2) NOT NULL,
  status ENUM('active', 'paused', 'cancelled', 'expired') DEFAULT 'active',
  start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  end_date TIMESTAMP NULL,
  next_delivery_date TIMESTAMP NULL,
  delivery_address JSON,
  contact_name VARCHAR(100),
  contact_phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS diet_profiles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNIQUE NOT NULL,
  age INT,
  gender ENUM('male', 'female', 'other'),
  height INT,
  weight INT,
  activity_level ENUM('low', 'moderate', 'high'),
  health_goals JSON,
  dietary_restrictions JSON,
  preferred_cuisines JSON,
  allergies TEXT,
  calorie_target INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS addresses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  name VARCHAR(100),
  phone VARCHAR(20),
  province VARCHAR(50),
  city VARCHAR(50),
  district VARCHAR(50),
  detail_address VARCHAR(255),
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS suppliers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  contact VARCHAR(100),
  phone VARCHAR(20),
  email VARCHAR(255),
  address VARCHAR(255),
  categories JSON,
  rating DECIMAL(2, 1) DEFAULT 5.0,
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS inventory_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  package_id INT NOT NULL,
  merchant_id INT NOT NULL,
  change_quantity INT NOT NULL,
  current_quantity INT NOT NULL,
  type ENUM('in', 'out', 'adjust', 'sale') NOT NULL,
  remark TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_package_id (package_id),
  INDEX idx_merchant_id (merchant_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id VARCHAR(50),
  subscription_id VARCHAR(50),
  user_id INT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  payment_method VARCHAR(50) DEFAULT 'mock',
  transaction_id VARCHAR(100),
  status ENUM('pending', 'success', 'failed', 'refunded') DEFAULT 'pending',
  paid_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_order_id (order_id),
  INDEX idx_user_id (user_id),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS uploads (
  id INT AUTO_INCREMENT PRIMARY KEY,
  filename VARCHAR(255) NOT NULL,
  original_name VARCHAR(255),
  mime_type VARCHAR(100),
  size INT,
  path VARCHAR(500) NOT NULL,
  url VARCHAR(500) NOT NULL,
  uploaded_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_uploaded_by (uploaded_by)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 食材库存表（独立管理各食材库存）
CREATE TABLE IF NOT EXISTS ingredients (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  category VARCHAR(50),
  origin VARCHAR(100),
  stock_quantity INT DEFAULT 0,
  unit VARCHAR(20) DEFAULT 'g',
  min_stock INT DEFAULT 10,
  supplier_id INT,
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_category (category),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 食材包与食材关联表（记录每个食材包需要哪些食材及数量）
CREATE TABLE IF NOT EXISTS package_ingredients (
  id INT AUTO_INCREMENT PRIMARY KEY,
  package_id INT NOT NULL,
  ingredient_id INT NOT NULL,
  quantity INT NOT NULL,
  unit VARCHAR(20) DEFAULT 'g',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_package_ingredient (package_id, ingredient_id),
  INDEX idx_package_id (package_id),
  INDEX idx_ingredient_id (ingredient_id),
  FOREIGN KEY (package_id) REFERENCES food_packages(id) ON DELETE CASCADE,
  FOREIGN KEY (ingredient_id) REFERENCES ingredients(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
`;

async function initDatabase() {
  console.log('========================================');
  console.log('开始初始化 MySQL 数据库...');
  console.log('========================================\n');

  let connection;
  try {
    // 直接连接到指定数据库（数据库已由部署脚本创建）
    console.log(`连接到数据库: ${DB_NAME}`);
    connection = await mysql.createConnection({ ...DB_CONFIG, database: DB_NAME });
    console.log(`✓ 已连接到数据库 '${DB_NAME}'`);
    
    // 创建表
    const statements = TABLES_SQL.split(';').filter(s => s.trim());
    for (const statement of statements) {
      if (statement.trim()) {
        await connection.execute(statement);
      }
    }
    console.log('✓ 所有数据表创建成功');
    
    // 插入初始用户
    const hashedAdminPassword = await bcrypt.hash('admin123', 10);
    const hashedMerchantPassword = await bcrypt.hash('merchant123', 10);
    const hashedUserPassword = await bcrypt.hash('user123', 10);
    
    await connection.execute(`
      INSERT IGNORE INTO users (id, email, password, name, phone, role, avatar) VALUES
      (1, 'admin@example.com', ?, '管理员', '13800138000', 'admin', 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin'),
      (2, 'merchant@example.com', ?, '李供应商', '13900139000', 'merchant', 'https://api.dicebear.com/7.x/avataaars/svg?seed=merchant'),
      (3, 'user@example.com', ?, '张三', '13700137000', 'user', 'https://api.dicebear.com/7.x/avataaars/svg?seed=user')
    `, [hashedAdminPassword, hashedMerchantPassword, hashedUserPassword]);
    console.log('✓ 初始用户数据插入成功');
    
    // 插入初始食材包（库存合理分布：充足、紧张、缺货）
    await connection.execute(`
      INSERT IGNORE INTO food_packages (id, name, description, level, price, original_price, image, tags, ingredients, recipes, seasonings, nutrition_info, is_limited, stock_quantity, merchant_id, status) VALUES
      -- 库存充足的食材包
      (1, '健康减脂套餐', '低卡路里、高蛋白的健康食材组合，适合减脂期食用', 'basic', 89, 109, 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop', 
        '["减脂", "高蛋白", "低卡"]', 
        '[{"id": "1", "name": "鸡胸肉", "category": "肉类", "quantity": 500, "unit": "g", "origin": "山东"}, {"id": "2", "name": "西兰花", "category": "蔬菜", "quantity": 300, "unit": "g", "origin": "云南"}, {"id": "3", "name": "胡萝卜", "category": "蔬菜", "quantity": 200, "unit": "g", "origin": "山东"}, {"id": "4", "name": "糙米", "category": "主食", "quantity": 500, "unit": "g", "origin": "东北"}]',
        '[{"id": "1", "name": "香煎鸡胸肉配蔬菜", "description": "低脂高蛋白的经典减脂餐", "steps": [{"order": 1, "description": "鸡胸肉洗净切片，用盐和黑胡椒腌制15分钟", "duration": 15}, {"order": 2, "description": "西兰花和胡萝卜焯水备用", "duration": 5}, {"order": 3, "description": "平底锅少油煎鸡胸肉至两面金黄", "duration": 8}, {"order": 4, "description": "搭配蔬菜装盘即可", "duration": 2}], "tips": ["鸡胸肉不要煎太久，避免口感柴", "可以搭配低脂沙拉酱"]}]',
        '[{"id": "1", "name": "海盐", "quantity": "适量", "included": true}, {"id": "2", "name": "黑胡椒", "quantity": "适量", "included": true}, {"id": "3", "name": "橄榄油", "quantity": "30ml", "included": true}]',
        '{"calories": 450, "protein": 35, "carbs": 45, "fat": 12, "fiber": 8}',
        false, 80, 2, 'active'),
      (2, '增肌能量套餐', '高蛋白、适量碳水的增肌食材组合', 'intermediate', 129, 159, 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=800&auto=format&fit=crop',
        '["增肌", "高蛋白", "健身"]',
        '[{"id": "5", "name": "牛肉", "category": "肉类", "quantity": 600, "unit": "g", "origin": "澳洲"}, {"id": "6", "name": "鸡蛋", "category": "蛋奶", "quantity": 12, "unit": "个", "origin": "本地"}, {"id": "7", "name": "红薯", "category": "主食", "quantity": 800, "unit": "g", "origin": "新疆"}, {"id": "8", "name": "菠菜", "category": "蔬菜", "quantity": 400, "unit": "g", "origin": "山东"}]',
        '[{"id": "2", "name": "黑椒牛柳配烤红薯", "description": "高蛋白增肌餐，搭配优质碳水", "steps": [{"order": 1, "description": "牛肉切条，用黑胡椒酱腌制20分钟", "duration": 20}, {"order": 2, "description": "红薯切块，烤箱200度烤30分钟", "duration": 30}, {"order": 3, "description": "热锅快炒牛柳至变色", "duration": 5}, {"order": 4, "description": "菠菜焯水后摆盘", "duration": 3}], "tips": ["牛肉逆纹切更嫩", "红薯烤后口感更佳"]}]',
        '[{"id": "4", "name": "黑胡椒酱", "quantity": "50g", "included": true}, {"id": "5", "name": "海盐", "quantity": "适量", "included": true}, {"id": "6", "name": "橄榄油", "quantity": "30ml", "included": true}]',
        '{"calories": 680, "protein": 55, "carbs": 65, "fat": 22, "fiber": 10}',
        false, 45, 2, 'active'),
      -- 库存紧张的食材包
      (3, '地中海风味套餐', '健康的地中海饮食风格，富含不饱和脂肪酸', 'advanced', 159, 199, 'https://images.unsplash.com/photo-1543339308-43e59d6b73a6?w=800&auto=format&fit=crop',
        '["地中海", "健康", "高端"]',
        '[{"id": "9", "name": "三文鱼", "category": "海鲜", "quantity": 400, "unit": "g", "origin": "挪威"}, {"id": "10", "name": "牛油果", "category": "水果", "quantity": 2, "unit": "个", "origin": "墨西哥"}, {"id": "11", "name": "藜麦", "category": "主食", "quantity": 300, "unit": "g", "origin": "秘鲁"}, {"id": "12", "name": "樱桃番茄", "category": "蔬菜", "quantity": 300, "unit": "g", "origin": "山东"}]',
        '[{"id": "3", "name": "香煎三文鱼藜麦碗", "description": "地中海经典健康餐", "steps": [{"order": 1, "description": "藜麦淘洗后煮15分钟至熟透", "duration": 15}, {"order": 2, "description": "三文鱼用盐和黑胡椒腌制", "duration": 10}, {"order": 3, "description": "平底锅煎三文鱼至两面金黄", "duration": 8}, {"order": 4, "description": "牛油果切片，番茄对半切", "duration": 5}, {"order": 5, "description": "组装成碗，淋上柠檬汁", "duration": 2}], "tips": ["三文鱼不要煎过头，保持嫩滑", "可额外加入坚果增加口感"]}]',
        '[{"id": "7", "name": "特级初榨橄榄油", "quantity": "50ml", "included": true}, {"id": "8", "name": "海盐", "quantity": "适量", "included": true}, {"id": "9", "name": "柠檬", "quantity": "1个", "included": true}]',
        '{"calories": 580, "protein": 42, "carbs": 48, "fat": 28, "fiber": 12}',
        true, 8, 2, 'active'),
      -- 库存严重短缺/缺货的食材包
      (4, '秦岭山珍野菌宴', '精选秦岭深处野生菌菇，搭配农家土鸡，汤鲜味美，营养丰富', 'advanced', 168, 208, 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=800&auto=format&fit=crop',
        '["山珍", "野生菌", "滋补", "高端"]',
        '[{"id": "13", "name": "野生牛肝菌", "category": "菌菇", "quantity": 200, "unit": "g", "origin": "陕西秦岭"}, {"id": "14", "name": "农家土鸡", "category": "肉类", "quantity": 1, "unit": "只", "origin": "陕西商洛"}, {"id": "15", "name": "竹荪", "category": "菌菇", "quantity": 50, "unit": "g", "origin": "陕西安康"}, {"id": "16", "name": "枸杞", "category": "干货", "quantity": 30, "unit": "g", "origin": "宁夏中宁"}, {"id": "17", "name": "红枣", "category": "干货", "quantity": 100, "unit": "g", "origin": "陕西延安"}]',
        '[{"id": "4", "name": "野生菌土鸡汤", "description": "秦岭深处的美味，滋补养生", "steps": [{"order": 1, "description": "土鸡洗净切块，冷水焯水去血沫", "duration": 10}, {"order": 2, "description": "野生菌提前温水泡发30分钟", "duration": 30}, {"order": 3, "description": "砂锅加水，放入鸡块姜片大火煮开", "duration": 15}, {"order": 4, "description": "转小火炖煮40分钟后加入菌菇", "duration": 40}, {"order": 5, "description": "继续炖煮30分钟，加入枸杞红枣", "duration": 30}, {"order": 6, "description": "调味出锅，撒上葱花", "duration": 5}], "tips": ["菌菇要充分泡发，泡发水可入汤", "土鸡炖煮时间要够"]}]',
        '[{"id": "10", "name": "姜片", "quantity": "20g", "included": true}, {"id": "11", "name": "盐", "quantity": "适量", "included": true}, {"id": "12", "name": "料酒", "quantity": "30ml", "included": true}]',
        '{"calories": 520, "protein": 45, "carbs": 25, "fat": 28, "fiber": 8}',
        true, 0, 2, 'active'),
      (5, '洞庭湖鲜鱼宴', '精选洞庭湖新鲜活鱼，搭配当地特色莲藕，鲜美可口', 'intermediate', 118, 148, 'https://images.unsplash.com/photo-1534939561126-855b8675edd7?w=800&auto=format&fit=crop',
        '["湖鲜", "水产", "鲜美", "地方特色"]',
        '[{"id": "18", "name": "鲜活草鱼", "category": "水产", "quantity": 1, "unit": "条", "origin": "湖南洞庭湖"}, {"id": "19", "name": "洪湖莲藕", "category": "蔬菜", "quantity": 500, "unit": "g", "origin": "湖北洪湖"}, {"id": "20", "name": "嫩豆腐", "category": "豆制品", "quantity": 300, "unit": "g", "origin": "本地"}, {"id": "21", "name": "香菜", "category": "蔬菜", "quantity": 50, "unit": "g", "origin": "本地"}]',
        '[{"id": "5", "name": "洞庭湖鱼头豆腐汤", "description": "汤色奶白，鱼头鲜嫩，豆腐滑嫩", "steps": [{"order": 1, "description": "鱼头洗净，盐和料酒腌制15分钟", "duration": 15}, {"order": 2, "description": "莲藕去皮切片，豆腐切块备用", "duration": 10}, {"order": 3, "description": "热锅凉油，鱼头两面煎至金黄", "duration": 8}, {"order": 4, "description": "加开水大火煮15分钟至汤色奶白", "duration": 15}, {"order": 5, "description": "加莲藕片煮10分钟", "duration": 10}, {"order": 6, "description": "加入豆腐调味，撒香菜出锅", "duration": 5}], "tips": ["一定要用大火煮，汤才会奶白", "鱼头要煎透去腥增香"]}]',
        '[{"id": "14", "name": "盐", "quantity": "适量", "included": true}, {"id": "15", "name": "料酒", "quantity": "30ml", "included": true}, {"id": "16", "name": "白胡椒粉", "quantity": "适量", "included": true}, {"id": "17", "name": "姜片", "quantity": "15g", "included": true}]',
        '{"calories": 380, "protein": 38, "carbs": 18, "fat": 16, "fiber": 4}',
        false, 5, 2, 'active'),
      (6, '川西农家土菜组合', '正宗川西农家风味，郫县豆瓣、农家腊肉，地道巴蜀味道', 'basic', 98, 128, 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=800&auto=format&fit=crop',
        '["川菜", "农家", "腊肉", "地方特色"]',
        '[{"id": "22", "name": "川味腊肉", "category": "肉类", "quantity": 300, "unit": "g", "origin": "四川成都"}, {"id": "23", "name": "青蒜苗", "category": "蔬菜", "quantity": 200, "unit": "g", "origin": "本地"}, {"id": "24", "name": "土豆", "category": "蔬菜", "quantity": 400, "unit": "g", "origin": "四川凉山"}, {"id": "25", "name": "二荆条辣椒", "category": "蔬菜", "quantity": 100, "unit": "g", "origin": "四川"}]',
        '[{"id": "6", "name": "蒜苗炒腊肉", "description": "川味经典，腊味浓郁，香辣下饭", "steps": [{"order": 1, "description": "腊肉洗净，冷水下锅煮20分钟", "duration": 20}, {"order": 2, "description": "腊肉切薄片，蒜苗切段", "duration": 5}, {"order": 3, "description": "热锅少油，放入腊肉煸出油脂", "duration": 5}, {"order": 4, "description": "加入辣椒段炒香", "duration": 2}, {"order": 5, "description": "最后加入蒜苗，大火快炒出锅", "duration": 1}], "tips": ["腊肉本身有咸味，要少放盐", "蒜苗要大火快炒保持脆嫩"]}]',
        '[{"id": "18", "name": "郫县豆瓣酱", "quantity": "30g", "included": true}, {"id": "19", "name": "生抽", "quantity": "15ml", "included": true}, {"id": "20", "name": "食用油", "quantity": "30ml", "included": true}]',
        '{"calories": 580, "protein": 22, "carbs": 35, "fat": 38, "fiber": 6}',
        false, 100, 2, 'active'),
      (7, '长白山人参炖鸡套装', '精选长白山野山参搭配散养土鸡，补气养血，大补元气', 'advanced', 288, 368, 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=800&auto=format&fit=crop',
        '["滋补", "人参", "高端", "养生"]',
        '[{"id": "26", "name": "长白山野山参", "category": "药材", "quantity": 1, "unit": "支", "origin": "吉林长白山"}, {"id": "27", "name": "散养土鸡", "category": "肉类", "quantity": 1, "unit": "只", "origin": "吉林延边"}, {"id": "28", "name": "淮山", "category": "药材", "quantity": 200, "unit": "g", "origin": "河南"}, {"id": "29", "name": "干贝", "category": "水产", "quantity": 50, "unit": "g", "origin": "辽宁"}, {"id": "30", "name": "虫草花", "category": "菌菇", "quantity": 30, "unit": "g", "origin": "吉林"}]',
        '[{"id": "7", "name": "人参炖鸡汤", "description": "大补元气，滋补强身", "steps": [{"order": 1, "description": "土鸡洗净去内脏，保留整只", "duration": 10}, {"order": 2, "description": "人参、淮山、干贝提前泡发", "duration": 30}, {"order": 3, "description": "整鸡放入砂锅，加水没过", "duration": 5}, {"order": 4, "description": "加入所有药材大火烧开", "duration": 10}, {"order": 5, "description": "转小火慢炖2小时", "duration": 120}, {"order": 6, "description": "出锅前加盐调味", "duration": 2}], "tips": ["人参不宜久煮，可后放", "感冒发热时不宜食用"]}]',
        '[{"id": "21", "name": "姜片", "quantity": "20g", "included": true}, {"id": "22", "name": "盐", "quantity": "适量", "included": true}, {"id": "23", "name": "料酒", "quantity": "20ml", "included": true}]',
        '{"calories": 620, "protein": 52, "carbs": 28, "fat": 32, "fiber": 5}',
        true, 20, 2, 'active'),
      (8, '云贵高原野菜宴', '精选云南高原野生野菜，天然无污染，清香爽口', 'intermediate', 78, 98, 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&auto=format&fit=crop',
        '["野菜", "有机", "低脂", "健康"]',
        '[{"id": "31", "name": "苦菜", "category": "野菜", "quantity": 200, "unit": "g", "origin": "云南昆明"}, {"id": "32", "name": "蕨菜", "category": "野菜", "quantity": 200, "unit": "g", "origin": "云南大理"}, {"id": "33", "name": "折耳根", "category": "野菜", "quantity": 150, "unit": "g", "origin": "贵州"}, {"id": "34", "name": "火腿", "category": "肉类", "quantity": 100, "unit": "g", "origin": "云南宣威"}]',
        '[{"id": "8", "name": "凉拌野生野菜", "description": "清爽开胃，保留野菜原香", "steps": [{"order": 1, "description": "各种野菜洗净，焯水30秒", "duration": 5}, {"order": 2, "description": "捞出过凉水，沥干水分", "duration": 5}, {"order": 3, "description": "火腿切丝，小火煸香", "duration": 5}, {"order": 4, "description": "野菜加调料拌匀，撒上火腿丝", "duration": 3}], "tips": ["焯水时间不宜过长保持脆嫩", "折耳根有特殊香味可单独调味"]}]',
        '[{"id": "24", "name": "蒜泥", "quantity": "20g", "included": true}, {"id": "25", "name": "生抽", "quantity": "20ml", "included": true}, {"id": "26", "name": "香醋", "quantity": "15ml", "included": true}, {"id": "27", "name": "花椒油", "quantity": "10ml", "included": true}, {"id": "28", "name": "辣椒油", "quantity": "适量", "included": true}]',
        '{"calories": 220, "protein": 12, "carbs": 15, "fat": 12, "fiber": 8}',
        false, 60, 2, 'active'),
      (9, '海南热带风情套餐', '来自海南的新鲜椰子、文昌鸡，热带风情满满', 'intermediate', 138, 178, 'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=800&auto=format&fit=crop',
        '["海南", "热带", "椰子", "清新"]',
        '[{"id": "35", "name": "文昌鸡", "category": "肉类", "quantity": 1, "unit": "只", "origin": "海南文昌"}, {"id": "36", "name": "新鲜椰子", "category": "水果", "quantity": 2, "unit": "个", "origin": "海南"}, {"id": "37", "name": "珍珠马蹄", "category": "蔬菜", "quantity": 200, "unit": "g", "origin": "海南"}, {"id": "38", "name": "红枣", "category": "干货", "quantity": 50, "unit": "g", "origin": "新疆"}]',
        '[{"id": "9", "name": "椰子鸡火锅", "description": "清甜鲜美，椰香四溢，海南经典", "steps": [{"order": 1, "description": "文昌鸡洗净切块，椰子取椰汁椰肉", "duration": 15}, {"order": 2, "description": "马蹄去皮洗净", "duration": 10}, {"order": 3, "description": "椰汁倒入锅中，加椰肉红枣", "duration": 5}, {"order": 4, "description": "大火煮开，放入鸡肉", "duration": 10}, {"order": 5, "description": "撇去浮沫，小火煮20分钟", "duration": 20}, {"order": 6, "description": "加入马蹄，再煮5分钟", "duration": 5}], "tips": ["椰汁本身就是汤底，不用加水", "鸡肉要选嫩鸡"]}]',
        '[{"id": "29", "name": "沙姜", "quantity": "20g", "included": true}, {"id": "30", "name": "小青柠", "quantity": "4个", "included": true}, {"id": "31", "name": "生抽", "quantity": "30ml", "included": true}, {"id": "32", "name": "小米辣", "quantity": "适量", "included": true}]',
        '{"calories": 480, "protein": 38, "carbs": 25, "fat": 26, "fiber": 4}',
        false, 50, 2, 'active'),
      (10, '东北黑土地丰收宴', '来自东北黑土地的馈赠，优质大米、新鲜玉米', 'basic', 68, 88, 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=800&auto=format&fit=crop',
        '["东北", "有机", "杂粮", "家常"]',
        '[{"id": "39", "name": "五常大米", "category": "主食", "quantity": 1, "unit": "kg", "origin": "黑龙江五常"}, {"id": "40", "name": "甜玉米", "category": "蔬菜", "quantity": 4, "unit": "根", "origin": "吉林"}, {"id": "41", "name": "紫薯", "category": "蔬菜", "quantity": 500, "unit": "g", "origin": "辽宁"}, {"id": "42", "name": "红豆", "category": "干货", "quantity": 200, "unit": "g", "origin": "黑龙江"}]',
        '[{"id": "10", "name": "五谷丰登", "description": "蒸玉米紫薯，煮红豆饭，健康主食", "steps": [{"order": 1, "description": "红豆提前浸泡4小时", "duration": 240}, {"order": 2, "description": "大米和红豆混合正常煮饭", "duration": 30}, {"order": 3, "description": "玉米、紫薯洗净", "duration": 5}, {"order": 4, "description": "蒸锅上汽后蒸20分钟", "duration": 20}], "tips": ["红豆要充分泡发", "紫薯蒸时不要去皮"]}]',
        '[{"id": "33", "name": "白糖", "quantity": "适量", "included": true}]',
        '{"calories": 380, "protein": 12, "carbs": 78, "fat": 3, "fiber": 10}',
        false, 100, 2, 'active'),
      (11, '江南水乡河鲜宴', '精选江南水域新鲜河虾、螺蛳，鲜美可口', 'intermediate', 108, 138, 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=800&auto=format&fit=crop',
        '["河鲜", "江南", "时令", "鲜美"]',
        '[{"id": "43", "name": "活河虾", "category": "水产", "quantity": 500, "unit": "g", "origin": "江苏太湖"}, {"id": "44", "name": "螺蛳", "category": "水产", "quantity": 500, "unit": "g", "origin": "浙江"}, {"id": "45", "name": "茭白", "category": "蔬菜", "quantity": 300, "unit": "g", "origin": "江苏"}, {"id": "46", "name": "小葱", "category": "蔬菜", "quantity": 50, "unit": "g", "origin": "本地"}]',
        '[{"id": "11", "name": "油爆河虾", "description": "外壳酥脆，虾肉鲜嫩，江南名菜", "steps": [{"order": 1, "description": "河虾洗净沥干，剪去虾须", "duration": 10}, {"order": 2, "description": "热油至180度，倒入河虾", "duration": 2}, {"order": 3, "description": "快速翻炒至虾变红", "duration": 2}, {"order": 4, "description": "加入调料大火收汁", "duration": 3}, {"order": 5, "description": "撒葱花出锅", "duration": 1}], "tips": ["油温要高快速爆炒", "不要炒太久保持鲜嫩"]}]',
        '[{"id": "34", "name": "生抽", "quantity": "20ml", "included": true}, {"id": "35", "name": "料酒", "quantity": "15ml", "included": true}, {"id": "36", "name": "白糖", "quantity": "15g", "included": true}, {"id": "37", "name": "食用油", "quantity": "50ml", "included": true}]',
        '{"calories": 320, "protein": 35, "carbs": 12, "fat": 14, "fiber": 2}',
        true, 40, 2, 'active'),
      (12, '福建沿海海鲜盛宴', '精选福建沿海新鲜海鲜，鲍鱼、海参、扇贝，豪华盛宴', 'advanced', 358, 458, 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&auto=format&fit=crop',
        '["海鲜", "豪华", "宴请", "高端"]',
        '[{"id": "47", "name": "鲜鲍鱼", "category": "海鲜", "quantity": 6, "unit": "只", "origin": "福建宁德"}, {"id": "48", "name": "海参", "category": "海鲜", "quantity": 200, "unit": "g", "origin": "福建霞浦"}, {"id": "49", "name": "扇贝", "category": "海鲜", "quantity": 8, "unit": "只", "origin": "福建莆田"}, {"id": "50", "name": "花菇", "category": "菌菇", "quantity": 100, "unit": "g", "origin": "福建古田"}]',
        '[{"id": "12", "name": "佛跳墙", "description": "闽菜经典，汇聚多种珍贵食材", "steps": [{"order": 1, "description": "鲍鱼、海参提前泡发处理", "duration": 120}, {"order": 2, "description": "花菇泡发，扇贝洗净", "duration": 30}, {"order": 3, "description": "所有食材入砂锅加高汤", "duration": 10}, {"order": 4, "description": "小火慢炖3小时", "duration": 180}, {"order": 5, "description": "调味出锅", "duration": 5}], "tips": ["泡发要充分，食材要新鲜", "用高汤炖煮更鲜美"]}]',
        '[{"id": "38", "name": "高汤", "quantity": "1L", "included": true}, {"id": "39", "name": "绍兴酒", "quantity": "50ml", "included": true}, {"id": "40", "name": "蚝油", "quantity": "30ml", "included": true}, {"id": "41", "name": "盐", "quantity": "适量", "included": true}]',
        '{"calories": 450, "protein": 48, "carbs": 18, "fat": 20, "fiber": 3}',
        true, 15, 2, 'active')
    `);
    console.log('✓ 初始食材包数据插入成功');
    
    // 插入供应商
    await connection.execute(`
      INSERT IGNORE INTO suppliers (id, name, contact, phone, email, address, categories, rating, status) VALUES
      (1, '绿源农场', '王经理', '13800138001', 'green@example.com', '山东省寿光市', '["蔬菜", "水果"]', 4.8, 'active'),
      (2, '优质肉业', '李经理', '13800138002', 'meat@example.com', '河北省唐山市', '["肉类"]', 4.6, 'active')
    `);
    console.log('✓ 初始供应商数据插入成功');
    
    // 插入食材库存数据（合理分布：有些充足、有些紧张、有些缺货）
    await connection.execute(`
      INSERT IGNORE INTO ingredients (id, name, category, origin, stock_quantity, unit, min_stock, supplier_id, status) VALUES
      -- 库存充足的食材
      (1, '鸡胸肉', '肉类', '山东', 5000, 'g', 500, 2, 'active'),
      (4, '糙米', '主食', '东北', 10000, 'g', 1000, 1, 'active'),
      (5, '牛肉', '肉类', '澳洲', 8000, 'g', 300, 2, 'active'),
      (6, '鸡蛋', '蛋奶', '本地', 2000, '个', 100, 1, 'active'),
      (7, '红薯', '主食', '新疆', 6000, 'g', 500, 1, 'active'),
      (11, '藜麦', '主食', '秘鲁', 5000, 'g', 300, 1, 'active'),
      (16, '枸杞', '干货', '宁夏中宁', 3000, 'g', 100, 1, 'active'),
      (17, '红枣', '干货', '陕西延安', 4000, 'g', 200, 1, 'active'),
      -- 库存紧张的食材
      (2, '西兰花', '蔬菜', '云南', 250, 'g', 300, 1, 'active'),
      (3, '胡萝卜', '蔬菜', '山东', 320, 'g', 400, 1, 'active'),
      (8, '菠菜', '蔬菜', '山东', 150, 'g', 200, 1, 'active'),
      (9, '三文鱼', '海鲜', '挪威', 180, 'g', 200, 2, 'active'),
      (10, '牛油果', '水果', '墨西哥', 35, '个', 50, 1, 'active'),
      (12, '樱桃番茄', '蔬菜', '山东', 200, 'g', 250, 1, 'active'),
      (15, '竹荪', '菌菇', '陕西安康', 25, 'g', 30, 1, 'active'),
      -- 库存严重短缺/缺货的食材
      (13, '野生牛肝菌', '菌菇', '陕西秦岭', 0, 'g', 50, 1, 'active'),
      (14, '农家土鸡', '肉类', '陕西商洛', 2, '只', 10, 2, 'active')
    `);
    console.log('✓ 初始食材库存数据插入成功');
    
    // 插入食材包与食材关联数据（示例：健康减脂套餐的食材）
    await connection.execute(`
      INSERT IGNORE INTO package_ingredients (package_id, ingredient_id, quantity, unit) VALUES
      (1, 1, 500, 'g'),
      (1, 2, 300, 'g'),
      (1, 3, 200, 'g'),
      (1, 4, 500, 'g'),
      (2, 5, 600, 'g'),
      (2, 6, 12, '个'),
      (2, 7, 800, 'g'),
      (2, 8, 400, 'g'),
      (3, 9, 400, 'g'),
      (3, 10, 2, '个'),
      (3, 11, 300, 'g'),
      (3, 12, 300, 'g')
    `);
    console.log('✓ 食材包关联数据插入成功');
    
    await connection.end();
    
    console.log('\n========================================');
    console.log('数据库初始化完成！');
    console.log('========================================');
    console.log('\n测试账号：');
    console.log('  管理员: admin@example.com / admin123');
    console.log('  商家:   merchant@example.com / merchant123');
    console.log('  用户:   user@example.com / user123');
    console.log('\n========================================');
    
  } catch (error) {
    console.error('\n初始化失败:', error.message);
    if (connection) await connection.end();
    throw error;
  }
}

// 运行初始化
if (require.main === module) {
  initDatabase().catch(err => {
    console.error('\n初始化失败:', err.message);
    if (err.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('\n提示: MySQL 认证失败，请检查:');
      console.error('  1. 用户 food_user 是否已创建');
      console.error('  2. 密码是否正确');
      console.error('  3. 数据库 food_subscription 是否已存在');
      console.error('\n可以手动运行以下命令创建用户:');
      console.error('  sudo mysql -e "CREATE USER IF NOT EXISTS \'food_user\'@\'localhost\' IDENTIFIED BY \'food123456\'; GRANT ALL PRIVILEGES ON food_subscription.* TO \'food_user\'@\'localhost\'; FLUSH PRIVILEGES;"');
    }
    process.exit(1);
  });
}

module.exports = { initDatabase };
