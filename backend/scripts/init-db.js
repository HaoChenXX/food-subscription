/**
 * 数据库初始化脚本
 * 创建测试数据和默认数据
 */

const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DATA_DIR = path.join(__dirname, '..', 'data');

// 确保数据目录存在
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// 写入数据文件
function writeDataFile(filename, data) {
  const filepath = path.join(DATA_DIR, filename);
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2), 'utf8');
  console.log(`Created: ${filepath}`);
}

async function initDatabase() {
  console.log('========================================');
  console.log('开始初始化数据库...');
  console.log('========================================\n');

  // 1. 创建测试用户
  const users = [
    {
      id: '1',
      email: 'admin@example.com',
      password: await bcrypt.hash('admin123', 10),
      name: '管理员',
      phone: '13800138000',
      role: 'admin',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z'
    },
    {
      id: '2',
      email: 'merchant@example.com',
      password: await bcrypt.hash('merchant123', 10),
      name: '李供应商',
      phone: '13900139000',
      role: 'merchant',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=merchant',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z'
    },
    {
      id: '3',
      email: 'user@example.com',
      password: await bcrypt.hash('user123', 10),
      name: '张三',
      phone: '13700137000',
      role: 'user',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z'
    }
  ];
  writeDataFile('users.json', users);

  // 2. 创建食材包数据
  const foodPackages = [
    {
      id: '1',
      name: '健康减脂套餐',
      description: '低卡路里、高蛋白的健康食材组合，适合减脂期食用',
      level: 'basic',
      price: 89,
      originalPrice: 109,
      image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop',
      tags: ['减脂', '高蛋白', '低卡'],
      ingredients: [
        { id: '1', name: '鸡胸肉', category: '肉类', quantity: 500, unit: 'g', origin: '山东' },
        { id: '2', name: '西兰花', category: '蔬菜', quantity: 300, unit: 'g', origin: '云南' },
        { id: '3', name: '胡萝卜', category: '蔬菜', quantity: 200, unit: 'g', origin: '山东' },
        { id: '4', name: '糙米', category: '主食', quantity: 500, unit: 'g', origin: '东北' }
      ],
      recipes: [
        {
          id: '1',
          name: '香煎鸡胸肉配蔬菜',
          description: '低脂高蛋白的经典减脂餐',
          steps: [
            { order: 1, description: '鸡胸肉洗净切片，用盐和黑胡椒腌制15分钟', duration: 15 },
            { order: 2, description: '西兰花和胡萝卜焯水备用', duration: 5 },
            { order: 3, description: '平底锅少油煎鸡胸肉至两面金黄', duration: 8 },
            { order: 4, description: '搭配蔬菜装盘即可', duration: 2 }
          ],
          tips: ['鸡胸肉不要煎太久，避免口感柴', '可以搭配低脂沙拉酱']
        }
      ],
      seasonings: [
        { id: '1', name: '海盐', quantity: '适量', included: true },
        { id: '2', name: '黑胡椒', quantity: '适量', included: true },
        { id: '3', name: '橄榄油', quantity: '30ml', included: true }
      ],
      nutritionInfo: { calories: 450, protein: 35, carbs: 45, fat: 12, fiber: 8 },
      isLimited: false,
      createdAt: '2024-01-01T00:00:00.000Z'
    },
    {
      id: '2',
      name: '增肌能量套餐',
      description: '高蛋白、适量碳水的增肌食材组合',
      level: 'intermediate',
      price: 129,
      originalPrice: 159,
      image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=800&auto=format&fit=crop',
      tags: ['增肌', '高蛋白', '健身'],
      ingredients: [
        { id: '5', name: '牛肉', category: '肉类', quantity: 600, unit: 'g', origin: '澳洲' },
        { id: '6', name: '鸡蛋', category: '蛋奶', quantity: 12, unit: '个', origin: '本地' },
        { id: '7', name: '红薯', category: '主食', quantity: 800, unit: 'g', origin: '新疆' },
        { id: '8', name: '菠菜', category: '蔬菜', quantity: 400, unit: 'g', origin: '山东' }
      ],
      recipes: [
        {
          id: '2',
          name: '黑椒牛柳配烤红薯',
          description: '高蛋白增肌餐，搭配优质碳水',
          steps: [
            { order: 1, description: '牛肉切条，用黑胡椒酱腌制20分钟', duration: 20 },
            { order: 2, description: '红薯切块，烤箱200度烤30分钟', duration: 30 },
            { order: 3, description: '热锅快炒牛柳至变色', duration: 5 },
            { order: 4, description: '菠菜焯水后摆盘', duration: 3 }
          ],
          tips: ['牛肉逆纹切更嫩', '红薯烤后口感更佳']
        }
      ],
      seasonings: [
        { id: '4', name: '黑胡椒酱', quantity: '50g', included: true },
        { id: '5', name: '海盐', quantity: '适量', included: true },
        { id: '6', name: '橄榄油', quantity: '30ml', included: true }
      ],
      nutritionInfo: { calories: 680, protein: 55, carbs: 65, fat: 22, fiber: 10 },
      isLimited: false,
      createdAt: '2024-01-01T00:00:00.000Z'
    },
    {
      id: '3',
      name: '地中海风味套餐',
      description: '健康的地中海饮食风格，富含不饱和脂肪酸',
      level: 'advanced',
      price: 159,
      originalPrice: 199,
      image: 'https://images.unsplash.com/photo-1543339308-43e59d6b73a6?w=800&auto=format&fit=crop',
      tags: ['地中海', '健康', '高端'],
      ingredients: [
        { id: '9', name: '三文鱼', category: '海鲜', quantity: 400, unit: 'g', origin: '挪威' },
        { id: '10', name: '牛油果', category: '水果', quantity: 2, unit: '个', origin: '墨西哥' },
        { id: '11', name: '藜麦', category: '主食', quantity: 300, unit: 'g', origin: '秘鲁' },
        { id: '12', name: '樱桃番茄', category: '蔬菜', quantity: 300, unit: 'g', origin: '山东' }
      ],
      recipes: [
        {
          id: '3',
          name: '香煎三文鱼藜麦碗',
          description: '地中海经典健康餐',
          steps: [
            { order: 1, description: '藜麦淘洗后煮15分钟至熟透', duration: 15 },
            { order: 2, description: '三文鱼用盐和黑胡椒腌制', duration: 10 },
            { order: 3, description: '平底锅煎三文鱼至两面金黄', duration: 8 },
            { order: 4, description: '牛油果切片，番茄对半切', duration: 5 },
            { order: 5, description: '组装成碗，淋上柠檬汁', duration: 2 }
          ],
          tips: ['三文鱼不要煎过头，保持嫩滑', '可额外加入坚果增加口感']
        }
      ],
      seasonings: [
        { id: '7', name: '特级初榨橄榄油', quantity: '50ml', included: true },
        { id: '8', name: '海盐', quantity: '适量', included: true },
        { id: '9', name: '柠檬', quantity: '1个', included: true }
      ],
      nutritionInfo: { calories: 580, protein: 42, carbs: 48, fat: 28, fiber: 12 },
      isLimited: true,
      createdAt: '2024-01-01T00:00:00.000Z'
    }
  ];
  writeDataFile('food-packages.json', foodPackages);

  // 3. 创建供应商数据
  const suppliers = [
    {
      id: '1',
      name: '绿源农场',
      contact: '王经理',
      phone: '13800138001',
      email: 'green@example.com',
      address: '山东省寿光市',
      categories: ['蔬菜', '水果'],
      rating: 4.8,
      status: 'active',
      createdAt: '2024-01-01T00:00:00.000Z'
    },
    {
      id: '2',
      name: '优质肉业',
      contact: '李经理',
      phone: '13800138002',
      email: 'meat@example.com',
      address: '河北省唐山市',
      categories: ['肉类'],
      rating: 4.6,
      status: 'active',
      createdAt: '2024-01-01T00:00:00.000Z'
    }
  ];
  writeDataFile('suppliers.json', suppliers);

  // 4. 创建空数据文件
  writeDataFile('orders.json', []);
  writeDataFile('subscriptions.json', []);
  writeDataFile('diet-profiles.json', []);
  writeDataFile('addresses.json', []);
  writeDataFile('products.json', []);

  console.log('\n========================================');
  console.log('数据库初始化完成！');
  console.log('========================================');
  console.log('\n测试账号：');
  console.log('  管理员: admin@example.com / admin123');
  console.log('  商家:   merchant@example.com / merchant123');
  console.log('  用户:   user@example.com / user123');
  console.log('\n========================================');
}

// 运行初始化
initDatabase().catch(console.error);
