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

export const useOrderStore = create<OrderState>((set) => ({
  orders: [],
  currentOrder: null,
  isLoading: false,
  setOrders: (orders) => set({ orders }),
  addOrder: (order) => set((state) => ({ orders: [order, ...state.orders] })),
  updateOrder: (order) => set((state) => ({
    orders: state.orders.map((o) => (o.id === order.id ? order : o))
  })),
  setCurrentOrder: (order) => set({ currentOrder: order }),
  setLoading: (loading) => set({ isLoading: loading })
}));

// 订阅状态
interface SubscriptionState {
  subscriptions: Subscription[];
  isLoading: boolean;
  setSubscriptions: (subscriptions: Subscription[]) => void;
  addSubscription: (subscription: Subscription) => void;
  updateSubscription: (subscription: Subscription) => void;
  setLoading: (loading: boolean) => void;
}

export const useSubscriptionStore = create<SubscriptionState>((set) => ({
  subscriptions: [],
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
}));

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
