import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuthStore, useUIStore } from '@/store';
import {
  User,
  Bell,
  Shield,
  Moon,
  Globe,
  Smartphone,
  Mail,
  Trash2,
  Download,
  Info,
  ChevronRight,
  Palette
} from 'lucide-react';

export default function Settings() {
  const { user, logout } = useAuthStore();
  const { theme, setTheme, language, setLanguage } = useUIStore();
  
  // 通知设置
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    push: true,
    marketing: false,
  });

  // 隐私设置
  const [privacy, setPrivacy] = useState({
    profileVisible: true,
    shareData: false,
    locationTracking: true,
  });

  // 账号安全
  const [security, setSecurity] = useState({
    twoFactor: false,
    loginAlert: true,
    deviceManagement: true,
  });

  const handleNotificationChange = (key: keyof typeof notifications) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
    toast.success('设置已更新');
  };

  const handlePrivacyChange = (key: keyof typeof privacy) => {
    setPrivacy(prev => ({ ...prev, [key]: !prev[key] }));
    toast.success('隐私设置已更新');
  };

  const handleSecurityChange = (key: keyof typeof security) => {
    setSecurity(prev => ({ ...prev, [key]: !prev[key] }));
    toast.success('安全设置已更新');
  };

  const handleThemeChange = (value: string) => {
    setTheme(value as 'light' | 'dark');
    toast.success(`已切换到${value === 'light' ? '浅色' : '深色'}模式`);
  };

  const handleLanguageChange = (value: string) => {
    setLanguage(value as 'zh' | 'en');
    toast.success('语言设置已更新');
  };

  const handleExportData = () => {
    toast.success('数据导出中，请稍后...');
    setTimeout(() => {
      toast.success('数据已导出到您的邮箱');
    }, 2000);
  };

  const handleDeleteAccount = () => {
    if (confirm('确定要注销账号吗？此操作不可恢复！')) {
      toast.success('账号注销申请已提交');
      setTimeout(() => {
        logout();
      }, 2000);
    }
  };

  return (
    <div className="p-4 lg:p-6 max-w-4xl mx-auto">
      {/* 页面标题 */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">设置</h1>
        <p className="text-gray-500">管理您的账号设置、隐私和通知偏好</p>
      </div>

      <Tabs defaultValue="account" className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 lg:w-auto lg:inline-flex">
          <TabsTrigger value="account">账号</TabsTrigger>
          <TabsTrigger value="notifications">通知</TabsTrigger>
          <TabsTrigger value="privacy">隐私</TabsTrigger>
          <TabsTrigger value="general">通用</TabsTrigger>
        </TabsList>

        {/* 账号设置 */}
        <TabsContent value="account" className="mt-6 space-y-6">
          {/* 账号信息 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <User className="w-5 h-5 mr-2 text-green-600" />
                账号信息
              </CardTitle>
              <CardDescription>查看和管理您的账号基本信息</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>用户ID</Label>
                  <Input value={user?.id || ''} disabled className="bg-gray-50" />
                </div>
                <div className="space-y-2">
                  <Label>注册时间</Label>
                  <Input value="2024-01-15" disabled className="bg-gray-50" />
                </div>
                <div className="space-y-2">
                  <Label>当前角色</Label>
                  <Input 
                    value={user?.role === 'admin' ? '管理员' : user?.role === 'merchant' ? '商家' : '普通用户'} 
                    disabled 
                    className="bg-gray-50" 
                  />
                </div>
                <div className="space-y-2">
                  <Label>账号状态</Label>
                  <div className="flex items-center space-x-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      正常
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 安全设置 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Shield className="w-5 h-5 mr-2 text-green-600" />
                安全设置
              </CardTitle>
              <CardDescription>增强您的账号安全性</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="font-medium">双重验证</div>
                  <div className="text-sm text-gray-500">登录时需要输入手机验证码</div>
                </div>
                <Switch 
                  checked={security.twoFactor}
                  onCheckedChange={() => handleSecurityChange('twoFactor')}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="font-medium">登录提醒</div>
                  <div className="text-sm text-gray-500">新设备登录时发送通知</div>
                </div>
                <Switch 
                  checked={security.loginAlert}
                  onCheckedChange={() => handleSecurityChange('loginAlert')}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="font-medium">设备管理</div>
                  <div className="text-sm text-gray-500">查看和管理已登录设备</div>
                </div>
                <Button variant="outline" size="sm">
                  管理
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 危险区域 */}
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="text-lg text-red-600 flex items-center">
                <Trash2 className="w-5 h-5 mr-2" />
                危险区域
              </CardTitle>
              <CardDescription>这些操作不可恢复，请谨慎操作</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="font-medium">清除缓存数据</div>
                  <div className="text-sm text-gray-500">清除本地存储的临时数据</div>
                </div>
                <Button variant="outline" size="sm" onClick={() => toast.success('缓存已清除')}>
                  清除
                </Button>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="font-medium text-red-600">注销账号</div>
                  <div className="text-sm text-gray-500">永久删除您的账号和所有数据</div>
                </div>
                <Button variant="destructive" size="sm" onClick={handleDeleteAccount}>
                  注销
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 通知设置 */}
        <TabsContent value="notifications" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Bell className="w-5 h-5 mr-2 text-green-600" />
                通知渠道
              </CardTitle>
              <CardDescription>选择您接收通知的方式</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <div className="space-y-0.5">
                    <div className="font-medium">邮件通知</div>
                    <div className="text-sm text-gray-500">接收订单状态和促销邮件</div>
                  </div>
                </div>
                <Switch 
                  checked={notifications.email}
                  onCheckedChange={() => handleNotificationChange('email')}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Smartphone className="w-5 h-5 text-gray-400" />
                  <div className="space-y-0.5">
                    <div className="font-medium">短信通知</div>
                    <div className="text-sm text-gray-500">接收订单配送和验证码短信</div>
                  </div>
                </div>
                <Switch 
                  checked={notifications.sms}
                  onCheckedChange={() => handleNotificationChange('sms')}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Bell className="w-5 h-5 text-gray-400" />
                  <div className="space-y-0.5">
                    <div className="font-medium">推送通知</div>
                    <div className="text-sm text-gray-500">接收应用内消息推送</div>
                  </div>
                </div>
                <Switch 
                  checked={notifications.push}
                  onCheckedChange={() => handleNotificationChange('push')}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">通知类型</CardTitle>
              <CardDescription>选择您感兴趣的通知内容</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { id: 'order', label: '订单通知', desc: '订单状态变更、配送提醒' },
                { id: 'delivery', label: '配送通知', desc: '配送开始前、送达提醒' },
                { id: 'promotion', label: '优惠活动', desc: '限时优惠、新套餐上架' },
                { id: 'subscription', label: '订阅通知', desc: '订阅续费、套餐变更' },
                { id: 'system', label: '系统通知', desc: '账号安全、系统更新' },
              ].map((item, index, arr) => (
                <div key={item.id}>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="font-medium">{item.label}</div>
                      <div className="text-sm text-gray-500">{item.desc}</div>
                    </div>
                    <Switch defaultChecked={item.id !== 'promotion'} />
                  </div>
                  {index < arr.length - 1 && <Separator className="mt-4" />}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">营销偏好</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="font-medium">接收营销信息</div>
                  <div className="text-sm text-gray-500">接收产品推荐和个性化优惠</div>
                </div>
                <Switch 
                  checked={notifications.marketing}
                  onCheckedChange={() => handleNotificationChange('marketing')}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 隐私设置 */}
        <TabsContent value="privacy" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Shield className="w-5 h-5 mr-2 text-green-600" />
                隐私控制
              </CardTitle>
              <CardDescription>控制您的个人数据如何被使用</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="font-medium">公开个人资料</div>
                  <div className="text-sm text-gray-500">允许其他用户查看您的基本资料</div>
                </div>
                <Switch 
                  checked={privacy.profileVisible}
                  onCheckedChange={() => handlePrivacyChange('profileVisible')}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="font-medium">数据分析共享</div>
                  <div className="text-sm text-gray-500">允许使用您的数据改进服务</div>
                </div>
                <Switch 
                  checked={privacy.shareData}
                  onCheckedChange={() => handlePrivacyChange('shareData')}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="font-medium">位置追踪</div>
                  <div className="text-sm text-gray-500">允许获取您的位置用于配送优化</div>
                </div>
                <Switch 
                  checked={privacy.locationTracking}
                  onCheckedChange={() => handlePrivacyChange('locationTracking')}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">数据管理</CardTitle>
              <CardDescription>管理您的个人数据</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="font-medium">导出个人数据</div>
                  <div className="text-sm text-gray-500">下载您的所有个人数据副本</div>
                </div>
                <Button variant="outline" size="sm" onClick={handleExportData}>
                  <Download className="w-4 h-4 mr-2" />
                  导出
                </Button>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="font-medium">隐私政策</div>
                  <div className="text-sm text-gray-500">查看我们的隐私政策</div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => toast.info('隐私政策页面')}> 
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="font-medium">用户协议</div>
                  <div className="text-sm text-gray-500">查看用户服务协议</div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => toast.info('用户协议页面')}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 通用设置 */}
        <TabsContent value="general" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Palette className="w-5 h-5 mr-2 text-green-600" />
                外观
              </CardTitle>
              <CardDescription>自定义应用的外观和风格</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>主题模式</Label>
                <Select value={theme} onValueChange={handleThemeChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择主题" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">
                      <div className="flex items-center">
                        <span className="mr-2">☀️</span> 浅色模式
                      </div>
                    </SelectItem>
                    <SelectItem value="dark">
                      <div className="flex items-center">
                        <Moon className="w-4 h-4 mr-2" /> 深色模式
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Globe className="w-5 h-5 mr-2 text-green-600" />
                语言与地区
              </CardTitle>
              <CardDescription>设置您的语言和地区偏好</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>语言</Label>
                <Select value={language} onValueChange={handleLanguageChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择语言" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="zh">简体中文</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>货币单位</Label>
                <Select defaultValue="cny">
                  <SelectTrigger>
                    <SelectValue placeholder="选择货币" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cny">人民币 (CNY)</SelectItem>
                    <SelectItem value="usd">美元 (USD)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Info className="w-5 h-5 mr-2 text-green-600" />
                关于
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="font-medium">应用版本</div>
                  <div className="text-sm text-gray-500">v1.2.0</div>
                </div>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="font-medium">检查更新</div>
                  <div className="text-sm text-gray-500">当前已是最新版本</div>
                </div>
                <Button variant="outline" size="sm" onClick={() => toast.success('已是最新版本')}>
                  检查
                </Button>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="font-medium">帮助中心</div>
                  <div className="text-sm text-gray-500">查看使用帮助和常见问题</div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => toast.info('帮助中心页面')}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="font-medium">联系我们</div>
                  <div className="text-sm text-gray-500">客服邮箱：support@zili.com</div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => toast.info('联系客服')}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
