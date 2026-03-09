import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuthStore, useCartStore, useUIStore } from '@/store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
// import { Separator } from '@/components/ui/separator';
import {
  Home,
  Package,
  ShoppingCart,
  ClipboardList,
  Calendar,
  User,
  Settings,
  LogOut,
  Menu,
  ChevronRight,
  Heart,
  Bell,
  Search,
  Trash2,
  Plus,
  Minus,
  X
} from 'lucide-react';
import { toast } from 'sonner';

const navItems = [
  { path: '/', label: '首页', icon: Home },
  { path: '/packages', label: '食材包', icon: Package },
  { path: '/orders', label: '我的订单', icon: ClipboardList },
  { path: '/subscriptions', label: '订阅管理', icon: Calendar },
];

export default function UserLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { items, getTotalCount, setIsOpen } = useCartStore();
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('已退出登录');
    navigate('/login');
  };

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* 桌面端侧边栏 */}
      <aside
        className={`hidden lg:flex flex-col bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ${
          sidebarOpen ? 'w-64' : 'w-20'
        }`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-center border-b border-gray-200 dark:border-gray-700">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden bg-gradient-to-br from-green-100 to-emerald-50 shadow-sm">
              <img src="/logo.svg" alt="梓里炊烟" className="w-8 h-8 object-contain" />
            </div>
            {sidebarOpen && (
              <div className="flex flex-col">
                <span className="font-bold text-base text-gray-900 dark:text-gray-100 leading-tight">梓里炊烟</span>
                <span className="text-[10px] text-gray-500 dark:text-gray-400 leading-tight">县域富民食材平台</span>
              </div>
            )}
          </Link>
        </div>

        {/* 导航菜单 */}
        <nav className="flex-1 py-6 px-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-3 py-3 rounded-lg transition-colors ${
                  isActive(item.path)
                    ? 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && <span className="font-medium">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* 底部操作 */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={toggleSidebar}
            className="w-full flex items-center justify-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <ChevronRight
              className={`w-5 h-5 text-gray-400 transition-transform ${
                sidebarOpen ? 'rotate-180' : ''
              }`}
            />
          </button>
        </div>
      </aside>

      {/* 主内容区 */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* 顶部导航栏 */}
        <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
          {/* 左侧：移动端菜单按钮 */}
          <div className="flex items-center space-x-4">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0">
                <SheetHeader className="p-6 border-b border-gray-200">
                  <SheetTitle className="flex items-center space-x-2">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden bg-gradient-to-br from-green-100 to-emerald-50 shadow-sm">
                      <img src="/logo.svg" alt="梓里炊烟" className="w-8 h-8 object-contain" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-base">梓里炊烟</span>
                      <span className="text-[10px] text-gray-500">县域富民食材平台</span>
                    </div>
                  </SheetTitle>
                </SheetHeader>
                <nav className="p-4 space-y-1">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center space-x-3 px-3 py-3 rounded-lg transition-colors ${
                          isActive(item.path)
                            ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
                            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{item.label}</span>
                      </Link>
                    );
                  })}
                </nav>
              </SheetContent>
            </Sheet>

            {/* 搜索框 */}
            <div className="hidden md:flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg px-3 py-2">
              <Search className="w-4 h-4 text-gray-400 dark:text-gray-300 mr-2" />
              <input
                type="text"
                placeholder="搜索食材包..."
                className="bg-transparent border-none outline-none text-sm w-48 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
              />
            </div>
          </div>

          {/* 右侧：操作按钮 */}
          <div className="flex items-center space-x-2">
            {/* 购物车 */}
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={() => setIsOpen(true)}
            >
              <ShoppingCart className="w-5 h-5" />
              {getTotalCount() > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500">
                  {getTotalCount()}
                </Badge>
              )}
            </Button>

            {/* 通知 */}
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500">
                3
              </Badge>
            </Button>

            {/* 用户菜单 */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.avatar} />
                    <AvatarFallback className="bg-green-100 text-green-600">
                      {user?.name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:inline font-medium dark:text-gray-100">{user?.name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>我的账户</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/profile')}>
                  <User className="w-4 h-4 mr-2" />
                  个人资料
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/diet-profile')}>
                  <Heart className="w-4 h-4 mr-2" />
                  饮食画像
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/orders')}>
                  <ClipboardList className="w-4 h-4 mr-2" />
                  我的订单
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/subscriptions')}>
                  <Calendar className="w-4 h-4 mr-2" />
                  订阅管理
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/settings')}>
                  <Settings className="w-4 h-4 mr-2" />
                  设置
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  <LogOut className="w-4 h-4 mr-2" />
                  退出登录
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* 页面内容 */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>

      {/* 购物车侧边栏 */}
      <Sheet open={useCartStore.getState().isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="right" className="w-full sm:w-96">
          <SheetHeader className="flex flex-row items-center justify-between">
            <SheetTitle className="flex items-center">
              <ShoppingCart className="w-5 h-5 mr-2" />
              购物车 ({getTotalCount()})
            </SheetTitle>
            {items.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="text-red-600 hover:text-red-700"
                onClick={() => {
                  if (confirm('确定要清空购物车吗？')) {
                    useCartStore.getState().clearCart();
                    toast.success('购物车已清空');
                  }
                }}
              >
                <Trash2 className="w-4 h-4 mr-1" />
                清空
              </Button>
            )}
          </SheetHeader>
          <div className="mt-6 flex flex-col h-[calc(100vh-180px)]">
            {items.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
                <ShoppingCart className="w-16 h-16 mb-4 text-gray-300" />
                <p>购物车是空的</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => {
                    setIsOpen(false);
                    navigate('/packages');
                  }}
                >
                  去选购
                </Button>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-auto space-y-3">
                  {items.map((item) => (
                    <div
                      key={item.packageId}
                      className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg group"
                    >
                      <img
                        src={item.packageImage}
                        alt={item.packageName}
                        className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <h4 className="font-medium text-sm truncate pr-2">{item.packageName}</h4>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-gray-400 hover:text-red-600 flex-shrink-0"
                            onClick={() => {
                              useCartStore.getState().removeItem(item.packageId);
                              toast.success('已从购物车移除');
                            }}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                        <p className="text-gray-500 text-xs">
                          {item.subscriptionType === 'weekly' && '周订阅'}
                          {item.subscriptionType === 'monthly' && '月订阅'}
                          {item.subscriptionType === 'quarterly' && '季订阅'}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center space-x-1">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() =>
                                useCartStore.getState().updateQuantity(item.packageId, Math.max(1, item.quantity - 1))
                              }
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() =>
                                useCartStore.getState().updateQuantity(item.packageId, Math.min(10, item.quantity + 1))
                              }
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>
                          <span className="text-green-600 font-medium text-sm">
                            ¥{item.price * item.quantity}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-gray-600">合计</span>
                    <span className="text-xl font-bold text-green-600">
                      ¥{useCartStore.getState().getTotalAmount()}
                    </span>
                  </div>
                  <Button
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                    onClick={() => {
                      setIsOpen(false);
                      navigate('/checkout');
                    }}
                  >
                    去结算
                  </Button>
                </div>
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
    </>
  );
}
