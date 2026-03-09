import { useState, useEffect } from 'react';
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
import { t, type Language } from '@/lib/i18n';
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
  Palette,
  Sun,
  Monitor
} from 'lucide-react';

export default function Settings() {
  const { user, logout } = useAuthStore();
  const { theme, setTheme, language, setLanguage, effectiveTheme, updateEffectiveTheme } = useUIStore();
  
  // 监听系统主题变化
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') {
        updateEffectiveTheme();
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme, updateEffectiveTheme]);
  
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
    toast.success(t('toast.settings.updated', language));
  };

  const handlePrivacyChange = (key: keyof typeof privacy) => {
    setPrivacy(prev => ({ ...prev, [key]: !prev[key] }));
    toast.success(t('toast.privacy.updated', language));
  };

  const handleSecurityChange = (key: keyof typeof security) => {
    setSecurity(prev => ({ ...prev, [key]: !prev[key] }));
    toast.success(t('toast.security.updated', language));
  };

  const handleThemeChange = (value: string) => {
    const newTheme = value as 'light' | 'dark' | 'system';
    setTheme(newTheme);
    const themeMessages: Record<string, import('@/lib/i18n').TranslationKey> = {
      light: 'toast.theme.light',
      dark: 'toast.theme.dark',
      system: 'toast.theme.system'
    };
    toast.success(t(themeMessages[newTheme], language));
  };

  const handleLanguageChange = (value: string) => {
    const newLang = value as Language;
    setLanguage(newLang);
    // 语言切换后，使用新语言显示提示
    toast.success(t('toast.language.updated', newLang));
  };

  const handleExportData = () => {
    toast.success(t('toast.data.exporting', language));
    setTimeout(() => {
      toast.success(t('toast.data.exported', language));
    }, 2000);
  };

  const handleDeleteAccount = () => {
    if (confirm(t('toast.account.deleteConfirm', language))) {
      toast.success(t('toast.account.deleteRequested', language));
      setTimeout(() => {
        logout();
      }, 2000);
    }
  };

  // 获取主题图标
  const getThemeIcon = (themeValue: string) => {
    switch (themeValue) {
      case 'light':
        return <Sun className="w-4 h-4 mr-2" />;
      case 'dark':
        return <Moon className="w-4 h-4 mr-2" />;
      case 'system':
        return <Monitor className="w-4 h-4 mr-2" />;
      default:
        return null;
    }
  };

  return (
    <div className="p-4 lg:p-6 max-w-4xl mx-auto">
      {/* 页面标题 */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">{t('settings.title', language)}</h1>
        <p className="text-gray-500 dark:text-gray-400">{t('settings.subtitle', language)}</p>
      </div>

      <Tabs defaultValue="account" className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 lg:w-auto lg:inline-flex">
          <TabsTrigger value="account">{t('settings.tab.account', language)}</TabsTrigger>
          <TabsTrigger value="notifications">{t('settings.tab.notifications', language)}</TabsTrigger>
          <TabsTrigger value="privacy">{t('settings.tab.privacy', language)}</TabsTrigger>
          <TabsTrigger value="general">{t('settings.tab.general', language)}</TabsTrigger>
        </TabsList>

        {/* 账号设置 */}
        <TabsContent value="account" className="mt-6 space-y-6">
          {/* 账号信息 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <User className="w-5 h-5 mr-2 text-green-600" />
                {t('settings.account.info', language)}
              </CardTitle>
              <CardDescription>{t('settings.account.info.desc', language)}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('settings.account.userId', language)}</Label>
                  <Input value={user?.id || ''} disabled className="bg-gray-50 dark:bg-gray-800" />
                </div>
                <div className="space-y-2">
                  <Label>{t('settings.account.registerTime', language)}</Label>
                  <Input value="2026-02-15" disabled className="bg-gray-50 dark:bg-gray-800 dark:text-gray-300" />
                </div>
                <div className="space-y-2">
                  <Label>{t('settings.account.role', language)}</Label>
                  <Input 
                    value={user?.role === 'admin' 
                      ? t('settings.account.role.admin', language) 
                      : user?.role === 'merchant' 
                        ? t('settings.account.role.merchant', language) 
                        : t('settings.account.role.user', language)} 
                    disabled 
                    className="bg-gray-50 dark:bg-gray-800" 
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('settings.account.status', language)}</Label>
                  <div className="flex items-center space-x-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                      {t('settings.account.status.active', language)}
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
                {t('settings.security.title', language)}
              </CardTitle>
              <CardDescription>{t('settings.security.desc', language)}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="font-medium">{t('settings.security.twoFactor', language)}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{t('settings.security.twoFactor.desc', language)}</div>
                </div>
                <Switch 
                  checked={security.twoFactor}
                  onCheckedChange={() => handleSecurityChange('twoFactor')}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="font-medium">{t('settings.security.loginAlert', language)}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{t('settings.security.loginAlert.desc', language)}</div>
                </div>
                <Switch 
                  checked={security.loginAlert}
                  onCheckedChange={() => handleSecurityChange('loginAlert')}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="font-medium">{t('settings.security.deviceMgmt', language)}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{t('settings.security.deviceMgmt.desc', language)}</div>
                </div>
                <Button variant="outline" size="sm">
                  {t('settings.security.deviceMgmt.btn', language)}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 危险区域 */}
          <Card className="border-red-200 dark:border-red-800">
            <CardHeader>
              <CardTitle className="text-lg text-red-600 flex items-center">
                <Trash2 className="w-5 h-5 mr-2" />
                {t('settings.danger.title', language)}
              </CardTitle>
              <CardDescription>{t('settings.danger.desc', language)}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="font-medium">{t('settings.danger.clearCache', language)}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{t('settings.danger.clearCache.desc', language)}</div>
                </div>
                <Button variant="outline" size="sm" onClick={() => {
                  localStorage.removeItem('cart-storage');
                  toast.success(t('toast.cache.cleared', language));
                }}>
                  {t('settings.danger.clearCache.btn', language)}
                </Button>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="font-medium text-red-600">{t('settings.danger.deleteAccount', language)}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{t('settings.danger.deleteAccount.desc', language)}</div>
                </div>
                <Button variant="destructive" size="sm" onClick={handleDeleteAccount}>
                  {t('settings.danger.deleteAccount.btn', language)}
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
                {t('settings.notifications.channels', language)}
              </CardTitle>
              <CardDescription>{t('settings.notifications.channels.desc', language)}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <div className="space-y-0.5">
                    <div className="font-medium">{t('settings.notifications.email', language)}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{t('settings.notifications.email.desc', language)}</div>
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
                    <div className="font-medium">{t('settings.notifications.sms', language)}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{t('settings.notifications.sms.desc', language)}</div>
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
                    <div className="font-medium">{t('settings.notifications.push', language)}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{t('settings.notifications.push.desc', language)}</div>
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
              <CardTitle className="text-lg">{t('settings.notifications.types', language)}</CardTitle>
              <CardDescription>{t('settings.notifications.types.desc', language)}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { id: 'order', label: t('settings.notifications.order', language), desc: t('settings.notifications.order.desc', language) },
                { id: 'delivery', label: t('settings.notifications.delivery', language), desc: t('settings.notifications.delivery.desc', language) },
                { id: 'promotion', label: t('settings.notifications.promotion', language), desc: t('settings.notifications.promotion.desc', language) },
                { id: 'subscription', label: t('settings.notifications.subscription', language), desc: t('settings.notifications.subscription.desc', language) },
                { id: 'system', label: t('settings.notifications.system', language), desc: t('settings.notifications.system.desc', language) },
              ].map((item, index, arr) => (
                <div key={item.id}>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="font-medium">{item.label}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{item.desc}</div>
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
              <CardTitle className="text-lg">{t('settings.notifications.marketing', language)}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="font-medium">{t('settings.notifications.marketing.enable', language)}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{t('settings.notifications.marketing.desc', language)}</div>
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
                {t('settings.privacy.title', language)}
              </CardTitle>
              <CardDescription>{t('settings.privacy.desc', language)}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="font-medium">{t('settings.privacy.profileVisible', language)}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{t('settings.privacy.profileVisible.desc', language)}</div>
                </div>
                <Switch 
                  checked={privacy.profileVisible}
                  onCheckedChange={() => handlePrivacyChange('profileVisible')}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="font-medium">{t('settings.privacy.shareData', language)}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{t('settings.privacy.shareData.desc', language)}</div>
                </div>
                <Switch 
                  checked={privacy.shareData}
                  onCheckedChange={() => handlePrivacyChange('shareData')}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="font-medium">{t('settings.privacy.location', language)}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{t('settings.privacy.location.desc', language)}</div>
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
              <CardTitle className="text-lg">{t('settings.privacy.data', language)}</CardTitle>
              <CardDescription>{t('settings.privacy.data.desc', language)}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="font-medium">{t('settings.privacy.export', language)}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{t('settings.privacy.export.desc', language)}</div>
                </div>
                <Button variant="outline" size="sm" onClick={handleExportData}>
                  <Download className="w-4 h-4 mr-2" />
                  {t('settings.privacy.export.btn', language)}
                </Button>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="font-medium">{t('settings.privacy.policy', language)}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{t('settings.privacy.policy.desc', language)}</div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => toast.info(t('toast.info.privacy', language))}> 
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="font-medium">{t('settings.privacy.terms', language)}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{t('settings.privacy.terms.desc', language)}</div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => toast.info(t('toast.info.terms', language))}>
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
                {t('settings.general.appearance', language)}
              </CardTitle>
              <CardDescription>{t('settings.general.appearance.desc', language)}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>{t('settings.general.theme', language)}</Label>
                <Select value={theme} onValueChange={handleThemeChange}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('settings.general.theme', language)} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">
                      <div className="flex items-center">
                        {getThemeIcon('light')}
                        {t('settings.general.theme.light', language)}
                      </div>
                    </SelectItem>
                    <SelectItem value="dark">
                      <div className="flex items-center">
                        {getThemeIcon('dark')}
                        {t('settings.general.theme.dark', language)}
                      </div>
                    </SelectItem>
                    <SelectItem value="system">
                      <div className="flex items-center">
                        {getThemeIcon('system')}
                        {t('settings.general.theme.system', language)}
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                {theme === 'system' && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {language === 'zh' 
                      ? `${t('settings.general.theme.system', language)}: ${effectiveTheme === 'dark' ? t('settings.general.theme.dark.current', language) : t('settings.general.theme.light.current', language)}`
                      : `${t('settings.general.theme.system', language)}: ${effectiveTheme === 'dark' ? t('settings.general.theme.dark.current', language) : t('settings.general.theme.light.current', language)}`}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Globe className="w-5 h-5 mr-2 text-green-600" />
                {t('settings.general.language', language)}
              </CardTitle>
              <CardDescription>{t('settings.general.language.desc', language)}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>{t('settings.general.language', language)}</Label>
                <Select value={language} onValueChange={handleLanguageChange}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('settings.general.language', language)} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="zh">{t('settings.general.language.zh', language)}</SelectItem>
                    <SelectItem value="en">{t('settings.general.language.en', language)}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Info className="w-5 h-5 mr-2 text-green-600" />
                {t('settings.general.about', language)}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="font-medium">{t('settings.general.version', language)}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">v1.2.0</div>
                </div>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="font-medium">{t('settings.general.update', language)}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{t('settings.general.update.desc', language)}</div>
                </div>
                <Button variant="outline" size="sm" onClick={() => toast.success(t('toast.update.latest', language))}>
                  {t('settings.general.update.btn', language)}
                </Button>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="font-medium">{t('settings.general.help', language)}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{t('settings.general.help.desc', language)}</div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => toast.info(t('toast.info.help', language))}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="font-medium">{t('settings.general.contact', language)}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{t('settings.general.contact.desc', language)}</div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => toast.info(t('toast.info.contact', language))}>
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
