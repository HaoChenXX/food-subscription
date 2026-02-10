import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Utensils, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store';
import { mockApi } from '@/api/mock';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  // 用户登录表单
  const [userForm, setUserForm] = useState({
    email: 'user@example.com',
    password: 'password'
  });
  
  // 商家登录表单
  const [merchantForm, setMerchantForm] = useState({
    email: 'merchant@example.com',
    password: 'password'
  });
  
  // 管理员登录表单
  const [adminForm, setAdminForm] = useState({
    email: 'admin@example.com',
    password: 'password'
  });

  const loginMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      mockApi.auth.login(email, password),
    onSuccess: (data) => {
      login(data.user, data.token);
      toast.success('登录成功！');
      
      // 根据角色跳转到不同页面
      if (data.user.role === 'admin') {
        navigate('/admin');
      } else if (data.user.role === 'merchant') {
        navigate('/merchant');
      } else {
        navigate('/');
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || '登录失败');
    }
  });

  const handleUserLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate(userForm);
  };

  const handleMerchantLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate(merchantForm);
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate(adminForm);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Utensils className="w-8 h-8 text-white" />
          </div>
        </div>
        
        <Card className="shadow-xl border-0">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-900">欢迎回来</CardTitle>
            <CardDescription>登录您的智能食材包订阅账户</CardDescription>
          </CardHeader>
          
          <CardContent>
            <Tabs defaultValue="user" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="user">用户</TabsTrigger>
                <TabsTrigger value="merchant">商家</TabsTrigger>
                <TabsTrigger value="admin">管理员</TabsTrigger>
              </TabsList>
              
              {/* 用户登录 */}
              <TabsContent value="user">
                <form onSubmit={handleUserLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="user-email">邮箱</Label>
                    <Input
                      id="user-email"
                      type="email"
                      placeholder="请输入邮箱"
                      value={userForm.email}
                      onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="user-password">密码</Label>
                    <div className="relative">
                      <Input
                        id="user-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="请输入密码"
                        value={userForm.password}
                        onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="remember"
                        checked={rememberMe}
                        onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                      />
                      <Label htmlFor="remember" className="text-sm font-normal">记住我</Label>
                    </div>
                    <Link to="/forgot-password" className="text-sm text-green-600 hover:text-green-700">
                      忘记密码？
                    </Link>
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                    disabled={loginMutation.isPending}
                  >
                    {loginMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        登录中...
                      </>
                    ) : (
                      '登录'
                    )}
                  </Button>
                </form>
              </TabsContent>
              
              {/* 商家登录 */}
              <TabsContent value="merchant">
                <form onSubmit={handleMerchantLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="merchant-email">邮箱</Label>
                    <Input
                      id="merchant-email"
                      type="email"
                      placeholder="请输入商家邮箱"
                      value={merchantForm.email}
                      onChange={(e) => setMerchantForm({ ...merchantForm, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="merchant-password">密码</Label>
                    <div className="relative">
                      <Input
                        id="merchant-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="请输入密码"
                        value={merchantForm.password}
                        onChange={(e) => setMerchantForm({ ...merchantForm, password: e.target.value })}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                    disabled={loginMutation.isPending}
                  >
                    {loginMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        登录中...
                      </>
                    ) : (
                      '商家登录'
                    )}
                  </Button>
                </form>
              </TabsContent>
              
              {/* 管理员登录 */}
              <TabsContent value="admin">
                <form onSubmit={handleAdminLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="admin-email">邮箱</Label>
                    <Input
                      id="admin-email"
                      type="email"
                      placeholder="请输入管理员邮箱"
                      value={adminForm.email}
                      onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="admin-password">密码</Label>
                    <div className="relative">
                      <Input
                        id="admin-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="请输入密码"
                        value={adminForm.password}
                        onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                    disabled={loginMutation.isPending}
                  >
                    {loginMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        登录中...
                      </>
                    ) : (
                      '管理员登录'
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-sm text-center text-gray-500">
              还没有账户？{' '}
              <Link to="/register" className="text-green-600 hover:text-green-700 font-medium">
                立即注册
              </Link>
            </div>
            <div className="text-xs text-center text-gray-400">
              演示账号：user@example.com / merchant@example.com / admin@example.com
              <br />
              密码：password
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
