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
  Store,
  Bell,
  Moon,
  Globe,
  Smartphone,
  Mail,
  Info,
  ChevronRight,
  Palette,
  Sun,
  Monitor,
  Package,
  Truck,
  CreditCard
} from 'lucide-react';

export default function MerchantSettings() {
  const { user } = useAuthStore();
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
    sms: true,
    push: true,
    orderAlert: true,
    inventoryAlert: true,
  });

  // 店铺设置
  const [shopSettings, setShopSettings] = useState({
    autoAccept: false,
    stockWarning: true,
    deliveryNotify: true,
  });

  const handleNotificationChange = (key: keyof typeof notifications) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
    toast.success(t('toast.settings.updated', language));
  };

  const handleShopSettingChange = (key: keyof typeof shopSettings) => {
    setShopSettings(prev => ({ ...prev, [key]: !prev[key] }));
    toast.success(t('toast.settings.updated', language));
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
    toast.success(t('toast.language.updated', newLang));
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

      <Tabs defaultValue="shop" className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 lg:w-auto lg:inline-flex">
          <TabsTrigger value="shop">{language === 'zh' ? '店铺设置' : 'Shop'}</TabsTrigger>
          <TabsTrigger value="notifications">{t('settings.tab.notifications', language)}</TabsTrigger>
          <TabsTrigger value="general">{t('settings.tab.general', language)}</TabsTrigger>
          <TabsTrigger value="about">{t('settings.general.about', language)}</TabsTrigger>
        </TabsList>

        {/* 店铺设置 */}
        <TabsContent value="shop" className="mt-6 space-y-6">
          {/* 店铺信息 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Store className="w-5 h-5 mr-2 text-green-600" />
                {language === 'zh' ? '店铺信息' : 'Shop Info'}
              </CardTitle>
              <CardDescription>{language === 'zh' ? '查看和管理您的店铺基本信息' : 'View and manage your shop information'}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{language === 'zh' ? '店铺ID' : 'Shop ID'}</Label>
                  <Input value={user?.id || ''} disabled className="bg-gray-50 dark:bg-gray-800" />
                </div>
                <div className="space-y-2">
                  <Label>{language === 'zh' ? '商家名称' : 'Merchant Name'}</Label>
                  <Input value={user?.name || ''} disabled className="bg-gray-50 dark:bg-gray-800 dark:text-gray-300" />
                </div>
                <div className="space-y-2">
                  <Label>{t('settings.account.role', language)}</Label>
                  <Input 
                    value={t('settings.account.role.merchant', language)} 
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

          {/* 经营设置 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Package className="w-5 h-5 mr-2 text-green-600" />
                {language === 'zh' ? '经营设置' : 'Business Settings'}
              </CardTitle>
              <CardDescription>{language === 'zh' ? '配置店铺经营相关选项' : 'Configure business operation settings'}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="font-medium flex items-center">
                    <Truck className="w-4 h-4 mr-2 text-gray-400" />
                    {language === 'zh' ? '自动接单' : 'Auto Accept Orders'}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{language === 'zh' ? '新订单自动确认，无需手动处理' : 'Automatically confirm new orders'}</div>
                </div>
                <Switch 
                  checked={shopSettings.autoAccept}
                  onCheckedChange={() => handleShopSettingChange('autoAccept')}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="font-medium flex items-center">
                    <Package className="w-4 h-4 mr-2 text-gray-400" />
                    {language === 'zh' ? '库存预警' : 'Stock Alert'}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{language === 'zh' ? '库存不足时发送提醒' : 'Send alert when stock is low'}</div>
                </div>
                <Switch 
                  checked={shopSettings.stockWarning}
                  onCheckedChange={() => handleShopSettingChange('stockWarning')}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="font-medium flex items-center">
                    <CreditCard className="w-4 h-4 mr-2 text-gray-400" />
                    {language === 'zh' ? '发货通知' : 'Delivery Notification'}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{language === 'zh' ? '发货后自动通知买家' : 'Automatically notify buyers after shipment'}</div>
                </div>
                <Switch 
                  checked={shopSettings.deliveryNotify}
                  onCheckedChange={() => handleShopSettingChange('deliveryNotify')}
                />
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
              <CardTitle className="text-lg">{language === 'zh' ? '业务通知' : 'Business Alerts'}</CardTitle>
              <CardDescription>{language === 'zh' ? '接收店铺业务相关通知' : 'Receive business-related notifications'}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="font-medium">{language === 'zh' ? '订单提醒' : 'Order Alerts'}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{language === 'zh' ? '新订单和订单状态变更提醒' : 'New orders and status change alerts'}</div>
                </div>
                <Switch 
                  checked={notifications.orderAlert}
                  onCheckedChange={() => handleNotificationChange('orderAlert')}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="font-medium">{language === 'zh' ? '库存预警' : 'Inventory Alerts'}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{language === 'zh' ? '商品库存不足时提醒' : 'Alert when product stock is low'}</div>
                </div>
                <Switch 
                  checked={notifications.inventoryAlert}
                  onCheckedChange={() => handleNotificationChange('inventoryAlert')}
                />
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
        </TabsContent>

        {/* 关于 */}
        <TabsContent value="about" className="mt-6 space-y-6">
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
                  <div className="text-sm text-gray-500 dark:text-gray-400">v3.1.17</div>
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
