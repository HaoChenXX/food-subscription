import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useAuthStore, useUIStore } from '@/store';
import { t } from '@/lib/i18n';
import {
  User,
  Mail,
  Phone,
  Camera,
  Lock,
  Bell,
  Shield
} from 'lucide-react';

export default function UserProfile() {
  const { user, setUser } = useAuthStore();
  const { language } = useUIStore();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  const updateProfileMutation = useMutation({
    mutationFn: async () => {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500));
      return { ...user!, ...formData };
    },
    onSuccess: (data) => {
      setUser(data);
      setIsEditing(false);
      toast.success(t('profile.updated', language));
    },
    onError: () => {
      toast.error('更新失败，请重试');
    }
  });

  const handleSave = () => {
    updateProfileMutation.mutate();
  };

  return (
    <div className="p-4 lg:p-6 max-w-4xl mx-auto">
      {/* 页面标题 */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">{t('profile.title', language)}</h1>
        <p className="text-gray-500">{t('profile.subtitle', language)}</p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-flex">
          <TabsTrigger value="profile">{t('profile.tab.profile', language)}</TabsTrigger>
          <TabsTrigger value="security">{t('profile.tab.security', language)}</TabsTrigger>
          <TabsTrigger value="notifications">{t('profile.tab.notifications', language)}</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6 space-y-6">
          {/* 头像区域 */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col items-center">
                <div className="relative">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src={user?.avatar} />
                    <AvatarFallback className="bg-green-100 text-green-600 text-2xl">
                      {user?.name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <button className="absolute bottom-0 right-0 w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white hover:bg-green-700 transition-colors">
                    <Camera className="w-4 h-4" />
                  </button>
                </div>
                <h3 className="font-bold text-lg mt-4">{user?.name}</h3>
                <p className="text-gray-500">{user?.email}</p>
              </div>
            </CardContent>
          </Card>

          {/* 基本信息 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                <span>{t('profile.tab.profile', language)}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                  disabled={updateProfileMutation.isPending}
                >
                  {isEditing ? '保存' : '编辑'}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center">
                    <User className="w-4 h-4 mr-2 text-gray-400" />
                    {t('profile.name', language)}
                  </Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center">
                    <Mail className="w-4 h-4 mr-2 text-gray-400" />
                    {t('profile.email', language)}
                  </Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center">
                    <Phone className="w-4 h-4 mr-2 text-gray-400" />
                    {t('profile.phone', language)}
                  </Label>
                  <Input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Lock className="w-5 h-5 mr-2 text-green-600" />
                {t('profile.changePassword', language)}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <Label>{t('profile.currentPassword', language)}</Label>
                <Input type="password" placeholder="请输入当前密码" />
              </div>
              <div className="space-y-2">
                <Label>{t('profile.newPassword', language)}</Label>
                <Input type="password" placeholder="请输入新密码" />
              </div>
              <div className="space-y-2">
                <Label>{t('profile.confirmPassword', language)}</Label>
                <Input type="password" placeholder="请再次输入新密码" />
              </div>
              <Button className="bg-green-600 hover:bg-green-700">
                {t('profile.changePassword', language)}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Shield className="w-5 h-5 mr-2 text-green-600" />
                {t('settings.security.title', language)}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{t('profile.phoneVerified', language)}</div>
                  <div className="text-sm text-gray-500">已绑定手机号：138****8000</div>
                </div>
                <Button variant="outline" size="sm">{t('profile.change', language)}</Button>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{t('profile.emailVerified', language)}</div>
                  <div className="text-sm text-gray-500">已绑定邮箱：{user?.email}</div>
                </div>
                <Button variant="outline" size="sm">{t('profile.change', language)}</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Bell className="w-5 h-5 mr-2 text-green-600" />
                {t('profile.tab.notifications', language)}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {[
                { id: 'order', label: '订单通知', desc: '订单状态变更时通知我' },
                { id: 'delivery', label: '配送通知', desc: '配送开始前通知我' },
                { id: 'promotion', label: '优惠活动', desc: '有新的优惠活动时通知我' },
                { id: 'system', label: '系统通知', desc: '重要的系统更新和公告' },
              ].map((item) => (
                <div key={item.id} className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{item.label}</div>
                    <div className="text-sm text-gray-500">{item.desc}</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                  </label>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
