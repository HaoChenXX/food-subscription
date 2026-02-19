import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { api } from '@/api/api';
import { toast } from 'sonner';
import type { OrderStatus } from '@/types';
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

// 后端返回的订单数据格式
interface BackendOrder {
  id: string;
  user_id: number;
  package_id: number;
  quantity: number;
  total_amount: number;
  status: OrderStatus;
  delivery_date: string | null;
  delivery_time_slot: string | null;
  delivery_address: string;
  created_at: string;
  updated_at: string;
  package_name?: string;
  package_image?: string;
  contact_name?: string;
  contact_phone?: string;
}

const statusConfig: Record<OrderStatus, { label: string; color: string; icon: React.ElementType }> = {
  pending_payment: { label: '待支付', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  paid: { label: '已支付', color: 'bg-blue-100 text-blue-700', icon: CheckCircle2 },
  preparing: { label: '准备中', color: 'bg-orange-100 text-orange-700', icon: Package },
  shipped: { label: '配送中', color: 'bg-purple-100 text-purple-700', icon: Truck },
  delivered: { label: '已送达', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
  cancelled: { label: '已取消', color: 'bg-gray-100 text-gray-700', icon: XCircle },
  refunded: { label: '已退款', color: 'bg-gray-100 text-gray-700', icon: XCircle },
};

const orderTabs = [
  { value: 'all', label: '全部' },
  { value: 'pending_payment', label: '待支付' },
  { value: 'processing', label: '进行中' },
  { value: 'completed', label: '已完成' },
];

export default function Orders() {
  const location = useLocation();
  const [orders, setOrders] = useState<BackendOrder[]>([]);
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // 加载订单列表
  const loadOrders = async () => {
    try {
      setRefreshing(true);
      const data = await api.orders.getAll() as unknown as BackendOrder[];
      setOrders(data);
    } catch (error: any) {
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
    loadOrders();
  }, [location.key]);

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
      return JSON.parse(addressStr);
    } catch {
      return { province: '', city: '', district: '', address: '未知地址' };
    }
  };

  // 格式化日期
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('zh-CN');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-green-600" />
          <p className="text-gray-500">加载订单中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-2">我的订单</h1>
          <p className="text-gray-500">查看和管理您的所有订单</p>
        </div>
        <Button variant="outline" onClick={loadOrders} disabled={refreshing}>
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          刷新
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
              <div className="text-sm text-gray-500">总订单</div>
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
              <div className="text-sm text-gray-500">待支付</div>
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
              <div className="text-sm text-gray-500">进行中</div>
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
              <div className="text-sm text-gray-500">已完成</div>
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
              <h3 className="text-lg font-medium text-gray-900 mb-1">暂无订单</h3>
              <p className="text-gray-500 mb-4">您还没有相关订单</p>
              <Button asChild className="bg-green-600 hover:bg-green-700">
                <Link to="/packages">去选购</Link>
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
                          <span className="text-sm text-gray-500">订单号：{order.id}</span>
                          <span className="text-sm text-gray-500">
                            <Calendar className="w-4 h-4 inline mr-1" />
                            {formatDate(order.created_at)}
                          </span>
                        </div>
                        <Badge className={`${status.color} w-fit`}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {status.label}
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
                                数量：{order.quantity}
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
                              查看详情
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
