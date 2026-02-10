// 用户相关类型
export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  avatar?: string;
  role: 'user' | 'merchant' | 'admin';
  createdAt: string;
  updatedAt: string;
}

// 饮食画像类型
export interface DietProfile {
  id: string;
  userId: string;
  // 基础属性
  age: number;
  gender: 'male' | 'female' | 'other';
  dietGoal: 'weight_loss' | 'muscle_gain' | 'blood_sugar_control' | 'balanced' | 'other';
  allergies: string[];
  avoidances: string[];
  // 口味偏好
  cuisinePreferences: string[];
  spiceLevel: 'none' | 'mild' | 'medium' | 'hot' | 'extreme';
  tastePreference: string[];
  // 烹饪能力
  cookingSkill: 'beginner' | 'intermediate' | 'advanced';
  availableAppliances: string[];
  avgCookingTime: number;
  // 用餐习惯
  householdSize: number;
  mealFrequency: number;
  consumptionRate: 'slow' | 'normal' | 'fast';
  updatedAt: string;
}

// 食材包类型
export interface FoodPackage {
  id: string;
  name: string;
  description: string;
  level: 'basic' | 'advanced' | 'premium';
  price: number;
  originalPrice: number;
  image: string;
  tags: string[];
  ingredients: PackageIngredient[];
  recipes: Recipe[];
  seasonings: Seasoning[];
  nutritionInfo: NutritionInfo;
  servingSize: number;
  cookTime: number;
  difficulty: 'easy' | 'medium' | 'hard';
  rating: number;
  reviewCount: number;
  soldCount: number;
  isLimited: boolean;
  limitedTime?: string;
}

export interface PackageIngredient {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  origin?: string;
  image?: string;
}

export interface Recipe {
  id: string;
  name: string;
  description: string;
  steps: RecipeStep[];
  videoUrl?: string;
  tips: string[];
}

export interface RecipeStep {
  order: number;
  description: string;
  duration?: number;
  image?: string;
}

export interface Seasoning {
  id: string;
  name: string;
  quantity: string;
  included: boolean;
}

export interface NutritionInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

// 订单类型
export interface Order {
  id: string;
  userId: string;
  packageId: string;
  packageName: string;
  packageImage: string;
  quantity: number;
  price: number;
  totalAmount: number;
  subscriptionType: 'weekly' | 'monthly' | 'quarterly';
  status: OrderStatus;
  deliveryDate: string;
  deliveryTimeSlot: string;
  address: DeliveryAddress;
  createdAt: string;
  updatedAt: string;
}

export type OrderStatus = 
  | 'pending_payment'
  | 'paid'
  | 'preparing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export interface DeliveryAddress {
  id: string;
  name: string;
  phone: string;
  province: string;
  city: string;
  district: string;
  address: string;
  isDefault: boolean;
}

// 订阅类型
export interface Subscription {
  id: string;
  userId: string;
  packageId: string;
  type: 'weekly' | 'monthly' | 'quarterly';
  status: 'active' | 'paused' | 'cancelled';
  startDate: string;
  nextDeliveryDate: string;
  totalDeliveries: number;
  completedDeliveries: number;
  price: number;
}

// 商品/库存类型
export interface Product {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  description: string;
  image: string;
  price: number;
  unit: string;
  stock: number;
  minStock: number;
  origin?: string;
  shelfLife?: number;
  supplierId: string;
  supplierName: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

// 供应商类型
export interface Supplier {
  id: string;
  name: string;
  contact: string;
  phone: string;
  email: string;
  address: string;
  products: string[];
  rating: number;
  status: 'active' | 'inactive';
}

// 库存预警类型
export interface StockAlert {
  id: string;
  productId: string;
  productName: string;
  currentStock: number;
  minStock: number;
  alertType: 'low_stock' | 'out_of_stock';
  createdAt: string;
  resolved: boolean;
}

// 采购订单类型
export interface PurchaseOrder {
  id: string;
  supplierId: string;
  supplierName: string;
  items: PurchaseItem[];
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'received';
  createdAt: string;
  expectedDate: string;
}

export interface PurchaseItem {
  productId: string;
  productName: string;
  quantity: number;
  unit: string;
  price: number;
}

// 用户反馈类型
export interface Feedback {
  id: string;
  userId: string;
  userName: string;
  orderId: string;
  rating: number;
  comment: string;
  tags: string[];
  createdAt: string;
}

// 看板数据类型
export interface DashboardStats {
  totalUsers: number;
  newUsersToday: number;
  totalOrders: number;
  ordersToday: number;
  totalRevenue: number;
  revenueToday: number;
  lowStockCount: number;
  pendingOrders: number;
}

export interface InventoryStats {
  totalProducts: number;
  totalValue: number;
  turnoverRate: number;
  categoryDistribution: { category: string; count: number; value: number }[];
  stockTrend: { date: string; in: number; out: number }[];
}

// API响应类型
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
