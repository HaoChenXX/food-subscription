import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import { useAuthStore } from '@/store';

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

// 路由守卫组件
const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: string[] }) => {
  const { isAuthenticated, user } = useAuthStore();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          {/* 公共路由 */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* 用户端路由 */}
          <Route path="/" element={
            <ProtectedRoute>
              <UserLayout />
            </ProtectedRoute>
          }>
            <Route index element={<UserHome />} />
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
      </Router>
      <Toaster position="top-center" />
    </QueryClientProvider>
  );
}

export default App;
