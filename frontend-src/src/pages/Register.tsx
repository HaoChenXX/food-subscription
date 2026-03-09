import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Eye, EyeOff, Loader2, ArrowLeft, User, Store, FileText, Shield } from 'lucide-react';
import { useAuthStore, useUIStore } from '@/store';
import { t } from '@/lib/i18n';
import api from '@/api';

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const { language } = useUIStore();
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [termsDialogOpen, setTermsDialogOpen] = useState(false);
  const [privacyDialogOpen, setPrivacyDialogOpen] = useState(false);
  
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
      toast.success(t('auth.register.success', language));
      navigate('/diet-profile');
    },
    onError: (error: Error) => {
      toast.error(error.message || t('auth.register.error', language));
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (form.password !== form.confirmPassword) {
      toast.error(t('auth.register.passwordMismatch', language));
      return;
    }
    
    if (!agreeTerms) {
      toast.error(t('auth.login.agreeRequired', language));
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
                  <button
                    type="button"
                    onClick={() => setTermsDialogOpen(true)}
                    className="text-green-600 hover:text-green-700 underline"
                  >
                    {t('auth.register.terms', language)}
                  </button>
                  {' '}{t('auth.register.and', language)}{' '}
                  <button
                    type="button"
                    onClick={() => setPrivacyDialogOpen(true)}
                    className="text-amber-600 hover:text-amber-700 underline"
                  >
                    {t('auth.register.privacy', language)}
                  </button>
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

      {/* 服务条款弹窗 */}
      <Dialog open={termsDialogOpen} onOpenChange={setTermsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <FileText className="w-5 h-5 mr-2 text-green-600" />
              {t('auth.terms.title', language)}
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
                ? '2.1 用户须年满18周岁或达到法定成年年龄方可注册使用本平台服务。2.2 用户应提供真实、准确、完整的注册信息，并及时更新。2.3 用户对其账户下的所有活动负责，应妥善保管账户密码。'
                : '2.1 Users must be at least 18 years old or of legal age to register and use the Platform services. 2.2 Users should provide true, accurate, and complete registration information and update it promptly. 2.3 Users are responsible for all activities under their account and should properly safeguard their account password.'}
            </p>
            
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
              {language === 'zh' ? '3. 订阅服务' : '3. Subscription Services'}
            </h3>
            <p>
              {language === 'zh' 
                ? '3.1 用户可根据个人饮食画像定制订阅计划。3.2 订阅周期可选择每周、每两周或每月配送。3.3 用户可在订阅周期结束前随时暂停或取消订阅。3.4 食材包内容可能因季节、供应链情况而有所调整。'
                : '3.1 Users can customize subscription plans based on their personal dietary profiles. 3.2 Subscription cycles can be set for weekly, bi-weekly, or monthly delivery. 3.3 Users can pause or cancel subscriptions at any time before the subscription cycle ends. 3.4 Food package contents may be adjusted based on seasonality and supply chain conditions.'}
            </p>
            
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
              {language === 'zh' ? '4. 价格与支付' : '4. Pricing and Payment'}
            </h3>
            <p>
              {language === 'zh' 
                ? '4.1 所有价格以人民币计价，包含适用税费。4.2 本平台支持多种支付方式，包括支付宝、微信支付等。4.3 订阅费用将在每个配送周期开始前收取。4.4 如配送失败非因本平台原因造成，可能产生额外费用。'
                : '4.1 All prices are in RMB and include applicable taxes. 4.2 The Platform supports multiple payment methods, including Alipay, WeChat Pay, etc. 4.3 Subscription fees will be charged before the start of each delivery cycle. 4.4 Additional fees may apply for failed deliveries not caused by the Platform.'}
            </p>
            
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
              {language === 'zh' ? '5. 配送与退换' : '5. Delivery and Returns'}
            </h3>
            <p>
              {language === 'zh' 
                ? '5.1 本平台承诺食材新鲜度，所有食材均为当天采摘或近期生产。5.2 如收到食材存在质量问题，用户可在收货后24小时内申请退换。5.3 因用户提供的地址不准确导致的配送失败，本平台不承担责任。'
                : '5.1 The Platform guarantees food freshness; all ingredients are freshly picked or recently produced. 5.2 If there are quality issues with received food, users can apply for return or exchange within 24 hours of receipt. 5.3 The Platform is not responsible for failed deliveries caused by inaccurate addresses provided by users.'}
            </p>
            
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
              {language === 'zh' ? '6. 商家条款' : '6. Merchant Terms'}
            </h3>
            <p>
              {language === 'zh' 
                ? '6.1 入驻商家须具备合法的经营资质和食品安全许可证。6.2 商家应保证所售商品的质量和安全，承担相应的售后责任。6.3 平台有权对商家商品进行抽检，不合格商品将下架处理。'
                : '6.1 Merchants must have valid business licenses and food safety permits. 6.2 Merchants should guarantee the quality and safety of products sold and bear corresponding after-sales responsibilities. 6.3 The Platform reserves the right to conduct spot checks on merchant products; non-compliant products will be removed from sale.'}
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
                ? '8.1 因不可抗力导致的服务中断，本平台不承担责任。8.2 用户因个人原因导致的损失，本平台不承担责任。8.3 第三方链接的内容由第三方负责，本平台不承担责任。'
                : '8.1 The Platform is not responsible for service interruptions caused by force majeure. 8.2 The Platform is not responsible for losses caused by users personal reasons. 8.3 The Platform is not responsible for content from third-party links, which is the responsibility of the third party.'}
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
                ? '我们可能收集以下类型的信息：账户信息（姓名、邮箱、手机号、密码）；个人资料（头像、性别、年龄、饮食偏好、健康目标）；地址信息（配送地址、收货人姓名和电话）；交易信息（订单记录、支付信息、订阅计划）；设备信息（IP地址、浏览器类型、设备标识）'
                : 'We may collect the following types of information: Account Information (Name, email, phone number, password); Profile Information (Avatar, gender, age, dietary preferences, health goals); Address Information (Delivery address, recipient name and phone); Transaction Information (Order history, payment information, subscription plans); Device Information (IP address, browser type, device identifier)'}
            </p>
            
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
              {language === 'zh' ? '2. 信息使用' : '2. Information Usage'}
            </h3>
            <p>
              {language === 'zh' 
                ? '我们使用收集的信息用于：提供、维护和改进我们的服务；处理订单和配送；个性化推荐食材包和食谱；发送订单状态和促销信息；防范欺诈和安全风险；遵守法律法规要求'
                : 'We use collected information to: Provide, maintain, and improve our services; Process orders and deliveries; Personalize food package and recipe recommendations; Send order status and promotional information; Prevent fraud and security risks; Comply with legal and regulatory requirements'}
            </p>
            
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
              {language === 'zh' ? '3. 信息共享' : '3. Information Sharing'}
            </h3>
            <p>
              {language === 'zh' 
                ? '我们不会出售您的个人信息。仅在以下情况下可能共享信息：与入驻商家共享订单配送所需的必要信息；与物流服务提供商共享配送地址和联系方式；与支付服务提供商处理交易；根据法律要求向政府部门披露；在合并、收购或资产转让时'
                : 'We do not sell your personal information. We may share information only in the following circumstances: With merchant partners for order delivery necessities; With logistics service providers for delivery address and contact information; With payment service providers to process transactions; With government agencies as required by law; In the event of a merger, acquisition, or asset transfer'}
            </p>
            
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
              {language === 'zh' ? '4. 信息安全' : '4. Information Security'}
            </h3>
            <p>
              {language === 'zh' 
                ? '我们采取多种安全措施保护您的信息：使用SSL/TLS加密传输数据；密码采用 bcrypt 加密存储；定期安全审计和漏洞扫描；严格限制内部数据访问权限；数据备份和灾难恢复机制'
                : 'We employ various security measures to protect your information: Use SSL/TLS encryption for data transmission; Store passwords encrypted with bcrypt; Regular security audits and vulnerability scans; Strictly limit internal data access permissions; Data backup and disaster recovery mechanisms'}
            </p>
            
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
              {language === 'zh' ? '5. Cookie 使用' : '5. Cookie Usage'}
            </h3>
            <p>
              {language === 'zh' 
                ? '我们使用 Cookie 和类似技术来：保持您的登录状态；记住您的偏好设置（如语言、主题）；分析网站流量和用户行为；提供个性化内容推荐。您可以在浏览器设置中管理 Cookie 偏好。'
                : 'We use cookies and similar technologies to: Maintain your login status; Remember your preferences (such as language, theme); Analyze website traffic and user behavior; Provide personalized content recommendations. You can manage cookie preferences in your browser settings.'}
            </p>
            
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
              {language === 'zh' ? '6. 您的权利' : '6. Your Rights'}
            </h3>
            <p>
              {language === 'zh' 
                ? '您对个人信息拥有以下权利：访问权（查看我们持有的您的信息）；更正权（更正不准确或不完整的信息）；删除权（要求删除您的个人信息）；限制处理权（限制对您信息的处理）；数据可携带权（导出您的数据）；反对权（反对某些类型的数据处理）'
                : 'You have the following rights regarding your personal information: Right to Access (View the information we hold about you); Right to Rectification (Correct inaccurate or incomplete information); Right to Erasure (Request deletion of your personal information); Right to Restrict Processing (Restrict processing of your information); Right to Data Portability (Export your data); Right to Object (Object to certain types of data processing)'}
            </p>
            
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
              {language === 'zh' ? '7. 联系我们' : '7. Contact Us'}
            </h3>
            <p>
              {language === 'zh' 
                ? '如您对隐私政策有任何疑问或行使您的权利，请联系：邮箱：haocx2006@outlook.com'
                : 'If you have any questions about the Privacy Policy or wish to exercise your rights, please contact: Email: haocx2006@outlook.com'}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
