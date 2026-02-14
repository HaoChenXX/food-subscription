import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import { useAuthStore } from '@/store';
import { useEffect, useState } from 'react';
import api from '@/api';

// 用户端页面
import UserLayout from '@/pages/user/Layout';
import UserHome from '@/pages/user/Home';
import UserProfile from '@/pages/user/Profile';
import DietProfilePage from '@/pages/user/DietProfile';
import FoodPackages from '@/pages/user/FoodPackages';
import PackageList from '@/pages/user/PackageList';
import PackageDetail from '@/pages/user/PackageDetail';
import Orders from '@/pages/user/Orders';
import OrderDetail from '@/pages/user/OrderDetail';
import Subscriptions from '@/pages/user/Subscriptions';
import SubscriptionDetail from '@/pages/user/SubscriptionDetail';
import Cart from '@/pages/user/Cart';
import Checkout from '@/pages/user/Checkout';
import Addresses from '@/pages/user/Addresses';

// 商家端页面
import MerchantLayout from '@/pages/merchant/Layout';
import MerchantDashboard from '@/pages/merchant/Dashboard';
import MerchantProducts from '@/pages/merchant/Products';
import MerchantOrders from '@/pages/merchant/Orders';
import MerchantInventory from '@/pages/merchant/Inventory';

// 后台管理页面
import AdminLayout from '@/pages/admin/Layout';
import AdminDashboard from '@/pages/admin/Dashboard';
import AdminUsers from '@/pages/admin/Users';
import AdminOrders from '@/pages/admin/Orders';
import AdminInventory from '@/pages/admin/Inventory';
import AdminSuppliers from '@/pages/admin/Suppliers';
import AdminReports from '@/pages/admin/Reports';
import AdminProducts from '@/pages/admin/Products';

// 公共页面
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import NotFound from '@/pages/NotFound';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false
    }
  }
});

// 认证初始化组件 - 验证 token 有效性
const AuthInitializer = ({ children }: { children: React.ReactNode }) => {
  const { token, logout, login } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);
  
  useEffect(() => {
    const validateToken = async () => {
      if (token) {
        try {
          // 尝试获取用户信息验证 token 有效性
          const userData = await api.auth.getProfile();
          // 更新用户信息（防止角色等字段有更新）
          if (userData) {
            login(userData, token);
          }
        } catch (error) {
          // token 无效，清除登录状态
          console.log('Token 已过期或无效，需要重新登录');
          logout();
        }
      }
      setIsChecking(false);
    };
    
    validateToken();
  }, []);
  
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }
  
  return <>{children}</>;
};

// 路由守卫组件
const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: string[] }) => {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

// 公开路由 - 已登录用户自动跳转到对应首页
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname;
  
  if (isAuthenticated && user) {
    // 如果有来源页面，跳回来源页
    if (from && from !== '/login') {
      return <Navigate to={from} replace />;
    }
    
    // 根据角色跳转到对应首页
    switch (user.role) {
      case 'admin':
        return <Navigate to="/admin" replace />;
      case 'merchant':
        return <Navigate to="/merchant" replace />;
      default:
        return <Navigate to="/" replace />;
    }
  }
  
  return <>{children}</>;
};

// 智能根路由 - 根据用户角色自动跳转
const SmartRootRoute = () => {
  const { isAuthenticated, user } = useAuthStore();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // 已登录用户根据角色跳转
  switch (user?.role) {
    case 'admin':
      return <Navigate to="/admin" replace />;
    case 'merchant':
      return <Navigate to="/merchant" replace />;
    default:
      return <UserHome />;
  }
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthInitializer>
          <Routes>
            {/* 公共路由 - 已登录自动跳转 */}
            <Route path="/login" element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } />
            <Route path="/register" element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            } />
            
            {/* 用户端路由 */}
            <Route path="/" element={
              <ProtectedRoute>
                <UserLayout />
              </ProtectedRoute>
            }>
              <Route index element={<SmartRootRoute />} />
              <Route path="profile" element={<UserProfile />} />
              <Route path="diet-profile" element={<DietProfilePage />} />
              <Route path="packages" element={<FoodPackages />} />
              <Route path="packages/list" element={<PackageList />} />
              <Route path="packages/:id" element={<PackageDetail />} />
              <Route path="orders" element={<Orders />} />
              <Route path="orders/:id" element={<OrderDetail />} />
              <Route path="subscriptions" element={<Subscriptions />} />
              <Route path="subscriptions/:id" element={<SubscriptionDetail />} />
              <Route path="addresses" element={<Addresses />} />
              <Route path="cart" element={<Cart />} />
              <Route path="checkout" element={<Checkout />} />
            </Route>
            
            {/* 商家端路由 */}
            <Route path="/merchant" element={
              <ProtectedRoute allowedRoles={['merchant', 'admin']}>
                <MerchantLayout />
              </ProtectedRoute>
            }>
              <Route index element={<MerchantDashboard />} />
              <Route path="products" element={<MerchantProducts />} />
              <Route path="orders" element={<MerchantOrders />} />
              <Route path="inventory" element={<MerchantInventory />} />
            </Route>
            
            {/* 后台管理路由 */}
            <Route path="/admin" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminLayout />
              </ProtectedRoute>
            }>
              <Route index element={<AdminDashboard />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="inventory" element={<AdminInventory />} />
              <Route path="suppliers" element={<AdminSuppliers />} />
              <Route path="reports" element={<AdminReports />} />
            </Route>
            
            {/* 404页面 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthInitializer>
      </Router>
      <Toaster position="top-center" />
    </QueryClientProvider>
  );
}

export default App;
