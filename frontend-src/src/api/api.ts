// 统一 API 层 - 生产环境连接真实后端，开发环境使用 mock
import type { 
  User, DietProfile, FoodPackage, Order, Subscription, DeliveryAddress
} from '@/types';
import { useAuthStore } from '@/store';

// 演示订单数据（使用数据库中真实存在的三个食材包）
const demoOrders: Order[] = [
  {
    id: 'ORD202503080001',
    userId: '3',
    packageId: '1',
    packageName: '健康减脂套餐',
    packageImage: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop',
    quantity: 1,
    price: 89,
    totalAmount: 89,
    subscriptionType: 'weekly',
    status: 'pending_payment',
    deliveryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    deliveryTimeSlot: '09:00-12:00',
    address: {
      id: 'addr001',
      name: '张三',
      phone: '13700137000',
      province: '北京市',
      city: '北京市',
      district: '朝阳区',
      address: '建国路88号SOHO现代城1号楼101室',
      isDefault: true
    },
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'ORD202503070002',
    userId: '3',
    packageId: '2',
    packageName: '增肌能量套餐',
    packageImage: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=800&auto=format&fit=crop',
    quantity: 1,
    price: 129,
    totalAmount: 129,
    subscriptionType: 'monthly',
    status: 'preparing',
    deliveryDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    deliveryTimeSlot: '14:00-18:00',
    address: {
      id: 'addr002',
      name: '张三',
      phone: '13700137000',
      province: '北京市',
      city: '北京市',
      district: '海淀区',
      address: '中关村大街1号中关村广场购物中心B2层',
      isDefault: false
    },
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'ORD202503030003',
    userId: '3',
    packageId: '3',
    packageName: '地中海风味套餐',
    packageImage: 'https://images.unsplash.com/photo-1543339308-43e59d6b73a6?w=800&auto=format&fit=crop',
    quantity: 2,
    price: 159,
    totalAmount: 318,
    subscriptionType: 'weekly',
    status: 'delivered',
    deliveryDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    deliveryTimeSlot: '09:00-12:00',
    address: {
      id: 'addr003',
      name: '张三',
      phone: '13700137000',
      province: '北京市',
      city: '北京市',
      district: '西城区',
      address: '金融大街7号英蓝国际金融中心',
      isDefault: false
    },
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  }
];

// 数据库中的三个真实食材包（用于参考）
// ID 1: 健康减脂套餐 - https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop - ¥89
// ID 2: 增肌能量套餐 - https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=800&auto=format&fit=crop - ¥129
// ID 3: 地中海风味套餐 - https://images.unsplash.com/photo-1543339308-43e59d6b73a6?w=800&auto=format&fit=crop - ¥159

// 演示订阅数据 - 进行中、已暂停、已取消各一个
const demoSubscriptions: Subscription[] = [
  {
    id: 'SUB202503010001',
    userId: '3',
    packageId: '1',
    type: 'weekly',
    status: 'active',
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    nextDeliveryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    totalDeliveries: 4,
    completedDeliveries: 1,
    price: 89
  },
  {
    id: 'SUB202502150002',
    userId: '3',
    packageId: '2',
    type: 'monthly',
    status: 'paused',
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    nextDeliveryDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    totalDeliveries: 2,
    completedDeliveries: 2,
    price: 129
  },
  {
    id: 'SUB202501100003',
    userId: '3',
    packageId: '3',
    type: 'weekly',
    status: 'cancelled',
    startDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    nextDeliveryDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    totalDeliveries: 4,
    completedDeliveries: 4,
    price: 159
  }
];

// API 基础 URL
const API_BASE_URL = '/api';

// 通用请求函数
async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  console.log('API请求:', url, options);

  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  console.log('API响应状态:', response.status);

  if (!response.ok) {
    const errorText = await response.text();
    console.error('API错误响应:', errorText);
    let error;
    try {
      error = JSON.parse(errorText);
    } catch {
      error = { message: '请求失败' };
    }
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  const data = await response.json();
  console.log('API响应数据:', data);
  return data;
}

// 带认证的请求
async function fetchWithAuth<T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<T> {
  // 从 zustand store 获取 token
  const token = useAuthStore.getState().token;
  
  return fetchApi<T>(endpoint, {
    ...options,
    headers: {
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
}

// API 对象
const realApi = {
  // 认证
  auth: {
    login: async (credentials: { email: string; password: string }) => {
      return fetchApi<{ user: User; token: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });
    },
    
    register: async (data: { email: string; password: string; name: string; phone?: string; role?: 'user' | 'merchant' }) => {
      return fetchApi<{ user: User; token: string }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    
    getProfile: async () => {
      return fetchWithAuth<User>('/auth/profile');
    },
    
    updateProfile: async (data: Partial<User>) => {
      return fetchWithAuth<User>('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },
  },
  
  // 食材包
  foodPackages: {
    getAll: async () => {
      return fetchApi<FoodPackage[]>('/food-packages');
    },
    
    getById: async (id: string) => {
      return fetchApi<FoodPackage>(`/food-packages/${id}`);
    },
    
    getRecommended: async (profileId: string) => {
      return fetchApi<FoodPackage[]>(`/food-packages/recommended?profileId=${profileId}`);
    },
    
    getLimited: async () => {
      return fetchApi<FoodPackage[]>('/food-packages/limited');
    },
    
    create: async (data: Partial<FoodPackage>) => {
      return fetchWithAuth<FoodPackage>('/food-packages', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    
    update: async (id: string, data: Partial<FoodPackage>) => {
      return fetchWithAuth<FoodPackage>(`/food-packages/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },
  },
  
  // 饮食画像
  dietProfile: {
    get: async () => {
      return fetchWithAuth<DietProfile>('/diet-profile');
    },
    
    create: async (data: Partial<DietProfile>) => {
      return fetchWithAuth<DietProfile>('/diet-profile', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    
    update: async (data: Partial<DietProfile>) => {
      return fetchWithAuth<DietProfile>('/diet-profile', {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },
  },
  
  // 订单 - 使用假数据，不依赖后端
  orders: {
    getAll: async () => {
      console.log('返回演示订单数据:', demoOrders);
      return Promise.resolve(demoOrders);
    },
    
    getById: async (id: string) => {
      const order = demoOrders.find(o => o.id === id);
      return Promise.resolve(order || demoOrders[0]);
    },
    
    create: async (data: Partial<Order>) => {
      const newOrder = { ...demoOrders[0], ...data, id: 'ORD' + Date.now() } as Order;
      demoOrders.unshift(newOrder);
      return Promise.resolve(newOrder);
    },
    
    update: async (id: string, data: Partial<Order>) => {
      const index = demoOrders.findIndex(o => o.id === id);
      if (index >= 0) {
        demoOrders[index] = { ...demoOrders[index], ...data } as Order;
        return Promise.resolve(demoOrders[index]);
      }
      return Promise.resolve(demoOrders[0]);
    },
    
    pay: async (id: string, _paymentMethod: string = 'mock') => {
      const order = demoOrders.find(o => o.id === id);
      if (order) {
        order.status = 'paid';
      }
      return Promise.resolve({ 
        message: '支付成功', 
        transactionId: 'TRX' + Date.now(), 
        order: order || demoOrders[0] 
      });
    },
  },
  
  // 订阅 - 使用假数据，不依赖后端
  subscriptions: {
    getAll: async () => {
      console.log('返回演示订阅数据:', demoSubscriptions);
      return Promise.resolve(demoSubscriptions);
    },
    
    create: async (data: Partial<Subscription>) => {
      const newSub = { ...demoSubscriptions[0], ...data, id: 'SUB' + Date.now() } as Subscription;
      demoSubscriptions.unshift(newSub);
      return Promise.resolve(newSub);
    },
    
    cancel: async (id: string) => {
      const sub = demoSubscriptions.find(s => s.id === id);
      if (sub) {
        sub.status = 'cancelled';
      }
      return Promise.resolve();
    },
  },
  
  // 地址
  addresses: {
    getAll: async () => {
      return fetchWithAuth<DeliveryAddress[]>('/addresses');
    },
    
    create: async (data: Partial<DeliveryAddress>) => {
      return fetchWithAuth<DeliveryAddress>('/addresses', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    
    update: async (id: string, data: Partial<DeliveryAddress>) => {
      return fetchWithAuth<DeliveryAddress>(`/addresses/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },
    
    delete: async (id: string) => {
      return fetchWithAuth<void>(`/addresses/${id}`, {
        method: 'DELETE',
      });
    },
  },
  
  // 商家接口
  merchant: {
    // 获取商家的所有订单 - 使用假数据
    getOrders: async () => {
      console.log('返回商家演示订单数据:', demoOrders);
      return Promise.resolve(demoOrders);
    },
    
    // 获取商家库存数据
    getInventory: async () => {
      return fetchWithAuth<{
        id: string;
        name: string;
        image: string;
        category: string;
        stock: number;
        minStock: number;
        unit: string;
        price: number;
        status: string;
        isLow: boolean;
        isOut: boolean;
      }[]>('/food-packages/merchant/inventory');
    },
    
    // 获取库存预警
    getStockAlerts: async () => {
      return fetchWithAuth<{
        id: string;
        productId: string;
        productName: string;
        currentStock: number;
        minStock: number;
        alertType: 'low_stock' | 'out_of_stock';
        resolved: boolean;
      }[]>('/food-packages/merchant/stock-alerts');
    },
  },
  
  // 管理员接口
  admin: {
    // 获取所有用户
    getUsers: async () => {
      return fetchWithAuth<User[]>('/admin/users');
    },

    // 创建用户（管理员）
    createUser: async (data: { email: string; password: string; name: string; phone?: string; role?: string }) => {
      return fetchWithAuth<User>('/admin/users', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    // 更新用户信息（管理员）
    updateUser: async (id: number, data: { name?: string; phone?: string; role?: string }) => {
      return fetchWithAuth<User>(`/admin/users/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },

    // 删除用户
    deleteUser: async (id: number) => {
      return fetchWithAuth<void>(`/admin/users/${id}`, {
        method: 'DELETE',
      });
    },
    
    // 获取统计数据 - 使用假数据
    getStatistics: async () => {
      return Promise.resolve({
        users: { total: 3, today: 0 },
        orders: { 
          total: demoOrders.length, 
          totalAmount: demoOrders.reduce((sum, o) => sum + o.totalAmount, 0),
          today: 1,
          todayAmount: 89,
          byStatus: [
            { status: 'pending_payment', count: 1 },
            { status: 'preparing', count: 1 },
            { status: 'delivered', count: 1 }
          ]
        },
        packages: { total: 12, lowStock: 2 }
      });
    },
    
    // 获取所有订单（管理员）- 使用假数据
    getAllOrders: async () => {
      console.log('返回管理员演示订单数据:', demoOrders);
      return Promise.resolve(demoOrders);
    },
    
    // 更新订单状态 - 修改假数据
    updateOrderStatus: async (id: string, status: string) => {
      const order = demoOrders.find(o => o.id === id);
      if (order) {
        order.status = status as Order['status'];
      }
      return Promise.resolve();
    },
    
    // 获取所有订阅 - 使用假数据
    getAllSubscriptions: async () => {
      console.log('返回管理员演示订阅数据:', demoSubscriptions);
      return Promise.resolve(demoSubscriptions);
    },
    
    // 获取管理员库存数据
    getInventory: async () => {
      return fetchWithAuth<{
        packages: {
          id: string;
          name: string;
          image: string;
          category: string;
          stock: number;
          minStock: number;
          unit: string;
          price: number;
          status: string;
          isLow: boolean;
          isOut: boolean;
        }[];
        ingredients: {
          id: string;
          name: string;
          category: string;
          stock: number;
          minStock: number;
          unit: string;
          origin: string;
          supplier: string;
          isLow: boolean;
          isOut: boolean;
        }[];
        stats: {
          totalPackages: number;
          totalIngredients: number;
          totalValue: number;
          lowStockCount: number;
          outOfStockCount: number;
        };
      }>('/food-packages/admin/inventory');
    },
  },
};

export default realApi;
export const api = realApi;

// 为了保持兼容性，也导出为 mockApi
export const mockApi = realApi;
