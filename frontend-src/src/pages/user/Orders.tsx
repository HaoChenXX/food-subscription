import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuthStore, useOrderStore } from '@/store';
import { mockApi } from '@/api/mock';
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
  MapPin
} from 'lucide-react';

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
  const { user } = useAuthStore();
  const { orders, setOrders } = useOrderStore();
  const [activeTab, setActiveTab] = useState('all');

  // 获取订单列表
  const { isLoading } = useQuery({
    queryKey: ['orders', user?.id],
    queryFn: async () => {
      const data = await mockApi.orders.getAll(user?.id || '');
      setOrders(data);
      return data;
    },
    enabled: !!user
  });

  // 过滤订单
  const filteredOrders = orders.filter(order => {
    if (activeTab === 'all') return true;
    if (activeTab === 'pending_payment') return order.status === 'pending_payment';
    if (activeTab === 'processing') return ['paid', 'preparing', 'shipped'].includes(order.status);
    if (activeTab === 'completed') return ['delivered', 'cancelled', 'refunded'].includes(order.status);
    return true;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-2xl font-bold mb-2">我的订单</h1>
        <p className="text-gray-500">查看和管理您的所有订单</p>
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
                
                return (
                  <Card key={order.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4 lg:p-6">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-4">
                        <div className="flex items-center space-x-4 mb-2 lg:mb-0">
                          <span className="text-sm text-gray-500">订单号：{order.id}</span>
                          <span className="text-sm text-gray-500">
                            <Calendar className="w-4 h-4 inline mr-1" />
                            {new Date(order.createdAt).toLocaleDateString()}
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
                            src={order.packageImage}
                            alt={order.packageName}
                            className="w-20 h-20 object-cover rounded-lg"
                          />
                          <div>
                            <h4 className="font-medium text-lg">{order.packageName}</h4>
                            <div className="flex items-center text-sm text-gray-500 mt-1">
                              <MapPin className="w-4 h-4 mr-1" />
                              {order.address.province} {order.address.city} {order.address.district}
                            </div>
                            <div className="flex items-center space-x-4 mt-2">
                              <span className="text-sm text-gray-500">
                                数量：{order.quantity}
                              </span>
                              <span className="text-sm text-gray-500">
                                {order.subscriptionType === 'weekly' && '周订阅'}
                                {order.subscriptionType === 'monthly' && '月订阅'}
                                {order.subscriptionType === 'quarterly' && '季订阅'}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col lg:items-end">
                          <div className="text-2xl font-bold text-green-600 mb-2">
                            ¥{order.totalAmount}
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
