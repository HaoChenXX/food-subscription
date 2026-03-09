import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Eye, EyeOff, Loader2, ArrowLeft, User, Store } from 'lucide-react';
import { useAuthStore, useUIStore } from '@/store';
import { t } from '@/lib/i18n';
import api from '@/api';

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const { language } = useUIStore();
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'user' as 'user' | 'merchant'
  });

  const registerMutation = useMutation({
    mutationFn: () => api.auth.register({
      email: form.email,
      password: form.password,
      name: form.name,
      phone: form.phone,
      role: form.role
    }),
    onSuccess: (data: { user: any; token: string }) => {
      login(data.user, data.token);
      toast.success('注册成功！');
      navigate('/diet-profile');
    },
    onError: (error: Error) => {
      toast.error(error.message || '注册失败');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (form.password !== form.confirmPassword) {
      toast.error('两次输入的密码不一致');
      return;
    }
    
    if (!agreeTerms) {
      toast.error('请同意服务条款');
      return;
    }
    
    registerMutation.mutate();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-teal-100 p-4">
      <div className="w-full max-w-md">
        {/* 返回按钮 */}
        <Link 
          to="/login" 
          className="inline-flex items-center text-gray-600 hover:text-gray-800 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          返回登录
        </Link>
        
        {/* Logo & Brand */}
        <div className="flex flex-col items-center justify-center mb-6">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg overflow-hidden bg-gradient-to-br from-green-100 to-emerald-50">
            <img src="/logo.svg" alt="梓里炊烟" className="w-16 h-16 object-contain" />
          </div>
          <h1 className="mt-4 text-2xl font-bold text-gray-900">梓里炊烟</h1>
          <p className="text-sm text-gray-500 mt-1">县域富民食材订阅平台</p>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="text-center">
            <CardTitle className="text-xl font-bold text-gray-900">{t('auth.register.title', language)}</CardTitle>
            <CardDescription>{t('auth.register.subtitle', language)}</CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t('auth.register.name', language)}</Label>
                <Input
                  id="name"
                  placeholder="请输入您的姓名"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">{t('auth.register.email', language)}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="请输入邮箱地址"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">手机号</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="请输入手机号"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  required
                />
              </div>

              {/* 角色选择 */}
              <div className="space-y-2">
                <Label>注册类型</Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, role: 'user' })}
                    className={`flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all ${
                      form.role === 'user'
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-600'
                    }`}
                  >
                    <User className="w-4 h-4" />
                    <span className="font-medium">普通用户</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, role: 'merchant' })}
                    className={`flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all ${
                      form.role === 'merchant'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-600'
                    }`}
                  >
                    <Store className="w-4 h-4" />
                    <span className="font-medium">商家入驻</span>
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {form.role === 'user' ? '注册为普通用户，可以购买食材包和订阅服务' : '注册为商家，可以发布和管理食材包'}
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">{t('auth.register.password', language)}</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="请设置密码（至少6位）"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    minLength={6}
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
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">{t('auth.register.confirmPassword', language)}</Label>
                <Input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="请再次输入密码"
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  required
                />
              </div>
              
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="terms"
                  checked={agreeTerms}
                  onCheckedChange={(checked) => setAgreeTerms(checked as boolean)}
                />
                <Label htmlFor="terms" className="text-sm font-normal leading-tight">
                  {t('auth.register.agree', language)}{' '}
                  <Link to="/terms" className="text-green-600 hover:text-green-700">
                    {t('auth.register.terms', language)}
                  </Link>
                  {' '}{t('auth.register.and', language)}{' '}
                  <Link to="/privacy" className="text-amber-600 hover:text-amber-700">
                    {t('auth.register.privacy', language)}
                  </Link>
                </Label>
              </div>
              
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                disabled={registerMutation.isPending}
              >
                {registerMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    注册中...
                  </>
                ) : (
                  t('auth.register.btn', language)
                )}
              </Button>
            </form>
          </CardContent>
          
          <CardFooter>
            <div className="text-sm text-center w-full text-gray-500">
              {t('auth.register.hasAccount', language)}{' '}
              <Link to="/login" className="text-green-600 hover:text-green-700 font-medium">
                {t('auth.register.login', language)}
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
