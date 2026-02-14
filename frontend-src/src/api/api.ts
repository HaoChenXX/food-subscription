// 统一 API 层 - 生产环境连接真实后端，开发环境使用 mock
import type { 
  User, DietProfile, FoodPackage, Order, Subscription, DeliveryAddress
} from '@/types';

// API 基础 URL
const API_BASE_URL = '/api';

// 通用请求函数
async function fetchApi<T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
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

// 带认证的请求
async function fetchWithAuth<T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('auth_token');
  
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
    
    register: async (data: { email: string; password: string; name: string }) => {
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
  
  // 订单
  orders: {
    getAll: async () => {
      return fetchWithAuth<Order[]>('/orders');
    },
    
    getById: async (id: string) => {
      return fetchWithAuth<Order>(`/orders/${id}`);
    },
    
    create: async (data: Partial<Order>) => {
      return fetchWithAuth<Order>('/orders', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    
    update: async (id: string, data: Partial<Order>) => {
      return fetchWithAuth<Order>(`/orders/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },
  },
  
  // 订阅
  subscriptions: {
    getAll: async () => {
      return fetchWithAuth<Subscription[]>('/subscriptions');
    },
    
    create: async (data: Partial<Subscription>) => {
      return fetchWithAuth<Subscription>('/subscriptions', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    
    cancel: async (id: string) => {
      return fetchWithAuth<void>(`/subscriptions/${id}/cancel`, {
        method: 'POST',
      });
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
};

export default realApi;
export const api = realApi;

// 为了保持兼容性，也导出为 mockApi
export const mockApi = realApi;
