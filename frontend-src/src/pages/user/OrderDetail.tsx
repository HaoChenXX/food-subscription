import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import type { OrderStatus } from '@/types';
import { useUIStore } from '@/store';
import { t } from '@/lib/i18n';

// 演示订单数据（直接内嵌，不依赖后端）
const demoOrdersData: Record<string, BackendOrder> = {
  'ORD202503080001': {
    id: 'ORD202503080001',
    user_id: 3,
    package_id: 1,
    package_name: '健康减脂套餐',
    package_image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop',
    quantity: 1,
    total_amount: 89,
    price: 89,
    status: 'pending_payment',
    delivery_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    delivery_time_slot: '09:00-12:00',
    delivery_address: JSON.stringify({ name: '张三', phone: '13700137000', province: '北京市', city: '北京市', district: '朝阳区', address: '建国路88号SOHO现代城1号楼101室' }),
    contact_name: '张三',
    contact_phone: '13700137000',
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  },
  'ORD202503070002': {
    id: 'ORD202503070002',
    user_id: 3,
    package_id: 2,
    package_name: '增肌能量套餐',
    package_image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=800&auto=format&fit=crop',
    quantity: 1,
    total_amount: 129,
    price: 129,
    status: 'preparing',
    delivery_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    delivery_time_slot: '14:00-18:00',
    delivery_address: JSON.stringify({ name: '张三', phone: '13700137000', province: '北京市', city: '北京市', district: '海淀区', address: '中关村大街1号中关村广场购物中心B2层' }),
    contact_name: '张三',
    contact_phone: '13700137000',
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
  },
  'ORD202503030003': {
    id: 'ORD202503030003',
    user_id: 3,
    package_id: 3,
    package_name: '地中海风味套餐',
    package_image: 'https://images.unsplash.com/photo-1543339308-43e59d6b73a6?w=800&auto=format&fit=crop',
    quantity: 2,
    total_amount: 318,
    price: 159,
    status: 'delivered',
    delivery_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    delivery_time_slot: '09:00-12:00',
    delivery_address: JSON.stringify({ name: '张三', phone: '13700137000', province: '北京市', city: '北京市', district: '西城区', address: '金融大街7号英蓝国际金融中心' }),
    contact_name: '张三',
    contact_phone: '13700137000',
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  }
};
import {
  ArrowLeft,
  Clock,
  CheckCircle2,
  Truck,
  Package,
  MapPin,
  Calendar,
  CreditCard,
  MessageSquare,
  Loader2,
} from 'lucide-react';

// 后端返回的订单数据格式
interface BackendOrder {
  id: string;
  user_id: number;
  package_id: number;
  quantity: number;
  total_amount: number;
  price?: number;
  status: OrderStatus;
  delivery_date: string | null;
  delivery_time_slot: string | null;
  delivery_address: string;
  contact_name?: string;
  contact_phone?: string;
  created_at: string;
  updated_at: string;
  package_name?: string;
  package_image?: string;
}

const statusConfig: Record<OrderStatus, { label: string; color: string; description: string }> = {
  pending_payment: { 
    label: '待支付', 
    color: 'bg-yellow-100 text-yellow-700',
    description: '请在30分钟内完成支付'
  },
  paid: { 
    label: '已支付', 
    color: 'bg-blue-100 text-blue-700',
    description: '订单已确认，正在准备食材'
  },
  preparing: { 
    label: '准备中', 
    color: 'bg-orange-100 text-orange-700',
    description: '食材正在分拣打包中'
  },
  shipped: { 
    label: '配送中', 
    color: 'bg-purple-100 text-purple-700',
    description: '食材已发出，请注意查收'
  },
  delivered: { 
    label: '已送达', 
    color: 'bg-green-100 text-green-700',
    description: '订单已完成，感谢您的订购'
  },
  cancelled: { 
    label: '已取消', 
    color: 'bg-gray-100 text-gray-700',
    description: '订单已取消'
  },
  refunded: { 
    label: '已退款', 
    color: 'bg-gray-100 text-gray-700',
    description: '退款已处理'
  },
};

const timelineSteps = [
  { status: 'pending_payment', label: '提交订单', icon: Clock },
  { status: 'paid', label: '支付成功', icon: CheckCircle2 },
  { status: 'preparing', label: '准备中', icon: Package },
  { status: 'shipped', label: '配送中', icon: Truck },
  { status: 'delivered', label: '已送达', icon: CheckCircle2 },
];

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<BackendOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const { language } = useUIStore();

  // 加载订单详情 - 使用假数据
  const loadOrder = async () => {
    if (!id) return;
    try {
      // 从假数据中查找对应订单，不存在则使用第一个
      const data = demoOrdersData[id] || demoOrdersData['ORD202503080001'];
      setOrder(data);
    } catch (error: any) {
      toast.error(error.message || t('orders.detail.loadError', language));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrder();
  }, [id]);

  // 支付订单 - 使用假数据
  const handlePay = async () => {
    if (!order) return;
    try {
      setPaying(true);
      // 模拟支付成功，直接修改本地数据
      const updatedOrder = { ...order, status: 'paid' as OrderStatus };
      setOrder(updatedOrder);
      demoOrdersData[order.id].status = 'paid';
      toast.success(t('orders.pay.success', language));
      localStorage.setItem('shouldRefreshOrders', 'true');
      // 延迟返回订单列表
      setTimeout(() => {
        navigate('/orders', { state: { refresh: true } });
      }, 1500);
    } catch (error: any) {
      toast.error(error.message || t('orders.pay.error', language));
    } finally {
      setPaying(false);
    }
  };

  // 解析配送地址
  const parseAddress = (addressStr: string) => {
    try {
      return JSON.parse(addressStr);
    } catch {
      return { 
        name: order?.contact_name || '未知', 
        phone: order?.contact_phone || '', 
        province: '', 
        city: '', 
        district: '', 
        address: '未知地址' 
      };
    }
  };

  // 格式化日期
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString('zh-CN');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-bold mb-2">{t('orders.detail.notFound', language)}</h2>
        <Button onClick={() => navigate('/orders')} variant="outline">
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t('orders.backToList', language)}
        </Button>
      </div>
    );
  }

  const status = statusConfig[order.status];
  const currentStepIndex = timelineSteps.findIndex(s => s.status === order.status);
  const address = parseAddress(order.delivery_address || '{}');

  return (
    <div className="p-4 lg:p-6 max-w-4xl mx-auto">
      {/* 返回按钮 */}
      <Button
        variant="ghost"
        className="mb-4"
        onClick={() => navigate('/orders')}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        {t('orders.backToList', language)}
      </Button>

      {/* 订单状态 */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-xl font-bold">{t('orders.orderNo', language)} {order.id}</h1>
                <Badge className={status.color}>
                  {status.label}
                </Badge>
              </div>
              <p className="text-gray-500">
                {t('orders.orderDate', language)}：{formatDate(order.created_at)}
              </p>
            </div>
            <div className="mt-4 lg:mt-0 text-right">
              <div className="text-3xl font-bold text-green-600">
                ¥{order.total_amount}
              </div>
            </div>
          </div>

          {/* 进度条 */}
          {order.status !== 'cancelled' && order.status !== 'refunded' && (
            <div className="relative">
              <div className="flex items-center justify-between">
                {timelineSteps.map((step, index) => {
                  const StepIcon = step.icon;
                  const isCompleted = index <= currentStepIndex;
                  const isCurrent = index === currentStepIndex;
                  
                  return (
                    <div key={step.status} className="flex flex-col items-center relative z-10">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          isCompleted
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-200 text-gray-400'
                        } ${isCurrent ? 'ring-4 ring-green-100' : ''}`}
                      >
                        <StepIcon className="w-5 h-5" />
                      </div>
                      <span
                        className={`text-sm mt-2 ${
                          isCompleted ? 'text-gray-900' : 'text-gray-400'
                        }`}
                      >
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 -z-0">
                <div
                  className="h-full bg-green-500 transition-all"
                  style={{ width: `${(currentStepIndex / (timelineSteps.length - 1)) * 100}%` }}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧：商品信息 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 商品信息 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('orders.detail.productInfo', language)}</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <img
                  src={order.package_image || '/placeholder.png'}
                  alt={order.package_name || t('common.product', language)}
                  className="w-24 h-24 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h3 className="font-medium text-lg">{order.package_name || t('common.product', language)}</h3>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                    <span>{t('orders.quantity', language)}：{order.quantity}</span>
                  </div>
                  <div className="mt-4 text-lg font-medium text-green-600">
                    ¥{order.price || order.total_amount} × {order.quantity} = ¥{order.total_amount}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 配送信息 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('orders.detail.deliveryInfo', language)}</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <div className="text-sm text-gray-500">{t('orders.detail.deliveryDate', language)}</div>
                  <div>{order.delivery_date || t('common.pending', language)}</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-gray-400" />
                <div>
                  <div className="text-sm text-gray-500">{t('orders.detail.deliveryTime', language)}</div>
                  <div>{order.delivery_time_slot || t('common.pending', language)}</div>
                </div>
              </div>
              <Separator />
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <div className="text-sm text-gray-500">{t('checkout.deliveryAddress', language)}</div>
                  <div className="font-medium">{address.name} {address.phone}</div>
                  <div>
                    {address.province} {address.city} {address.district}
                  </div>
                  <div>{address.address}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 右侧：订单信息 */}
        <div className="space-y-6">
          {/* 订单金额 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('orders.detail.amount', language)}</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-500">{t('orders.detail.productAmount', language)}</span>
                <span>¥{order.total_amount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">{t('checkout.shipping', language)}</span>
                <span className="text-green-600">{t('checkout.freeShipping', language)}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>{t('orders.detail.actualAmount', language)}</span>
                <span className="text-green-600">¥{order.total_amount}</span>
              </div>
            </CardContent>
          </Card>

          {/* 支付方式 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('orders.detail.paymentMethod', language)}</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <CreditCard className="w-5 h-5 text-gray-400" />
                <span>{t('payment.online', language)}</span>
              </div>
            </CardContent>
          </Card>

          {/* 操作按钮 */}
          <div className="space-y-3">
            {order.status === 'pending_payment' && (
              <Button 
                className="w-full bg-green-600 hover:bg-green-700"
                onClick={handlePay}
                disabled={paying}
              >
                {paying ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {t('orders.pay.processing', language)}
                  </>
                ) : (
                  t('orders.pay.now', language)
                )}
              </Button>
            )}
            {order.status === 'delivered' && (
              <Button className="w-full" variant="outline">
                <MessageSquare className="w-4 h-4 mr-2" />
                {t('orders.review', language)}
              </Button>
            )}
            <Button variant="outline" className="w-full">
              {t('common.contactService', language)}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
