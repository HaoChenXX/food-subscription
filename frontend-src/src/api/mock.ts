import type { 
  User, DietProfile, FoodPackage, Order, Subscription, 
  Product, Supplier, StockAlert, PurchaseOrder, Feedback,
  DashboardStats, InventoryStats, DeliveryAddress
} from '@/types';

// 判断是否为生产环境（部署后使用真实API）
const isProduction = typeof window !== 'undefined' && window.location.hostname !== 'localhost';

// API 基础 URL
const API_BASE_URL = '/api';

// 真实 API 请求函数
async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = localStorage.getItem('auth_token');
  
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...options.headers,
    },
    ...options,
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: '请求失败' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }
  
  return response.json();
}

// 模拟用户数据
const mockUsers: User[] = [
  {
    id: '1',
    email: 'user@example.com',
    name: '张三',
    phone: '13800138000',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1',
    role: 'user',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01'
  },
  {
    id: '2',
    email: 'merchant@example.com',
    name: '李供应商',
    phone: '13900139000',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=2',
    role: 'merchant',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01'
  },
  {
    id: '3',
    email: 'admin@example.com',
    name: '管理员',
    phone: '13700137000',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=3',
    role: 'admin',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01'
  }
];

// 模拟饮食画像
const mockDietProfiles: Record<string, DietProfile> = {
  '1': {
    id: '1',
    userId: '1',
    age: 30,
    gender: 'male',
    dietGoal: 'muscle_gain',
    allergies: ['花生'],
    avoidances: ['香菜'],
    cuisinePreferences: ['川菜', '粤菜'],
    spiceLevel: 'medium',
    tastePreference: ['咸鲜', '微辣'],
    cookingSkill: 'intermediate',
    availableAppliances: ['燃气灶', '电饭煲', '烤箱'],
    avgCookingTime: 30,
    householdSize: 3,
    mealFrequency: 3,
    consumptionRate: 'normal',
    updatedAt: '2024-01-15'
  }
};

// 模拟食材包数据
const mockFoodPackages: FoodPackage[] = [
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
    servingSize: 2,
    cookTime: 30,
    difficulty: 'easy',
    rating: 4.8,
    reviewCount: 256,
    soldCount: 1200,
    isLimited: false
  },
  {
    id: '2',
    name: '增肌力量套餐',
    description: '高蛋白、适量碳水的增肌食材组合',
    level: 'advanced',
    price: 129,
    originalPrice: 159,
    image: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=800&auto=format&fit=crop',
    tags: ['增肌', '高蛋白', '力量训练'],
    ingredients: [
      { id: '5', name: '牛肉', category: '肉类', quantity: 600, unit: 'g', origin: '澳洲' },
      { id: '6', name: '鸡蛋', category: '蛋奶', quantity: 12, unit: '个', origin: '本地' },
      { id: '7', name: '土豆', category: '蔬菜', quantity: 500, unit: 'g', origin: '内蒙古' },
      { id: '8', name: '菠菜', category: '蔬菜', quantity: 300, unit: 'g', origin: '山东' }
    ],
    recipes: [
      {
        id: '2',
        name: '黑椒牛柳配土豆泥',
        description: '经典增肌餐，蛋白质与碳水完美搭配',
        steps: [
          { order: 1, description: '牛肉切条，用料酒、生抽腌制20分钟', duration: 20 },
          { order: 2, description: '土豆蒸熟压成泥', duration: 20 },
          { order: 3, description: '大火快炒牛肉至变色', duration: 5 },
          { order: 4, description: '加入黑椒酱翻炒均匀', duration: 3 }
        ],
        tips: ['牛肉要逆纹切，口感更嫩', '土豆泥可以加少许牛奶更香滑']
      }
    ],
    seasonings: [
      { id: '4', name: '黑椒酱', quantity: '50g', included: true },
      { id: '5', name: '生抽', quantity: '30ml', included: true },
      { id: '6', name: '料酒', quantity: '30ml', included: true }
    ],
    nutritionInfo: { calories: 680, protein: 45, carbs: 65, fat: 22, fiber: 6 },
    servingSize: 2,
    cookTime: 45,
    difficulty: 'medium',
    rating: 4.9,
    reviewCount: 189,
    soldCount: 890,
    isLimited: false
  },
  {
    id: '3',
    name: '精品海鲜套餐',
    description: '新鲜海鲜食材，适合家庭聚餐或特殊场合',
    level: 'premium',
    price: 199,
    originalPrice: 249,
    image: 'https://images.unsplash.com/photo-1534939561126-855b8675edd7?w=800&auto=format&fit=crop',
    tags: ['海鲜', '精品', '家庭聚餐'],
    ingredients: [
      { id: '9', name: '大虾', category: '海鲜', quantity: 500, unit: 'g', origin: '青岛' },
      { id: '10', name: '扇贝', category: '海鲜', quantity: 300, unit: 'g', origin: '大连' },
      { id: '11', name: '芦笋', category: '蔬菜', quantity: 300, unit: 'g', origin: '云南' },
      { id: '12', name: '柠檬', category: '水果', quantity: 2, unit: '个', origin: '四川' }
    ],
    recipes: [
      {
        id: '3',
        name: '蒜蓉粉丝蒸扇贝',
        description: '鲜美海鲜，简单蒸制保留原汁原味',
        steps: [
          { order: 1, description: '扇贝清洗干净，粉丝泡软', duration: 15 },
          { order: 2, description: '制作蒜蓉酱：蒜末、生抽、蚝油混合', duration: 5 },
          { order: 3, description: '将粉丝铺在扇贝上，淋上蒜蓉酱', duration: 5 },
          { order: 4, description: '大火蒸8分钟即可', duration: 8 }
        ],
        tips: ['扇贝要新鲜，闻起来没有异味', '蒸的时间不要过长']
      }
    ],
    seasonings: [
      { id: '7', name: '蒜蓉', quantity: '50g', included: true },
      { id: '8', name: '蚝油', quantity: '30ml', included: true },
      { id: '9', name: '生抽', quantity: '30ml', included: true }
    ],
    nutritionInfo: { calories: 380, protein: 42, carbs: 25, fat: 10, fiber: 4 },
    servingSize: 3,
    cookTime: 35,
    difficulty: 'medium',
    rating: 4.7,
    reviewCount: 128,
    soldCount: 560,
    isLimited: true,
    limitedTime: '2024-02-10'
  },
  {
    id: '4',
    name: '控糖养生套餐',
    description: '低GI食材组合，适合血糖管理人群',
    level: 'basic',
    price: 99,
    originalPrice: 119,
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&auto=format&fit=crop',
    tags: ['控糖', '低GI', '养生'],
    ingredients: [
      { id: '13', name: '三文鱼', category: '海鲜', quantity: 400, unit: 'g', origin: '挪威' },
      { id: '14', name: '藜麦', category: '主食', quantity: 300, unit: 'g', origin: '南美' },
      { id: '15', name: '羽衣甘蓝', category: '蔬菜', quantity: 200, unit: 'g', origin: '云南' },
      { id: '16', name: '牛油果', category: '水果', quantity: 2, unit: '个', origin: '墨西哥' }
    ],
    recipes: [
      {
        id: '4',
        name: '香煎三文鱼配藜麦沙拉',
        description: '富含Omega-3的健康餐',
        steps: [
          { order: 1, description: '藜麦煮熟晾凉', duration: 20 },
          { order: 2, description: '三文鱼用盐和黑胡椒腌制', duration: 10 },
          { order: 3, description: '平底锅煎三文鱼至两面金黄', duration: 8 },
          { order: 4, description: '搭配蔬菜装盘', duration: 5 }
        ],
        tips: ['三文鱼煎的时候不要频繁翻动', '藜麦可以提前煮好冷藏']
      }
    ],
    seasonings: [
      { id: '10', name: '海盐', quantity: '适量', included: true },
      { id: '11', name: '黑胡椒', quantity: '适量', included: true },
      { id: '12', name: '柠檬汁', quantity: '适量', included: true }
    ],
    nutritionInfo: { calories: 520, protein: 32, carbs: 35, fat: 28, fiber: 10 },
    servingSize: 2,
    cookTime: 40,
    difficulty: 'easy',
    rating: 4.6,
    reviewCount: 98,
    soldCount: 420,
    isLimited: false
  },
  {
    id: '5',
    name: '快手新手套餐',
    description: '简单易做的食材组合，适合烹饪新手',
    level: 'basic',
    price: 69,
    originalPrice: 89,
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&auto=format&fit=crop',
    tags: ['新手', '快手', '简单'],
    ingredients: [
      { id: '17', name: '猪里脊', category: '肉类', quantity: 400, unit: 'g', origin: '本地' },
      { id: '18', name: '青椒', category: '蔬菜', quantity: 300, unit: 'g', origin: '山东' },
      { id: '19', name: '土豆', category: '蔬菜', quantity: 400, unit: 'g', origin: '内蒙古' },
      { id: '20', name: '大米', category: '主食', quantity: 500, unit: 'g', origin: '东北' }
    ],
    recipes: [
      {
        id: '5',
        name: '青椒肉丝',
        description: '经典家常菜，简单易学',
        steps: [
          { order: 1, description: '猪肉切丝，用生抽、料酒腌制10分钟', duration: 10 },
          { order: 2, description: '青椒切丝备用', duration: 5 },
          { order: 3, description: '热锅凉油炒肉丝至变色', duration: 5 },
          { order: 4, description: '加入青椒丝翻炒均匀', duration: 3 }
        ],
        tips: ['肉丝要顺纹切', '大火快炒保持青椒脆嫩']
      }
    ],
    seasonings: [
      { id: '13', name: '生抽', quantity: '30ml', included: true },
      { id: '14', name: '料酒', quantity: '30ml', included: true },
      { id: '15', name: '淀粉', quantity: '20g', included: true }
    ],
    nutritionInfo: { calories: 580, protein: 28, carbs: 75, fat: 18, fiber: 5 },
    servingSize: 3,
    cookTime: 25,
    difficulty: 'easy',
    rating: 4.5,
    reviewCount: 312,
    soldCount: 1500,
    isLimited: false
  },
  {
    id: '6',
    name: '限时特惠套餐',
    description: '精选时令食材，限时优惠价格',
    level: 'basic',
    price: 59,
    originalPrice: 99,
    image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&auto=format&fit=crop',
    tags: ['限时', '特惠', '时令'],
    ingredients: [
      { id: '21', name: '时令蔬菜', category: '蔬菜', quantity: 800, unit: 'g', origin: '本地' },
      { id: '22', name: '豆腐', category: '豆制品', quantity: 400, unit: 'g', origin: '本地' },
      { id: '23', name: '鸡蛋', category: '蛋奶', quantity: 8, unit: '个', origin: '本地' },
      { id: '24', name: '面条', category: '主食', quantity: 500, unit: 'g', origin: '山东' }
    ],
    recipes: [
      {
        id: '6',
        name: '家常豆腐煲',
        description: '温暖家常味',
        steps: [
          { order: 1, description: '豆腐切块煎至两面金黄', duration: 10 },
          { order: 2, description: '蔬菜切块备用', duration: 5 },
          { order: 3, description: '砂锅炒香葱姜蒜', duration: 3 },
          { order: 4, description: '加入豆腐和蔬菜炖煮15分钟', duration: 15 }
        ],
        tips: ['豆腐煎一下更香', '可以根据喜好调整蔬菜种类']
      }
    ],
    seasonings: [
      { id: '16', name: '生抽', quantity: '30ml', included: true },
      { id: '17', name: '蚝油', quantity: '20ml', included: true },
      { id: '18', name: '豆瓣酱', quantity: '30g', included: true }
    ],
    nutritionInfo: { calories: 480, protein: 22, carbs: 58, fat: 16, fiber: 8 },
    servingSize: 3,
    cookTime: 35,
    difficulty: 'easy',
    rating: 4.4,
    reviewCount: 156,
    soldCount: 780,
    isLimited: true,
    limitedTime: '2024-02-05'
  }
];

// 模拟订单数据
const mockOrders: Order[] = [
  {
    id: 'ORD001',
    userId: '1',
    packageId: '1',
    packageName: '健康减脂套餐',
    packageImage: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop',
    quantity: 1,
    price: 89,
    totalAmount: 89,
    subscriptionType: 'weekly',
    status: 'delivered',
    deliveryDate: '2024-01-20',
    deliveryTimeSlot: '09:00-12:00',
    address: {
      id: '1',
      name: '张三',
      phone: '13800138000',
      province: '北京市',
      city: '北京市',
      district: '朝阳区',
      address: '建国路88号院1号楼',
      isDefault: true
    },
    createdAt: '2024-01-15',
    updatedAt: '2024-01-20'
  },
  {
    id: 'ORD002',
    userId: '1',
    packageId: '2',
    packageName: '增肌力量套餐',
    packageImage: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=800&auto=format&fit=crop',
    quantity: 2,
    price: 129,
    totalAmount: 258,
    subscriptionType: 'monthly',
    status: 'shipped',
    deliveryDate: '2024-01-25',
    deliveryTimeSlot: '14:00-18:00',
    address: {
      id: '1',
      name: '张三',
      phone: '13800138000',
      province: '北京市',
      city: '北京市',
      district: '朝阳区',
      address: '建国路88号院1号楼',
      isDefault: true
    },
    createdAt: '2024-01-18',
    updatedAt: '2024-01-22'
  },
  {
    id: 'ORD003',
    userId: '1',
    packageId: '3',
    packageName: '精品海鲜套餐',
    packageImage: 'https://images.unsplash.com/photo-1534939561126-855b8675edd7?w=800&auto=format&fit=crop',
    quantity: 1,
    price: 199,
    totalAmount: 199,
    subscriptionType: 'weekly',
    status: 'preparing',
    deliveryDate: '2024-01-28',
    deliveryTimeSlot: '18:00-21:00',
    address: {
      id: '1',
      name: '张三',
      phone: '13800138000',
      province: '北京市',
      city: '北京市',
      district: '朝阳区',
      address: '建国路88号院1号楼',
      isDefault: true
    },
    createdAt: '2024-01-23',
    updatedAt: '2024-01-23'
  }
];

// 模拟订阅数据
const mockSubscriptions: Subscription[] = [
  {
    id: 'SUB001',
    userId: '1',
    packageId: '1',
    type: 'monthly',
    status: 'active',
    startDate: '2024-01-01',
    nextDeliveryDate: '2024-02-01',
    totalDeliveries: 4,
    completedDeliveries: 1,
    price: 89
  }
];

// 模拟商品数据
const mockProducts: Product[] = [
  {
    id: '1',
    name: '鸡胸肉',
    category: '肉类',
    subcategory: '禽肉',
    description: '优质鸡胸肉，高蛋白低脂',
    image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=400&auto=format&fit=crop',
    price: 25,
    unit: '500g',
    stock: 500,
    minStock: 100,
    origin: '山东',
    shelfLife: 7,
    supplierId: '1',
    supplierName: '山东禽肉供应商',
    status: 'active',
    createdAt: '2024-01-01'
  },
  {
    id: '2',
    name: '西兰花',
    category: '蔬菜',
    subcategory: '叶菜',
    description: '新鲜西兰花，富含维生素',
    image: 'https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?w=400&auto=format&fit=crop',
    price: 12,
    unit: '300g',
    stock: 80,
    minStock: 100,
    origin: '云南',
    shelfLife: 5,
    supplierId: '2',
    supplierName: '云南蔬菜基地',
    status: 'active',
    createdAt: '2024-01-01'
  },
  {
    id: '3',
    name: '牛肉',
    category: '肉类',
    subcategory: '牛羊肉',
    description: '进口优质牛肉',
    image: 'https://images.unsplash.com/photo-1603048719539-9ecb4aa395e3?w=400&auto=format&fit=crop',
    price: 68,
    unit: '500g',
    stock: 200,
    minStock: 50,
    origin: '澳洲',
    shelfLife: 10,
    supplierId: '3',
    supplierName: '澳洲牛肉进口商',
    status: 'active',
    createdAt: '2024-01-01'
  },
  {
    id: '4',
    name: '大虾',
    category: '海鲜',
    subcategory: '虾类',
    description: '新鲜海捕大虾',
    image: 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=400&auto=format&fit=crop',
    price: 58,
    unit: '500g',
    stock: 30,
    minStock: 50,
    origin: '青岛',
    shelfLife: 3,
    supplierId: '4',
    supplierName: '青岛海鲜供应商',
    status: 'active',
    createdAt: '2024-01-01'
  }
];

// 模拟供应商数据
const mockSuppliers: Supplier[] = [
  {
    id: '1',
    name: '山东禽肉供应商',
    contact: '王经理',
    phone: '13800138001',
    email: 'wang@example.com',
    address: '山东省济南市',
    products: ['1'],
    rating: 4.8,
    status: 'active'
  },
  {
    id: '2',
    name: '云南蔬菜基地',
    contact: '李经理',
    phone: '13800138002',
    email: 'li@example.com',
    address: '云南省昆明市',
    products: ['2'],
    rating: 4.6,
    status: 'active'
  }
];

// 模拟库存预警
const mockStockAlerts: StockAlert[] = [
  {
    id: '1',
    productId: '2',
    productName: '西兰花',
    currentStock: 80,
    minStock: 100,
    alertType: 'low_stock',
    createdAt: '2024-01-23',
    resolved: false
  },
  {
    id: '2',
    productId: '4',
    productName: '大虾',
    currentStock: 30,
    minStock: 50,
    alertType: 'low_stock',
    createdAt: '2024-01-22',
    resolved: false
  }
];

// 模拟采购订单
const mockPurchaseOrders: PurchaseOrder[] = [
  {
    id: 'PO001',
    supplierId: '1',
    supplierName: '山东禽肉供应商',
    items: [
      { productId: '1', productName: '鸡胸肉', quantity: 100, unit: '500g', price: 20 }
    ],
    totalAmount: 2000,
    status: 'confirmed',
    createdAt: '2024-01-20',
    expectedDate: '2024-01-25'
  }
];

// 模拟反馈数据
const mockFeedbacks: Feedback[] = [
  {
    id: '1',
    userId: '1',
    userName: '张三',
    orderId: 'ORD001',
    rating: 5,
    comment: '食材很新鲜，包装也很好，会继续订购！',
    tags: ['新鲜', '包装好'],
    createdAt: '2024-01-21'
  }
];

// 模拟看板数据
const mockDashboardStats: DashboardStats = {
  totalUsers: 1256,
  newUsersToday: 23,
  totalOrders: 3456,
  ordersToday: 45,
  totalRevenue: 256789,
  revenueToday: 5678,
  lowStockCount: 5,
  pendingOrders: 12
};

const mockInventoryStats: InventoryStats = {
  totalProducts: 156,
  totalValue: 125678,
  turnoverRate: 3.2,
  categoryDistribution: [
    { category: '肉类', count: 25, value: 45000 },
    { category: '蔬菜', count: 45, value: 28000 },
    { category: '海鲜', count: 15, value: 32000 },
    { category: '主食', count: 20, value: 12000 },
    { category: '调味品', count: 51, value: 8678 }
  ],
  stockTrend: [
    { date: '2024-01-15', in: 500, out: 300 },
    { date: '2024-01-16', in: 400, out: 350 },
    { date: '2024-01-17', in: 600, out: 400 },
    { date: '2024-01-18', in: 450, out: 380 },
    { date: '2024-01-19', in: 550, out: 420 },
    { date: '2024-01-20', in: 500, out: 450 },
    { date: '2024-01-21', in: 480, out: 400 }
  ]
};

// 模拟地址数据
const mockAddresses: DeliveryAddress[] = [
  {
    id: '1',
    name: '张三',
    phone: '13800138000',
    province: '北京市',
    city: '北京市',
    district: '朝阳区',
    address: '建国路88号院1号楼',
    isDefault: true
  }
];

// Mock API 实现（生产环境调用真实后端）
export const mockApi = {
  // 认证相关
  auth: {
    login: async (email: string, password: string) => {
      if (isProduction) {
        return fetchApi<{ user: User; token: string }>('/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        });
      }
      await delay(500);
      const user = mockUsers.find(u => u.email === email);
      if (!user) throw new Error('用户不存在');
      return { user, token: 'mock_token_' + user.id };
    },
    register: async (data: { email: string; password: string; name: string }) => {
      if (isProduction) {
        return fetchApi<{ user: User; token: string }>('/auth/register', {
          method: 'POST',
          body: JSON.stringify(data),
        });
      }
      await delay(500);
      const newUser: User = {
        id: String(mockUsers.length + 1),
        email: data.email,
        name: data.name,
        role: 'user',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      mockUsers.push(newUser);
      return { user: newUser, token: 'mock_token_' + newUser.id };
    },
    getProfile: async (_userId: string) => {
      if (isProduction) {
        return fetchApi<User>('/auth/profile');
      }
      await delay(300);
      return mockUsers.find(u => u.id === _userId);
    }
  },

  // 饮食画像相关
  dietProfile: {
    get: async (userId: string) => {
      await delay(300);
      return mockDietProfiles[userId] || null;
    },
    create: async (userId: string, data: Partial<DietProfile>) => {
      await delay(500);
      const profile: DietProfile = {
        id: String(Object.keys(mockDietProfiles).length + 1),
        userId,
        age: data.age || 25,
        gender: data.gender || 'male',
        dietGoal: data.dietGoal || 'balanced',
        allergies: data.allergies || [],
        avoidances: data.avoidances || [],
        cuisinePreferences: data.cuisinePreferences || [],
        spiceLevel: data.spiceLevel || 'mild',
        tastePreference: data.tastePreference || [],
        cookingSkill: data.cookingSkill || 'beginner',
        availableAppliances: data.availableAppliances || [],
        avgCookingTime: data.avgCookingTime || 30,
        householdSize: data.householdSize || 2,
        mealFrequency: data.mealFrequency || 3,
        consumptionRate: data.consumptionRate || 'normal',
        updatedAt: new Date().toISOString()
      };
      mockDietProfiles[userId] = profile;
      return profile;
    },
    update: async (userId: string, data: Partial<DietProfile>) => {
      await delay(500);
      const profile = mockDietProfiles[userId];
      if (!profile) throw new Error('画像不存在');
      mockDietProfiles[userId] = { ...profile, ...data, updatedAt: new Date().toISOString() };
      return mockDietProfiles[userId];
    }
  },

  // 食材包相关
  foodPackages: {
    getAll: async (filters?: { level?: string; tags?: string[] }) => {
      await delay(300);
      let result = [...mockFoodPackages];
      if (filters?.level) {
        result = result.filter(p => p.level === filters.level);
      }
      if (filters?.tags?.length) {
        result = result.filter(p => filters.tags!.some(tag => p.tags.includes(tag)));
      }
      return result;
    },
    getById: async (id: string) => {
      await delay(300);
      return mockFoodPackages.find(p => p.id === id);
    },
    getRecommended: async (userId: string) => {
      await delay(500);
      const profile = mockDietProfiles[userId];
      if (!profile) return mockFoodPackages.slice(0, 3);
      
      // 根据用户画像推荐
      return mockFoodPackages.filter(pkg => {
        if (profile.dietGoal === 'weight_loss' && pkg.tags.includes('减脂')) return true;
        if (profile.dietGoal === 'muscle_gain' && pkg.tags.includes('增肌')) return true;
        if (profile.dietGoal === 'blood_sugar_control' && pkg.tags.includes('控糖')) return true;
        if (profile.cookingSkill === 'beginner' && pkg.tags.includes('新手')) return true;
        return Math.random() > 0.5;
      }).slice(0, 4);
    },
    getLimited: async () => {
      await delay(300);
      return mockFoodPackages.filter(p => p.isLimited);
    }
  },

  // 订单相关
  orders: {
    getAll: async (userId: string) => {
      await delay(300);
      return mockOrders.filter(o => o.userId === userId);
    },
    getById: async (id: string) => {
      await delay(300);
      return mockOrders.find(o => o.id === id);
    },
    create: async (data: Partial<Order>) => {
      await delay(500);
      const newOrder: Order = {
        id: 'ORD' + String(mockOrders.length + 1).padStart(3, '0'),
        userId: data.userId!,
        packageId: data.packageId!,
        packageName: data.packageName!,
        packageImage: data.packageImage!,
        quantity: data.quantity || 1,
        price: data.price!,
        totalAmount: data.totalAmount!,
        subscriptionType: data.subscriptionType || 'weekly',
        status: 'pending_payment',
        deliveryDate: data.deliveryDate!,
        deliveryTimeSlot: data.deliveryTimeSlot!,
        address: data.address!,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      mockOrders.push(newOrder);
      return newOrder;
    },
    updateStatus: async (id: string, status: Order['status']) => {
      await delay(300);
      const order = mockOrders.find(o => o.id === id);
      if (!order) throw new Error('订单不存在');
      order.status = status;
      order.updatedAt = new Date().toISOString();
      return order;
    }
  },

  // 订阅相关
  subscriptions: {
    getAll: async (userId: string) => {
      await delay(300);
      return mockSubscriptions.filter(s => s.userId === userId);
    },
    create: async (data: Partial<Subscription>) => {
      await delay(500);
      const newSub: Subscription = {
        id: 'SUB' + String(mockSubscriptions.length + 1).padStart(3, '0'),
        userId: data.userId!,
        packageId: data.packageId!,
        type: data.type || 'weekly',
        status: 'active',
        startDate: new Date().toISOString(),
        nextDeliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        totalDeliveries: 0,
        completedDeliveries: 0,
        price: data.price!
      };
      mockSubscriptions.push(newSub);
      return newSub;
    },
    updateStatus: async (id: string, status: Subscription['status']) => {
      await delay(300);
      const sub = mockSubscriptions.find(s => s.id === id);
      if (!sub) throw new Error('订阅不存在');
      sub.status = status;
      return sub;
    }
  },

  // 地址相关
  addresses: {
    getAll: async (_userId: string) => {
      await delay(300);
      return mockAddresses;
    },
    create: async (data: Partial<DeliveryAddress>) => {
      await delay(300);
      const newAddress: DeliveryAddress = {
        id: String(mockAddresses.length + 1),
        name: data.name!,
        phone: data.phone!,
        province: data.province!,
        city: data.city!,
        district: data.district!,
        address: data.address!,
        isDefault: data.isDefault || false
      };
      mockAddresses.push(newAddress);
      return newAddress;
    }
  },

  // 商品相关（商家端）
  products: {
    getAll: async () => {
      await delay(300);
      return mockProducts;
    },
    getById: async (id: string) => {
      await delay(300);
      return mockProducts.find(p => p.id === id);
    },
    create: async (data: Partial<Product>) => {
      await delay(500);
      const newProduct: Product = {
        id: String(mockProducts.length + 1),
        name: data.name!,
        category: data.category!,
        subcategory: data.subcategory!,
        description: data.description!,
        image: data.image!,
        price: data.price!,
        unit: data.unit!,
        stock: data.stock || 0,
        minStock: data.minStock || 10,
        origin: data.origin,
        shelfLife: data.shelfLife,
        supplierId: data.supplierId!,
        supplierName: data.supplierName!,
        status: 'active',
        createdAt: new Date().toISOString()
      };
      mockProducts.push(newProduct);
      return newProduct;
    },
    update: async (id: string, data: Partial<Product>) => {
      await delay(300);
      const index = mockProducts.findIndex(p => p.id === id);
      if (index === -1) throw new Error('商品不存在');
      mockProducts[index] = { ...mockProducts[index], ...data };
      return mockProducts[index];
    },
    updateStock: async (id: string, stock: number) => {
      await delay(300);
      const product = mockProducts.find(p => p.id === id);
      if (!product) throw new Error('商品不存在');
      product.stock = stock;
      return product;
    }
  },

  // 供应商相关
  suppliers: {
    getAll: async () => {
      await delay(300);
      return mockSuppliers;
    },
    getById: async (id: string) => {
      await delay(300);
      return mockSuppliers.find(s => s.id === id);
    }
  },

  // 库存预警相关
  stockAlerts: {
    getAll: async () => {
      await delay(300);
      return mockStockAlerts;
    },
    resolve: async (id: string) => {
      await delay(300);
      const alert = mockStockAlerts.find(a => a.id === id);
      if (!alert) throw new Error('预警不存在');
      alert.resolved = true;
      return alert;
    }
  },

  // 采购订单相关
  purchaseOrders: {
    getAll: async () => {
      await delay(300);
      return mockPurchaseOrders;
    },
    create: async (data: Partial<PurchaseOrder>) => {
      await delay(500);
      const newPO: PurchaseOrder = {
        id: 'PO' + String(mockPurchaseOrders.length + 1).padStart(3, '0'),
        supplierId: data.supplierId!,
        supplierName: data.supplierName!,
        items: data.items!,
        totalAmount: data.totalAmount!,
        status: 'pending',
        createdAt: new Date().toISOString(),
        expectedDate: data.expectedDate!
      };
      mockPurchaseOrders.push(newPO);
      return newPO;
    },
    updateStatus: async (id: string, status: PurchaseOrder['status']) => {
      await delay(300);
      const po = mockPurchaseOrders.find(p => p.id === id);
      if (!po) throw new Error('采购订单不存在');
      po.status = status;
      return po;
    }
  },

  // 反馈相关
  feedbacks: {
    getAll: async () => {
      await delay(300);
      return mockFeedbacks;
    },
    create: async (data: Partial<Feedback>) => {
      await delay(500);
      const newFeedback: Feedback = {
        id: String(mockFeedbacks.length + 1),
        userId: data.userId!,
        userName: data.userName!,
        orderId: data.orderId!,
        rating: data.rating!,
        comment: data.comment!,
        tags: data.tags || [],
        createdAt: new Date().toISOString()
      };
      mockFeedbacks.push(newFeedback);
      return newFeedback;
    }
  },

  // 看板数据
  dashboard: {
    getStats: async () => {
      await delay(300);
      return mockDashboardStats;
    },
    getInventoryStats: async () => {
      await delay(300);
      return mockInventoryStats;
    }
  }
};

// 辅助函数
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export default mockApi;
