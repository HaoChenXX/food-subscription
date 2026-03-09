import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import type { OrderStatus } from '@/types';
import { useUIStore } from '@/store';
import { t } from '@/lib/i18n';

// 演示订单数据（直接内嵌，不依赖后端）
const demoOrdersData = [
  {
    id: 'ORD202503080001',
    user_id: 3,
    package_id: 1,
    package_name: '健康减脂套餐',
    package_image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop',
    quantity: 1,
    total_amount: 89,
    status: 'pending_payment' as OrderStatus,
    delivery_address: JSON.stringify({ province: '北京市', city: '北京市', district: '朝阳区', address: '建国路88号SOHO现代城' }),
    contact_name: '张三',
    contact_phone: '13700137000',
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'ORD202503070002',
    user_id: 3,
    package_id: 2,
    package_name: '增肌能量套餐',
    package_image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=800&auto=format&fit=crop',
    quantity: 1,
    total_amount: 129,
    status: 'preparing' as OrderStatus,
    delivery_address: JSON.stringify({ province: '北京市', city: '北京市', district: '海淀区', address: '中关村大街1号' }),
    contact_name: '张三',
    contact_phone: '13700137000',
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'ORD202503030003',
    user_id: 3,
    package_id: 3,
    package_name: '地中海风味套餐',
    package_image: 'https://images.unsplash.com/photo-1543339308-43e59d6b73a6?w=800&auto=format&fit=crop',
    quantity: 2,
    total_amount: 318,
    status: 'delivered' as OrderStatus,
    delivery_address: JSON.stringify({ province: '北京市', city: '北京市', district: '西城区', address: '金融大街7号' }),
    contact_name: '张三',
    contact_phone: '13700137000',
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  }
];
import {
  ShoppingBag,
  Clock,
  CheckCircle2,
  Truck,
  Package,
  XCircle,
  ChevronRight,
  Calendar,
  MapPin,
  Loader2,
  RefreshCw,
} from 'lucide-react';

// 后端返回的订单数据格式 - 使用与后端一致的字段名
interface BackendOrder {
  id: string;
  user_id: number;
  package_id: number;
  quantity: number;
  total_amount: number;
  status: OrderStatus;
  delivery_address: string;
  contact_name?: string;
  contact_phone?: string;
  payment_method?: string;
  payment_time?: string;
  created_at: string;
  updated_at: string;
  package_name?: string;
  package_image?: string;
  remark?: string;
}

const statusConfig: Record<OrderStatus, { labelKey: string; color: string; icon: React.ElementType }> = {
  pending_payment: { labelKey: 'orders.status.pending', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  paid: { labelKey: 'orders.status.paid', color: 'bg-blue-100 text-blue-700', icon: CheckCircle2 },
  preparing: { labelKey: 'orders.status.preparing', color: 'bg-orange-100 text-orange-700', icon: Package },
  shipped: { labelKey: 'orders.status.shipped', color: 'bg-purple-100 text-purple-700', icon: Truck },
  delivered: { labelKey: 'orders.status.delivered', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
  cancelled: { labelKey: 'orders.status.cancelled', color: 'bg-gray-100 text-gray-700', icon: XCircle },
  refunded: { labelKey: 'orders.status.refunded', color: 'bg-gray-100 text-gray-700', icon: XCircle },
};

export default function Orders() {
  const location = useLocation();
  const [orders, setOrders] = useState<BackendOrder[]>([]);
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { language } = useUIStore();

  const orderTabs = [
    { value: 'all', label: t('orders.status.all', language) },
    { value: 'pending_payment', label: t('orders.status.pending', language) },
    { value: 'processing', label: t('orders.inProgress', language) },
    { value: 'completed', label: t('orders.completed', language) },
  ];

  // 加载订单列表 - 使用假数据
  const loadOrders = async () => {
    try {
      setRefreshing(true);
      console.log('使用演示订单数据');
      // 直接返回假数据，不调用API
      setOrders(demoOrdersData);
    } catch (error: any) {
      console.error('加载订单失败:', error);
      toast.error(error.message || '加载订单失败');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // 页面加载时刷新
  useEffect(() => {
    loadOrders();
  }, []);

  // 从详情页返回时刷新
  useEffect(() => {
    // 检查是否是支付后返回
    const shouldRefresh = localStorage.getItem('shouldRefreshOrders');
    if (shouldRefresh || location.state?.refresh) {
      loadOrders();
      localStorage.removeItem('shouldRefreshOrders');
    }
  }, [location.key, location.state]);

  // 过滤订单
  const filteredOrders = orders.filter(order => {
    if (activeTab === 'all') return true;
    if (activeTab === 'pending_payment') return order.status === 'pending_payment';
    if (activeTab === 'processing') return ['paid', 'preparing', 'shipped'].includes(order.status);
    if (activeTab === 'completed') return ['delivered', 'cancelled', 'refunded'].includes(order.status);
    return true;
  });

  // 解析配送地址
  const parseAddress = (addressStr: string) => {
    try {
      const parsed = JSON.parse(addressStr);
      // 如果已经是对象格式，直接返回
      if (typeof parsed === 'object' && parsed !== null) {
        return parsed;
      }
      return { province: '', city: '', district: '', address: '未知地址' };
    } catch {
      return { province: '', city: '', district: '', address: '未知地址' };
    }
  };

  // 格式化日期
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString(language === 'zh' ? 'zh-CN' : 'en-US');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-green-600" />
          <p className="text-gray-500">{t('orders.loading', language)}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-2">{t('orders.title', language)}</h1>
          <p className="text-gray-500">{t('orders.subtitle', language)}</p>
        </div>
        <Button variant="outline" onClick={loadOrders} disabled={refreshing}>
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          {t('orders.refresh', language)}
        </Button>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <ShoppingBag className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">{orders.length}</div>
              <div className="text-sm text-gray-500">{t('orders.total', language)}</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center space-x-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">
                {orders.filter(o => o.status === 'pending_payment').length}
              </div>
              <div className="text-sm text-gray-500">{t('orders.pending', language)}</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center space-x-4">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <Truck className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">
                {orders.filter(o => ['paid', 'preparing', 'shipped'].includes(o.status)).length}
              </div>
              <div className="text-sm text-gray-500">{t('orders.inProgress', language)}</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center space-x-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">
                {orders.filter(o => o.status === 'delivered').length}
              </div>
              <div className="text-sm text-gray-500">{t('orders.completed', language)}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 订单列表 */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-flex">
          {orderTabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingBag className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">{t('orders.empty', language)}</h3>
              <p className="text-gray-500 mb-4">{t('orders.emptySubtitle', language)}</p>
              <Button asChild className="bg-green-600 hover:bg-green-700">
                <Link to="/packages">{t('orders.goShopping', language)}</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => {
                const status = statusConfig[order.status];
                const StatusIcon = status.icon;
                const address = parseAddress(order.delivery_address || '{}');
                
                return (
                  <Card key={order.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4 lg:p-6">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-4">
                        <div className="flex items-center space-x-4 mb-2 lg:mb-0">
                          <span className="text-sm text-gray-500">{t('orders.orderNo', language)}：{order.id}</span>
                          <span className="text-sm text-gray-500">
                            <Calendar className="w-4 h-4 inline mr-1" />
                            {formatDate(order.created_at)}
                          </span>
                        </div>
                        <Badge className={`${status.color} w-fit`}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {t(status.labelKey, language)}
                        </Badge>
                      </div>

                      <div className="flex flex-col lg:flex-row lg:items-center justify-between">
                        <div className="flex items-start space-x-4 mb-4 lg:mb-0">
                          <img
                            src={order.package_image || '/placeholder.png'}
                            alt={order.package_name || '商品'}
                            className="w-20 h-20 object-cover rounded-lg"
                          />
                          <div>
                            <h4 className="font-medium text-lg">{order.package_name || '商品'}</h4>
                            <div className="flex items-center text-sm text-gray-500 mt-1">
                              <MapPin className="w-4 h-4 mr-1" />
                              {address.province} {address.city} {address.district}
                            </div>
                            <div className="flex items-center space-x-4 mt-2">
                              <span className="text-sm text-gray-500">
                                {t('common.quantity', language)}：{order.quantity}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col lg:items-end">
                          <div className="text-2xl font-bold text-green-600 mb-2">
                            ¥{order.total_amount}
                          </div>
                          <Button variant="ghost" size="sm" className="text-green-600" asChild>
                            <Link to={`/orders/${order.id}`}>
                              {t('orders.viewDetail', language)}
                              <ChevronRight className="w-4 h-4 ml-1" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
