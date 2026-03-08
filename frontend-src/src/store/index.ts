import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, DietProfile, FoodPackage, Order, Subscription, DeliveryAddress } from '@/types';

// 认证状态
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  login: (user: User, token: string) => void;
  logout: () => void;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      login: (user, token) => set({ user, token, isAuthenticated: true }),
      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
        // 清除所有相关的 localStorage
        localStorage.removeItem('auth-storage');
        localStorage.removeItem('diet-profile-storage');
        localStorage.removeItem('cart-storage');
        localStorage.removeItem('address-storage');
      },
      initialize: () => {
        // 从持久化存储恢复时，验证状态完整性
        const { token, user } = get();
        if (token && user) {
          set({ isAuthenticated: true });
        } else {
          // 数据不完整，清除状态
          set({ user: null, token: null, isAuthenticated: false });
        }
      }
    }),
    {
      name: 'auth-storage',
      // 自定义序列化，添加版本控制
      version: 1,
      // 部分持久化 - 不持久化 isAuthenticated，每次重新验证
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        // isAuthenticated 不持久化，每次初始化时重新计算
      }),
    }
  )
);

// 饮食画像状态
interface DietProfileState {
  profile: DietProfile | null;
  isLoading: boolean;
  setProfile: (profile: DietProfile | null) => void;
  updateProfile: (data: Partial<DietProfile>) => void;
  setLoading: (loading: boolean) => void;
}

export const useDietProfileStore = create<DietProfileState>()(
  persist(
    (set) => ({
      profile: null,
      isLoading: false,
      setProfile: (profile) => set({ profile }),
      updateProfile: (data) => set((state) => ({
        profile: state.profile ? { ...state.profile, ...data } : null
      })),
      setLoading: (loading) => set({ isLoading: loading })
    }),
    {
      name: 'diet-profile-storage'
    }
  )
);

// 食材包状态
interface FoodPackageState {
  packages: FoodPackage[];
  recommendedPackages: FoodPackage[];
  limitedPackages: FoodPackage[];
  currentPackage: FoodPackage | null;
  isLoading: boolean;
  setPackages: (packages: FoodPackage[]) => void;
  setRecommendedPackages: (packages: FoodPackage[]) => void;
  setLimitedPackages: (packages: FoodPackage[]) => void;
  setCurrentPackage: (pkg: FoodPackage | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useFoodPackageStore = create<FoodPackageState>((set) => ({
  packages: [],
  recommendedPackages: [],
  limitedPackages: [],
  currentPackage: null,
  isLoading: false,
  setPackages: (packages) => set({ packages }),
  setRecommendedPackages: (packages) => set({ recommendedPackages: packages }),
  setLimitedPackages: (packages) => set({ limitedPackages: packages }),
  setCurrentPackage: (pkg) => set({ currentPackage: pkg }),
  setLoading: (loading) => set({ isLoading: loading })
}));

// 演示订单数据
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

// 订单状态
interface OrderState {
  orders: Order[];
  currentOrder: Order | null;
  isLoading: boolean;
  setOrders: (orders: Order[]) => void;
  addOrder: (order: Order) => void;
  updateOrder: (order: Order) => void;
  setCurrentOrder: (order: Order | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useOrderStore = create<OrderState>()(
  persist(
    (set) => ({
      orders: demoOrders,
      currentOrder: null,
      isLoading: false,
      setOrders: (orders) => set({ orders }),
      addOrder: (order) => set((state) => ({ orders: [order, ...state.orders] })),
      updateOrder: (order) => set((state) => ({
        orders: state.orders.map((o) => (o.id === order.id ? order : o))
      })),
      setCurrentOrder: (order) => set({ currentOrder: order }),
      setLoading: (loading) => set({ isLoading: loading })
    }),
    {
      name: 'order-storage'
    }
  )
);

// 演示订阅数据
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
  }
];

// 订阅状态
interface SubscriptionState {
  subscriptions: Subscription[];
  isLoading: boolean;
  setSubscriptions: (subscriptions: Subscription[]) => void;
  addSubscription: (subscription: Subscription) => void;
  updateSubscription: (subscription: Subscription) => void;
  setLoading: (loading: boolean) => void;
}

export const useSubscriptionStore = create<SubscriptionState>()(
  persist(
    (set) => ({
      subscriptions: demoSubscriptions,
      isLoading: false,
      setSubscriptions: (subscriptions) => set({ subscriptions }),
      addSubscription: (subscription) => set((state) => ({
        subscriptions: [subscription, ...state.subscriptions]
      })),
      updateSubscription: (subscription) => set((state) => ({
        subscriptions: state.subscriptions.map((s) =>
          s.id === subscription.id ? subscription : s
        )
      })),
      setLoading: (loading) => set({ isLoading: loading })
    }),
    {
      name: 'subscription-storage'
    }
  )
);

// 购物车状态
interface CartItem {
  packageId: string;
  packageName: string;
  packageImage: string;
  price: number;
  quantity: number;
  subscriptionType: 'weekly' | 'monthly' | 'quarterly';
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  addItem: (item: CartItem) => void;
  removeItem: (packageId: string) => void;
  updateQuantity: (packageId: string, quantity: number) => void;
  updateSubscriptionType: (packageId: string, type: 'weekly' | 'monthly' | 'quarterly') => void;
  clearCart: () => void;
  setIsOpen: (isOpen: boolean) => void;
  getTotalCount: () => number;
  getTotalAmount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      addItem: (item) =>
        set((state) => {
          const existingItem = state.items.find((i) => i.packageId === item.packageId);
          if (existingItem) {
            return {
              items: state.items.map((i) =>
                i.packageId === item.packageId
                  ? { ...i, quantity: i.quantity + item.quantity }
                  : i
              )
            };
          }
          return { items: [...state.items, item] };
        }),
      removeItem: (packageId) =>
        set((state) => ({
          items: state.items.filter((i) => i.packageId !== packageId)
        })),
      updateQuantity: (packageId, quantity) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.packageId === packageId ? { ...i, quantity } : i
          )
        })),
      updateSubscriptionType: (packageId, type) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.packageId === packageId ? { ...i, subscriptionType: type } : i
          )
        })),
      clearCart: () => set({ items: [] }),
      setIsOpen: (isOpen) => set({ isOpen }),
      getTotalCount: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },
      getTotalAmount: () => {
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
      }
    }),
    {
      name: 'cart-storage'
    }
  )
);

// 地址状态
interface AddressState {
  addresses: DeliveryAddress[];
  defaultAddress: DeliveryAddress | null;
  setAddresses: (addresses: DeliveryAddress[]) => void;
  addAddress: (address: DeliveryAddress) => void;
  updateAddress: (address: DeliveryAddress) => void;
  removeAddress: (id: string) => void;
  setDefaultAddress: (address: DeliveryAddress | null) => void;
}

export const useAddressStore = create<AddressState>()(
  persist(
    (set) => ({
      addresses: [],
      defaultAddress: null,
      setAddresses: (addresses) => set({ addresses }),
      addAddress: (address) =>
        set((state) => ({ addresses: [...state.addresses, address] })),
      updateAddress: (address) =>
        set((state) => ({
          addresses: state.addresses.map((a) => (a.id === address.id ? address : a))
        })),
      removeAddress: (id) =>
        set((state) => ({
          addresses: state.addresses.filter((a) => a.id !== id)
        })),
      setDefaultAddress: (address) => set({ defaultAddress: address })
    }),
    {
      name: 'address-storage'
    }
  )
);

// UI状态
interface UIState {
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  language: 'zh' | 'en';
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;
  setLanguage: (lang: 'zh' | 'en') => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      theme: 'light',
      language: 'zh',
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setTheme: (theme) => set({ theme }),
      toggleTheme: () =>
        set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
      setLanguage: (language) => set({ language })
    }),
    {
      name: 'ui-storage'
    }
  )
);
