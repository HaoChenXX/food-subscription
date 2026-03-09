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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Eye, EyeOff, Loader2, FileText, Shield } from 'lucide-react';
import { useAuthStore, useUIStore } from '@/store';
import { t } from '@/lib/i18n';
import api from '@/api';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const { language } = useUIStore();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [termsDialogOpen, setTermsDialogOpen] = useState(false);
  const [privacyDialogOpen, setPrivacyDialogOpen] = useState(false);
  
  // 用户登录表单
  const [userForm, setUserForm] = useState({
    email: 'user@example.com',
    password: 'user123'
  });
  
  // 商家登录表单
  const [merchantForm, setMerchantForm] = useState({
    email: 'merchant@example.com',
    password: 'merchant123'
  });
  
  // 管理员登录表单
  const [adminForm, setAdminForm] = useState({
    email: 'admin@example.com',
    password: 'admin123'
  });

  const loginMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      api.auth.login({ email, password }),
    onSuccess: (data) => {
      login(data.user, data.token);
      toast.success(t('common.success', language));
      
      // 根据角色跳转到不同页面，使用 replace 避免返回问题
      // 添加小延迟确保状态已同步
      setTimeout(() => {
        if (data.user.role === 'admin') {
          navigate('/admin', { replace: true });
        } else if (data.user.role === 'merchant') {
          navigate('/merchant', { replace: true });
        } else {
          navigate('/', { replace: true });
        }
        // 强制刷新以确保状态同步
        window.location.reload();
      }, 100);
    },
    onError: (error: Error) => {
      toast.error(error.message || t('common.error', language));
    }
  });

  const handleUserLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreeTerms) {
      toast.error(t('auth.login.agreeRequired', language));
      return;
    }
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-teal-100 p-4">
      <div className="w-full max-w-md">
        {/* Logo & Brand */}
        <div className="flex flex-col items-center justify-center mb-6">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg overflow-hidden bg-gradient-to-br from-green-100 to-emerald-50">
            <img src="/logo.svg" alt="梓里炊烟" className="w-16 h-16 object-contain" />
          </div>
          <h1 className="mt-4 text-2xl font-bold text-gray-900">梓里炊烟</h1>
          <p className="text-sm text-gray-500 mt-1">基于饮食画像与三级供应链的县域富民食材订阅平台</p>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="text-center">
            <CardTitle className="text-xl font-bold text-gray-900">{t('auth.login.title', language)}</CardTitle>
            <CardDescription>{t('auth.login.subtitle', language)}</CardDescription>
          </CardHeader>
          
          <CardContent>
            <Tabs defaultValue="user" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="user">{t('auth.role.user', language)}</TabsTrigger>
                <TabsTrigger value="merchant">{t('auth.role.merchant', language)}</TabsTrigger>
                <TabsTrigger value="admin">{t('auth.role.admin', language)}</TabsTrigger>
              </TabsList>
              
              {/* 用户登录 */}
              <TabsContent value="user">
                <form onSubmit={handleUserLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="user-email">{t('auth.login.email', language)}</Label>
                    <Input
                      id="user-email"
                      type="email"
                      placeholder={t('auth.login.emailPlaceholder', language)}
                      value={userForm.email}
                      onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="user-password">{t('auth.login.password', language)}</Label>
                    <div className="relative">
                      <Input
                        id="user-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder={t('auth.login.passwordPlaceholder', language)}
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
                      <Label htmlFor="remember" className="text-sm font-normal">{t('auth.login.remember', language)}</Label>
                    </div>
                    <Link to="/forgot-password" className="text-sm text-green-600 hover:text-green-700">
                      {t('auth.login.forgot', language)}
                    </Link>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="agree-terms"
                      checked={agreeTerms}
                      onCheckedChange={(checked) => setAgreeTerms(checked as boolean)}
                    />
                    <Label htmlFor="agree-terms" className="text-sm font-normal">
                      {t('auth.register.agree', language)}{' '}
                      <button
                        type="button"
                        onClick={() => setTermsDialogOpen(true)}
                        className="text-green-600 hover:text-green-700 underline"
                      >
                        {t('auth.register.terms', language)}
                      </button>
                      {t('auth.register.and', language)}{' '}
                      <button
                        type="button"
                        onClick={() => setPrivacyDialogOpen(true)}
                        className="text-green-600 hover:text-green-700 underline"
                      >
                        {t('auth.register.privacy', language)}
                      </button>
                    </Label>
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                    disabled={loginMutation.isPending}
                  >
                    {loginMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {t('auth.login.loading', language)}
                      </>
                    ) : (
                      t('auth.login.btn', language)
                    )}
                  </Button>
                </form>
              </TabsContent>
              
              {/* 商家登录 */}
              <TabsContent value="merchant">
                <form onSubmit={handleMerchantLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="merchant-email">{t('auth.login.email', language)}</Label>
                    <Input
                      id="merchant-email"
                      type="email"
                      placeholder={t('auth.login.merchantEmailPlaceholder', language)}
                      value={merchantForm.email}
                      onChange={(e) => setMerchantForm({ ...merchantForm, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="merchant-password">{t('auth.login.password', language)}</Label>
                    <div className="relative">
                      <Input
                        id="merchant-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder={t('auth.login.passwordPlaceholder', language)}
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
                        {t('auth.login.loading', language)}
                      </>
                    ) : (
                      t('auth.login.merchantBtn', language)
                    )}
                  </Button>
                </form>
              </TabsContent>
              
              {/* 管理员登录 */}
              <TabsContent value="admin">
                <form onSubmit={handleAdminLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="admin-email">{t('auth.login.email', language)}</Label>
                    <Input
                      id="admin-email"
                      type="email"
                      placeholder={t('auth.login.adminEmailPlaceholder', language)}
                      value={adminForm.email}
                      onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="admin-password">{t('auth.login.password', language)}</Label>
                    <div className="relative">
                      <Input
                        id="admin-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder={t('auth.login.passwordPlaceholder', language)}
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
                        {t('auth.login.loading', language)}
                      </>
                    ) : (
                      t('auth.login.adminBtn', language)
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-sm text-center text-gray-500">
              {t('auth.login.noAccount', language)}{' '}
              <Link to="/register" className="text-green-600 hover:text-green-700 font-medium">
                {t('auth.login.register', language)}
              </Link>
            </div>
            <div className="text-xs text-center text-gray-400">
              演示账号：user@example.com / merchant@example.com / admin@example.com
              <br />
              密码：user123 / merchant123 / admin123
            </div>
          </CardFooter>
        </Card>
      </div>

      {/* 服务条款弹窗 */}
      <Dialog open={termsDialogOpen} onOpenChange={setTermsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <FileText className="w-5 h-5 mr-2 text-green-600" />
              {t('auth.register.terms', language)}
            </DialogTitle>
            <DialogDescription>
              {t('auth.terms.lastUpdated', language)}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 text-sm text-gray-600 dark:text-gray-300">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
              {language === 'zh' ? '1. 服务概述' : '1. Service Overview'}
            </h3>
            <p>
              {language === 'zh' 
                ? '梓里炊烟（以下简称"本平台"）是一个基于饮食画像与三级供应链的县域富民食材订阅平台。我们致力于为用户提供新鲜、优质的食材包订阅服务，连接县域农户与城市消费者，助力乡村振兴。'
                : 'Zili Chuiyan (hereinafter referred to as "the Platform") is a county-level food subscription platform based on dietary profiles and a three-tier supply chain. We are committed to providing users with fresh, high-quality food package subscription services, connecting county farmers with urban consumers, and supporting rural revitalization.'}
            </p>
            
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
              {language === 'zh' ? '2. 用户注册与账户' : '2. User Registration and Account'}
            </h3>
            <p>
              {language === 'zh' 
                ? '2.1 用户须年满18周岁或达到法定成年年龄方可注册使用本平台服务。\n2.2 用户应提供真实、准确、完整的注册信息，并及时更新。\n2.3 用户对其账户下的所有活动负责，应妥善保管账户密码。'
                : '2.1 Users must be at least 18 years old or of legal age to register and use the Platform services.\n2.2 Users should provide true, accurate, and complete registration information and update it promptly.\n2.3 Users are responsible for all activities under their account and should properly safeguard their account password.'}
            </p>
            
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
              {language === 'zh' ? '3. 订阅服务' : '3. Subscription Services'}
            </h3>
            <p>
              {language === 'zh' 
                ? '3.1 用户可根据个人饮食画像定制订阅计划。\n3.2 订阅周期可选择每周、每两周或每月配送。\n3.3 用户可在订阅周期结束前随时暂停或取消订阅。\n3.4 食材包内容可能因季节、供应链情况而有所调整。'
                : '3.1 Users can customize subscription plans based on their personal dietary profiles.\n3.2 Subscription cycles can be set for weekly, bi-weekly, or monthly delivery.\n3.3 Users can pause or cancel subscriptions at any time before the subscription cycle ends.\n3.4 Food package contents may be adjusted based on seasonality and supply chain conditions.'}
            </p>
            
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
              {language === 'zh' ? '4. 价格与支付' : '4. Pricing and Payment'}
            </h3>
            <p>
              {language === 'zh' 
                ? '4.1 所有价格以人民币计价，包含适用税费。\n4.2 本平台支持多种支付方式，包括支付宝、微信支付等。\n4.3 订阅费用将在每个配送周期开始前收取。\n4.4 如配送失败非因本平台原因造成，可能产生额外费用。'
                : '4.1 All prices are in RMB and include applicable taxes.\n4.2 The Platform supports multiple payment methods, including Alipay, WeChat Pay, etc.\n4.3 Subscription fees will be charged before the start of each delivery cycle.\n4.4 Additional fees may apply for failed deliveries not caused by the Platform.'}
            </p>
            
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
              {language === 'zh' ? '5. 配送与退换' : '5. Delivery and Returns'}
            </h3>
            <p>
              {language === 'zh' 
                ? '5.1 本平台承诺食材新鲜度，所有食材均为当天采摘或近期生产。\n5.2 如收到食材存在质量问题，用户可在收货后24小时内申请退换。\n5.3 因用户提供的地址不准确导致的配送失败，本平台不承担责任。'
                : '5.1 The Platform guarantees food freshness; all ingredients are freshly picked or recently produced.\n5.2 If there are quality issues with received food, users can apply for return or exchange within 24 hours of receipt.\n5.3 The Platform is not responsible for failed deliveries caused by inaccurate addresses provided by users.'}
            </p>
            
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
              {language === 'zh' ? '6. 商家条款' : '6. Merchant Terms'}
            </h3>
            <p>
              {language === 'zh' 
                ? '6.1 入驻商家须具备合法的经营资质和食品安全许可证。\n6.2 商家应保证所售商品的质量和安全，承担相应的售后责任。\n6.3 平台有权对商家商品进行抽检，不合格商品将下架处理。'
                : '6.1 Merchants must have valid business licenses and food safety permits.\n6.2 Merchants should guarantee the quality and safety of products sold and bear corresponding after-sales responsibilities.\n6.3 The Platform reserves the right to conduct spot checks on merchant products; non-compliant products will be removed from sale.'}
            </p>
            
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
              {language === 'zh' ? '7. 知识产权' : '7. Intellectual Property'}
            </h3>
            <p>
              {language === 'zh' 
                ? '本平台的所有内容，包括但不限于文字、图片、商标、标识、软件等，均受知识产权法律保护。未经授权，任何个人或组织不得复制、传播或商业使用。'
                : 'All content of the Platform, including but not limited to text, images, trademarks, logos, and software, is protected by intellectual property laws. No individual or organization may copy, distribute, or use commercially without authorization.'}
            </p>
            
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
              {language === 'zh' ? '8. 免责声明' : '8. Disclaimer'}
            </h3>
            <p>
              {language === 'zh' 
                ? '8.1 因不可抗力导致的服务中断，本平台不承担责任。\n8.2 用户因个人原因导致的损失，本平台不承担责任。\n8.3 第三方链接的内容由第三方负责，本平台不承担责任。'
                : '8.1 The Platform is not responsible for service interruptions caused by force majeure.\n8.2 The Platform is not responsible for losses caused by users\' personal reasons.\n8.3 The Platform is not responsible for content from third-party links, which is the responsibility of the third party.'}
            </p>
            
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
              {language === 'zh' ? '9. 协议修改' : '9. Agreement Modification'}
            </h3>
            <p>
              {language === 'zh' 
                ? '本平台保留随时修改本服务条款的权利。修改后的条款将在平台上公布，继续使用服务视为接受修改后的条款。'
                : 'The Platform reserves the right to modify these Terms of Service at any time. Modified terms will be published on the Platform; continued use of the service constitutes acceptance of the modified terms.'}
            </p>
            
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
              {language === 'zh' ? '10. 联系我们' : '10. Contact Us'}
            </h3>
            <p>
              {language === 'zh' 
                ? '如对服务条款有任何疑问，请联系：haocx2006@outlook.com'
                : 'For any questions about the Terms of Service, please contact: haocx2006@outlook.com'}
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* 隐私政策弹窗 */}
      <Dialog open={privacyDialogOpen} onOpenChange={setPrivacyDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Shield className="w-5 h-5 mr-2 text-green-600" />
              {t('auth.privacy.title', language)}
            </DialogTitle>
            <DialogDescription>
              {t('auth.terms.lastUpdated', language)}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 text-sm text-gray-600 dark:text-gray-300">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
              {language === 'zh' ? '1. 信息收集' : '1. Information Collection'}
            </h3>
            <p>
              {language === 'zh' 
                ? '我们可能收集以下类型的信息：\n• 账户信息：姓名、邮箱、手机号、密码\n• 个人资料：头像、性别、年龄、饮食偏好、健康目标\n• 地址信息：配送地址、收货人姓名和电话\n• 交易信息：订单记录、支付信息、订阅计划\n• 设备信息：IP地址、浏览器类型、设备标识'
                : 'We may collect the following types of information:\n• Account Information: Name, email, phone number, password\n• Profile Information: Avatar, gender, age, dietary preferences, health goals\n• Address Information: Delivery address, recipient name and phone\n• Transaction Information: Order history, payment information, subscription plans\n• Device Information: IP address, browser type, device identifier'}
            </p>
            
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
              {language === 'zh' ? '2. 信息使用' : '2. Information Usage'}
            </h3>
            <p>
              {language === 'zh' 
                ? '我们使用收集的信息用于：\n• 提供、维护和改进我们的服务\n• 处理订单和配送\n• 个性化推荐食材包和食谱\n• 发送订单状态和促销信息\n• 防范欺诈和安全风险\n• 遵守法律法规要求'
                : 'We use collected information to:\n• Provide, maintain, and improve our services\n• Process orders and deliveries\n• Personalize food package and recipe recommendations\n• Send order status and promotional information\n• Prevent fraud and security risks\n• Comply with legal and regulatory requirements'}
            </p>
            
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
              {language === 'zh' ? '3. 信息共享' : '3. Information Sharing'}
            </h3>
            <p>
              {language === 'zh' 
                ? '我们不会出售您的个人信息。仅在以下情况下可能共享信息：\n• 与入驻商家共享订单配送所需的必要信息\n• 与物流服务提供商共享配送地址和联系方式\n• 与支付服务提供商处理交易\n• 根据法律要求向政府部门披露\n• 在合并、收购或资产转让时'
                : 'We do not sell your personal information. We may share information only in the following circumstances:\n• With merchant partners for order delivery necessities\n• With logistics service providers for delivery address and contact information\n• With payment service providers to process transactions\n• With government agencies as required by law\n• In the event of a merger, acquisition, or asset transfer'}
            </p>
            
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
              {language === 'zh' ? '4. 信息安全' : '4. Information Security'}
            </h3>
            <p>
              {language === 'zh' 
                ? '我们采取多种安全措施保护您的信息：\n• 使用SSL/TLS加密传输数据\n• 密码采用 bcrypt 加密存储\n• 定期安全审计和漏洞扫描\n• 严格限制内部数据访问权限\n• 数据备份和灾难恢复机制'
                : 'We employ various security measures to protect your information:\n• Use SSL/TLS encryption for data transmission\n• Store passwords encrypted with bcrypt\n• Regular security audits and vulnerability scans\n• Strictly limit internal data access permissions\n• Data backup and disaster recovery mechanisms'}
            </p>
            
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
              {language === 'zh' ? '5. Cookie 使用' : '5. Cookie Usage'}
            </h3>
            <p>
              {language === 'zh' 
                ? '我们使用 Cookie 和类似技术来：\n• 保持您的登录状态\n• 记住您的偏好设置（如语言、主题）\n• 分析网站流量和用户行为\n• 提供个性化内容推荐\n您可以在浏览器设置中管理 Cookie 偏好。'
                : 'We use cookies and similar technologies to:\n• Maintain your login status\n• Remember your preferences (such as language, theme)\n• Analyze website traffic and user behavior\n• Provide personalized content recommendations\nYou can manage cookie preferences in your browser settings.'}
            </p>
            
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
              {language === 'zh' ? '6. 您的权利' : '6. Your Rights'}
            </h3>
            <p>
              {language === 'zh' 
                ? '您对个人信息拥有以下权利：\n• 访问权：查看我们持有的您的信息\n• 更正权：更正不准确或不完整的信息\n• 删除权：要求删除您的个人信息\n• 限制处理权：限制对您信息的处理\n• 数据可携带权：导出您的数据\n• 反对权：反对某些类型的数据处理'
                : 'You have the following rights regarding your personal information:\n• Right to Access: View the information we hold about you\n• Right to Rectification: Correct inaccurate or incomplete information\n• Right to Erasure: Request deletion of your personal information\n• Right to Restrict Processing: Restrict processing of your information\n• Right to Data Portability: Export your data\n• Right to Object: Object to certain types of data processing'}
            </p>
            
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
              {language === 'zh' ? '7. 数据保留' : '7. Data Retention'}
            </h3>
            <p>
              {language === 'zh' 
                ? '我们将在以下期限内保留您的信息：\n• 账户信息：账户存续期间及注销后2年\n• 交易记录：7年（遵守税法要求）\n• 日志信息：30天\n•  Cookie：根据类型，会话期间或最长1年'
                : 'We will retain your information for the following periods:\n• Account Information: During account existence and 2 years after deletion\n• Transaction Records: 7 years (to comply with tax law requirements)\n• Log Information: 30 days\n• Cookies: Depending on type, during session or up to 1 year'}
            </p>
            
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
              {language === 'zh' ? '8. 儿童隐私' : '8. Children\'s Privacy'}
            </h3>
            <p>
              {language === 'zh' 
                ? '本平台服务不面向14岁以下儿童。我们不会故意收集儿童的个人信息。如发现收集了儿童信息，我们将立即删除。'
                : 'Our services are not directed to children under 14. We do not knowingly collect personal information from children. If we discover that we have collected information from a child, we will delete it immediately.'}
            </p>
            
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
              {language === 'zh' ? '9. 政策更新' : '9. Policy Updates'}
            </h3>
            <p>
              {language === 'zh' 
                ? '我们可能会更新本隐私政策。重大变更将通过邮件或平台公告通知您。继续使用服务即表示您接受更新后的政策。'
                : 'We may update this Privacy Policy. Significant changes will be notified to you via email or platform announcements. Continued use of the service indicates your acceptance of the updated policy.'}
            </p>
            
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
              {language === 'zh' ? '10. 联系我们' : '10. Contact Us'}
            </h3>
            <p>
              {language === 'zh' 
                ? '如您对隐私政策有任何疑问或行使您的权利，请联系：\n邮箱：haocx2006@outlook.com\n地址：中国'
                : 'If you have any questions about the Privacy Policy or wish to exercise your rights, please contact:\nEmail: haocx2006@outlook.com\nAddress: China'}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
