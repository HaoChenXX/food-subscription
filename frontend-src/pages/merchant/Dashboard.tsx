import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { dashboardApi, orderApi } from '@/api';
import {
  TrendingUp,
  Package,
  ShoppingCart,
  DollarSign,
  AlertTriangle,
  ArrowRight,
  Box
} from 'lucide-react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar
} from 'recharts';

// 模拟销售数据（实际应从API获取）
const salesData = [
  { date: '周一', sales: 1200, orders: 15 },
  { date: '周二', sales: 1800, orders: 22 },
  { date: '周三', sales: 1500, orders: 18 },
  { date: '周四', sales: 2200, orders: 28 },
  { date: '周五', sales: 2800, orders: 35 },
  { date: '周六', sales: 3200, orders: 42 },
  { date: '周日', sales: 2900, orders: 38 },
];

// 库存预警数据
const lowStockItems = [
  { id: '1', name: '西兰花', stock: 15, minStock: 50 },
  { id: '2', name: '大虾', stock: 8, minStock: 30 },
  { id: '3', name: '牛肉', stock: 20, minStock: 40 },
];

export default function MerchantDashboard() {
  // 获取看板统计数据
  const { data: stats, isLoading: isStatsLoading } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: () => dashboardApi.getStats()
  });

  // 获取订单数据
  const { data: orders, isLoading: isOrdersLoading } = useQuery({
    queryKey: ['merchantOrders'],
    queryFn: () => orderApi.getAll('1')
  });

  // 获取最近的订单
  const recentOrders = orders?.slice(0, 4) || [];

  // 格式化金额
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (isStatsLoading || isOrdersLoading) {
    return (
      <div className="p-4 lg:p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-32 mb-2" />
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-20" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-2">商家仪表盘</h1>
          <p className="text-gray-500">查看您的店铺运营数据和销售统计</p>
        </div>
        <Button asChild className="bg-blue-600 hover:bg-blue-700">
          <Link to="/merchant/products">
            <Package className="w-4 h-4 mr-2" />
            管理商品
          </Link>
        </Button>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">今日销售额</p>
                <p className="text-2xl font-bold">
                  {stats ? formatCurrency(stats.revenueToday) : '¥0'}
                </p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +12.5%
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">今日订单</p>
                <p className="text-2xl font-bold">{stats?.ordersToday || 0}</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +8.3%
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">总订单数</p>
                <p className="text-2xl font-bold">{stats?.totalOrders || 0}</p>
                <p className="text-xs text-gray-500 mt-1">累计订单</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Package className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">待处理订单</p>
                <p className="text-2xl font-bold text-orange-500">
                  {stats?.pendingOrders || 0}
                </p>
                <p className="text-xs text-orange-500 mt-1">需要处理</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 图表区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">销售趋势</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="sales"
                  stroke="#10b981"
                  strokeWidth={2}
                  name="销售额"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">订单统计</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="orders" fill="#3b82f6" name="订单数" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* 最近订单和库存预警 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 最近订单 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">最近订单</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/merchant/orders">
                查看全部 <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {recentOrders.length === 0 ? (
                <p className="text-center text-gray-500 py-4">暂无订单</p>
              ) : (
                recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{order.id}</span>
                        <Badge
                          variant="secondary"
                          className={
                            order.status === 'pending_payment'
                              ? 'bg-yellow-100 text-yellow-700'
                              : order.status === 'paid' || order.status === 'preparing'
                              ? 'bg-orange-100 text-orange-700'
                              : order.status === 'shipped'
                              ? 'bg-purple-100 text-purple-700'
                              : 'bg-green-100 text-green-700'
                          }
                        >
                          {order.status === 'pending_payment' && '待支付'}
                          {order.status === 'paid' && '已支付'}
                          {order.status === 'preparing' && '准备中'}
                          {order.status === 'shipped' && '配送中'}
                          {order.status === 'delivered' && '已完成'}
                          {order.status === 'cancelled' && '已取消'}
                          {order.status === 'refunded' && '已退款'}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        {order.packageName} · {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">¥{order.totalAmount}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* 库存预警 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">库存预警</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/merchant/products">
                查看全部 <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {lowStockItems.map((item) => (
                <div key={item.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{item.name}</span>
                    <span className="text-sm text-red-500">
                      {item.stock} / {item.minStock}
                    </span>
                  </div>
                  <Progress
                    value={(item.stock / item.minStock) * 100}
                    className="h-2"
                  />
                  <p className="text-xs text-gray-500">
                    库存不足，建议及时补货
                  </p>
                </div>
              ))}
            </div>
            <Button className="w-full mt-4" variant="outline">
              <Box className="w-4 h-4 mr-2" />
              一键补货
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
