import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuthStore, useUIStore } from '@/store';
import { t } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
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
import { Badge } from '@/components/ui/badge';
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  Boxes,
  Settings,
  LogOut,
  Menu,
  ChevronRight,
  Bell
} from 'lucide-react';
import { toast } from 'sonner';

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { sidebarOpen, toggleSidebar, language } = useUIStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { path: '/admin', label: t('admin.overview', language), icon: LayoutDashboard },
    { path: '/admin/users', label: t('admin.users', language), icon: Users },
    { path: '/admin/orders', label: t('admin.orders', language), icon: ClipboardList },
    { path: '/admin/products', label: t('admin.products', language), icon: Boxes },
  ];

  const handleLogout = () => {
    logout();
    toast.success(t('nav.logoutSuccess', language));
    navigate('/login');
  };

  const isActive = (path: string) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50 flex">
      {/* 桌面端侧边栏 */}
      <aside
        className={`hidden lg:flex flex-col bg-slate-900 text-white transition-all duration-300 ${
          sidebarOpen ? 'w-64' : 'w-20'
        }`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-center border-b border-slate-800">
          <Link to="/admin" className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden bg-gradient-to-br from-green-100 to-emerald-50 shadow-sm">
              <img src="/logo.svg" alt="梓里炊烟" className="w-8 h-8 object-contain" />
            </div>
            {sidebarOpen && (
              <div className="flex flex-col">
                <span className="font-bold text-base text-white leading-tight">梓里炊烟</span>
                <span className="text-[10px] text-slate-400 leading-tight">{t('admin.dashboard', language)}</span>
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
                    ? 'bg-purple-600 text-white'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && <span className="font-medium">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* 底部操作 */}
        <div className="p-4 border-t border-slate-800">
          <button
            onClick={toggleSidebar}
            className="w-full flex items-center justify-center p-2 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <ChevronRight
              className={`w-5 h-5 text-slate-400 transition-transform ${
                sidebarOpen ? 'rotate-180' : ''
              }`}
            />
          </button>
        </div>
      </aside>

      {/* 主内容区 */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* 顶部导航栏 */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
          {/* 左侧：移动端菜单按钮 */}
          <div className="flex items-center space-x-4">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0 bg-slate-900">
                <SheetHeader className="p-6 border-b border-slate-800">
                  <SheetTitle className="flex items-center space-x-2 text-white">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden bg-gradient-to-br from-green-100 to-emerald-50 shadow-sm">
                      <img src="/logo.svg" alt="梓里炊烟" className="w-8 h-8 object-contain" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-base">梓里炊烟</span>
                      <span className="text-[10px] text-slate-400">{t('admin.dashboard', language)}</span>
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
                            ? 'bg-purple-600 text-white'
                            : 'text-slate-400 hover:bg-slate-800 hover:text-white'
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
          </div>

          {/* 右侧：操作按钮 */}
          <div className="flex items-center space-x-2">
            {/* 通知 */}
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500">
                8
              </Badge>
            </Button>

            {/* 用户菜单 */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.avatar} />
                    <AvatarFallback className="bg-purple-100 text-purple-600">
                      {user?.name?.charAt(0) || 'A'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:inline font-medium">{user?.name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>{t('admin.administrator', language)}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/admin')}>
                  <LayoutDashboard className="w-4 h-4 mr-2" />
                  {t('admin.dashboard', language)}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/admin/settings')}>
                  <Settings className="w-4 h-4 mr-2" />
                  {t('admin.system', language)}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  <LogOut className="w-4 h-4 mr-2" />
                  {t('nav.logout', language)}
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
    </div>
    </>
  );
}
