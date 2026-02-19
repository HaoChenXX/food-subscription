import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { api } from '@/api/api';
import { toast } from 'sonner';
import type { OrderStatus } from '@/types';
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

  // 加载订单详情
  const loadOrder = async () => {
    if (!id) return;
    try {
      const data = await api.orders.getById(id) as unknown as BackendOrder;
      setOrder(data);
    } catch (error: any) {
      toast.error(error.message || '加载订单详情失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrder();
  }, [id]);

  // 支付订单
  const handlePay = async () => {
    if (!order) return;
    try {
      setPaying(true);
      // 调用支付 API（这里使用 updateOrderStatus 模拟支付）
      await api.orders.update(order.id, { status: 'paid' } as any);
      toast.success('支付成功！');
      loadOrder(); // 刷新订单状态
    } catch (error: any) {
      toast.error(error.message || '支付失败');
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
        <h2 className="text-xl font-bold mb-2">订单不存在</h2>
        <Button onClick={() => navigate('/orders')} variant="outline">
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回订单列表
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
        返回订单列表
      </Button>

      {/* 订单状态 */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-xl font-bold">订单 {order.id}</h1>
                <Badge className={status.color}>
                  {status.label}
                </Badge>
              </div>
              <p className="text-gray-500">
                下单时间：{formatDate(order.created_at)}
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
              <CardTitle className="text-lg">商品信息</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <img
                  src={order.package_image || '/placeholder.png'}
                  alt={order.package_name || '商品'}
                  className="w-24 h-24 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h3 className="font-medium text-lg">{order.package_name || '商品'}</h3>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                    <span>数量：{order.quantity}</span>
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
              <CardTitle className="text-lg">配送信息</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <div className="text-sm text-gray-500">配送日期</div>
                  <div>{order.delivery_date || '待定'}</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-gray-400" />
                <div>
                  <div className="text-sm text-gray-500">配送时段</div>
                  <div>{order.delivery_time_slot || '待定'}</div>
                </div>
              </div>
              <Separator />
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <div className="text-sm text-gray-500">配送地址</div>
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
              <CardTitle className="text-lg">订单金额</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-500">商品金额</span>
                <span>¥{order.total_amount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">运费</span>
                <span className="text-green-600">免运费</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>实付金额</span>
                <span className="text-green-600">¥{order.total_amount}</span>
              </div>
            </CardContent>
          </Card>

          {/* 支付方式 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">支付方式</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <CreditCard className="w-5 h-5 text-gray-400" />
                <span>在线支付</span>
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
                    支付中...
                  </>
                ) : (
                  '立即支付'
                )}
              </Button>
            )}
            {order.status === 'delivered' && (
              <Button className="w-full" variant="outline">
                <MessageSquare className="w-4 h-4 mr-2" />
                评价订单
              </Button>
            )}
            <Button variant="outline" className="w-full">
              联系客服
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
