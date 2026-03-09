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
  Shield,
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
  Database,
  Server,
  Lock
} from 'lucide-react';

export default function AdminSettings() {
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
    sms: false,
    push: true,
    systemAlert: true,
    securityAlert: true,
    userReport: true,
  });

  // 系统设置
  const [systemSettings, setSystemSettings] = useState({
    maintenanceMode: false,
    debugMode: false,
    autoBackup: true,
    logRetention: true,
  });

  const handleNotificationChange = (key: keyof typeof notifications) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
    toast.success(t('toast.settings.updated', language));
  };

  const handleSystemSettingChange = (key: keyof typeof systemSettings) => {
    setSystemSettings(prev => ({ ...prev, [key]: !prev[key] }));
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

  const handleClearCache = () => {
    localStorage.clear();
    toast.success(t('toast.cache.cleared', language));
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

      <Tabs defaultValue="system" className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 lg:w-auto lg:inline-flex">
          <TabsTrigger value="system">{language === 'zh' ? '系统设置' : 'System'}</TabsTrigger>
          <TabsTrigger value="notifications">{t('settings.tab.notifications', language)}</TabsTrigger>
          <TabsTrigger value="general">{t('settings.tab.general', language)}</TabsTrigger>
          <TabsTrigger value="about">{t('settings.general.about', language)}</TabsTrigger>
        </TabsList>

        {/* 系统设置 */}
        <TabsContent value="system" className="mt-6 space-y-6">
          {/* 管理员信息 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Shield className="w-5 h-5 mr-2 text-purple-600" />
                {language === 'zh' ? '管理员信息' : 'Administrator Info'}
              </CardTitle>
              <CardDescription>{language === 'zh' ? '查看管理员账户信息' : 'View administrator account information'}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{language === 'zh' ? '管理员ID' : 'Admin ID'}</Label>
                  <Input value={user?.id || ''} disabled className="bg-gray-50 dark:bg-gray-800" />
                </div>
                <div className="space-y-2">
                  <Label>{t('settings.account.registerTime', language)}</Label>
                  <Input value="2026-02-15" disabled className="bg-gray-50 dark:bg-gray-800 dark:text-gray-300" />
                </div>
                <div className="space-y-2">
                  <Label>{t('settings.account.role', language)}</Label>
                  <Input 
                    value={t('settings.account.role.admin', language)} 
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

          {/* 系统控制 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Server className="w-5 h-5 mr-2 text-purple-600" />
                {language === 'zh' ? '系统控制' : 'System Control'}
              </CardTitle>
              <CardDescription>{language === 'zh' ? '管理系统运行状态和参数' : 'Manage system operation status and parameters'}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="font-medium flex items-center">
                    <Lock className="w-4 h-4 mr-2 text-gray-400" />
                    {language === 'zh' ? '维护模式' : 'Maintenance Mode'}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{language === 'zh' ? '开启后只有管理员可访问系统' : 'Only administrators can access when enabled'}</div>
                </div>
                <Switch 
                  checked={systemSettings.maintenanceMode}
                  onCheckedChange={() => handleSystemSettingChange('maintenanceMode')}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="font-medium flex items-center">
                    <Database className="w-4 h-4 mr-2 text-gray-400" />
                    {language === 'zh' ? '自动备份' : 'Auto Backup'}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{language === 'zh' ? '每日自动备份数据库' : 'Automatically backup database daily'}</div>
                </div>
                <Switch 
                  checked={systemSettings.autoBackup}
                  onCheckedChange={() => handleSystemSettingChange('autoBackup')}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="font-medium flex items-center">
                    <Server className="w-4 h-4 mr-2 text-gray-400" />
                    {language === 'zh' ? '日志保留' : 'Log Retention'}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{language === 'zh' ? '保留30天系统日志' : 'Keep system logs for 30 days'}</div>
                </div>
                <Switch 
                  checked={systemSettings.logRetention}
                  onCheckedChange={() => handleSystemSettingChange('logRetention')}
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
                <Bell className="w-5 h-5 mr-2 text-purple-600" />
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
              <CardTitle className="text-lg">{language === 'zh' ? '系统通知' : 'System Notifications'}</CardTitle>
              <CardDescription>{language === 'zh' ? '接收系统运行相关通知' : 'Receive system operation notifications'}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="font-medium">{language === 'zh' ? '系统警报' : 'System Alerts'}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{language === 'zh' ? '服务器负载、性能异常等警报' : 'Server load, performance anomaly alerts'}</div>
                </div>
                <Switch 
                  checked={notifications.systemAlert}
                  onCheckedChange={() => handleNotificationChange('systemAlert')}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="font-medium">{language === 'zh' ? '安全警报' : 'Security Alerts'}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{language === 'zh' ? '异常登录、安全事件等警报' : 'Abnormal login, security incident alerts'}</div>
                </div>
                <Switch 
                  checked={notifications.securityAlert}
                  onCheckedChange={() => handleNotificationChange('securityAlert')}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="font-medium">{language === 'zh' ? '用户反馈' : 'User Reports'}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{language === 'zh' ? '用户投诉和反馈通知' : 'User complaints and feedback notifications'}</div>
                </div>
                <Switch 
                  checked={notifications.userReport}
                  onCheckedChange={() => handleNotificationChange('userReport')}
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
                <Palette className="w-5 h-5 mr-2 text-purple-600" />
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
                <Globe className="w-5 h-5 mr-2 text-purple-600" />
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

          {/* 危险区域 */}
          <Card className="border-red-200 dark:border-red-800">
            <CardHeader>
              <CardTitle className="text-lg text-red-600 flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                {language === 'zh' ? '系统维护' : 'System Maintenance'}
              </CardTitle>
              <CardDescription>{language === 'zh' ? '执行系统维护操作，请谨慎使用' : 'Perform system maintenance operations, use with caution'}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="font-medium">{language === 'zh' ? '清除系统缓存' : 'Clear System Cache'}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{language === 'zh' ? '清除所有本地存储的缓存数据' : 'Clear all locally stored cache data'}</div>
                </div>
                <Button variant="outline" size="sm" onClick={handleClearCache}>
                  {language === 'zh' ? '清除' : 'Clear'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 关于 */}
        <TabsContent value="about" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Info className="w-5 h-5 mr-2 text-purple-600" />
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
