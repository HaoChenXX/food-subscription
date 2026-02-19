import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { api } from '@/api/api';
import { toast } from 'sonner';
import type { OrderStatus } from '@/types';
import {
  Search,
  Filter,
  Eye,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  XCircle,
  Loader2,
  RefreshCw,
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
  { value: 'today', label: '今日' },
  { value: 'pending', label: '待处理' },
  { value: 'processing', label: '进行中' },
];

// 后端返回的订单数据格式
interface BackendOrder {
  id: number;
  user_id: number;
  package_id: number;
  quantity: number;
  total_amount: number;
  status: string;
  subscription_type: string;
  delivery_date: string | null;
  delivery_time_slot: string | null;
  delivery_address: string | null;
  created_at: string;
  updated_at: string;
  user_name?: string;
  user_email?: string;
  package_name?: string;
}

interface Statistics {
  users: {
    total: number;
    today: number;
  };
  orders: {
    total: number;
    totalAmount: number;
    today: number;
    todayAmount: number;
    byStatus: { status: string; count: number }[];
  };
  packages: {
    total: number;
    lowStock: number;
  };
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<BackendOrder[]>([]);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<BackendOrder | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // 加载订单数据
  const loadData = async () => {
    try {
      setRefreshing(true);
      const [ordersDataRaw, statsData] = await Promise.all([
        api.admin.getAllOrders(),
        api.admin.getStatistics(),
      ]);
      
      const ordersData = ordersDataRaw as unknown as BackendOrder[];
      
      setOrders(ordersData);
      setStatistics(statsData);
    } catch (error: any) {
      toast.error(error.message || '加载订单数据失败');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // 更新订单状态
  const handleUpdateStatus = async (orderId: number, newStatus: string) => {
    try {
      await api.admin.updateOrderStatus(orderId.toString(), newStatus);
      toast.success('订单状态已更新');
      loadData(); // 刷新数据
    } catch (error: any) {
      toast.error(error.message || '更新订单状态失败');
    }
  };

  // 过滤订单
  const filteredOrders = orders.filter(order => {
    // 搜索过滤
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      const matchId = order.id.toString().includes(searchLower);
      const matchCustomer = order.user_name?.toLowerCase().includes(searchLower);
      const matchPackage = order.package_name?.toLowerCase().includes(searchLower);
      if (!matchId && !matchCustomer && !matchPackage) {
        return false;
      }
    }
    
    // 标签过滤
    if (activeTab === 'today') {
      const today = new Date().toISOString().split('T')[0];
      return order.created_at?.startsWith(today);
    }
    if (activeTab === 'pending') {
      return ['pending_payment', 'paid', 'preparing'].includes(order.status);
    }
    if (activeTab === 'processing') {
      return ['shipped', 'delivered'].includes(order.status);
    }
    return true;
  });

  // 统计数据
  const totalOrders = statistics?.orders.total || orders.length || 0;
  const todayOrders = statistics?.orders.today || 0;
  const pendingOrders = statistics?.orders.byStatus?.find(
    s => ['pending_payment', 'paid', 'preparing'].includes(s.status)
  )?.count || orders.filter(o => ['pending_payment', 'paid', 'preparing'].includes(o.status)).length;
  const totalRevenue = statistics?.orders.totalAmount || orders.reduce((sum, o) => sum + (o.total_amount || 0), 0);

  const handleViewDetail = (order: BackendOrder) => {
    setSelectedOrder(order);
    setShowDetailDialog(true);
  };

  // 获取状态显示
  const getStatusDisplay = (status: string) => {
    const config = statusConfig[status as OrderStatus] || { 
      label: status, 
      color: 'bg-gray-100 text-gray-700', 
      icon: Package 
    };
    return config;
  };

  // 格式化金额
  const formatAmount = (amount: number) => {
    return `¥${(amount || 0).toFixed(2)}`;
  };

  // 格式化日期
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('zh-CN');
  };

  if (loading) {
    return (
      <div className="p-4 lg:p-6 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
          <p className="text-gray-500">加载订单数据中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-2">订单管理</h1>
          <p className="text-gray-500">查看和管理平台所有订单</p>
        </div>
        <Button 
          variant="outline" 
          onClick={loadData}
          disabled={refreshing}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          刷新
        </Button>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{totalOrders}</div>
            <div className="text-sm text-gray-500">总订单</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{todayOrders}</div>
            <div className="text-sm text-gray-500">今日订单</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600">{pendingOrders}</div>
            <div className="text-sm text-gray-500">待处理</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{formatAmount(totalRevenue)}</div>
            <div className="text-sm text-gray-500">总营收</div>
          </CardContent>
        </Card>
      </div>

      {/* 搜索和过滤 */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="搜索订单号、客户或商品..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline">
          <Filter className="w-4 h-4 mr-2" />
          筛选
        </Button>
      </div>

      {/* 订单列表 */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-flex">
          {orderTabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>订单号</TableHead>
                    <TableHead>客户</TableHead>
                    <TableHead>商品</TableHead>
                    <TableHead>金额</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>下单时间</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                        暂无订单数据
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredOrders.map((order) => {
                      const status = getStatusDisplay(order.status);
                      const StatusIcon = status.icon;
                      
                      return (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">#{order.id}</TableCell>
                          <TableCell>
                            <div>
                              <div>{order.user_name || '未知用户'}</div>
                              <div className="text-sm text-gray-500">{order.user_email}</div>
                            </div>
                          </TableCell>
                          <TableCell>{order.package_name || '未知商品'}</TableCell>
                          <TableCell className="font-medium">{formatAmount(order.total_amount)}</TableCell>
                          <TableCell>
                            <Badge className={status.color}>
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {status.label}
                            </Badge>
                          </TableCell>
                          <TableCell>{formatDate(order.created_at)}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewDetail(order)}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              查看
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 订单详情对话框 */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>订单详情 #{selectedOrder?.id}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-500">订单号</div>
                  <div className="font-medium">#{selectedOrder.id}</div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-500">客户</div>
                  <div className="font-medium">{selectedOrder.user_name || '未知用户'}</div>
                  <div className="text-sm text-gray-500">{selectedOrder.user_email}</div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-500">商品</div>
                  <div className="font-medium">{selectedOrder.package_name || '未知商品'}</div>
                  <div className="text-sm text-gray-500">数量: {selectedOrder.quantity}</div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-500">金额</div>
                  <div className="font-medium text-green-600 text-lg">{formatAmount(selectedOrder.total_amount)}</div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-500">状态</div>
                  <Badge className={getStatusDisplay(selectedOrder.status).color}>
                    {getStatusDisplay(selectedOrder.status).label}
                  </Badge>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-500">订阅类型</div>
                  <div className="font-medium">
                    {selectedOrder.subscription_type === 'weekly' && '周订阅'}
                    {selectedOrder.subscription_type === 'monthly' && '月订阅'}
                    {selectedOrder.subscription_type === 'quarterly' && '季度订阅'}
                    {!selectedOrder.subscription_type && '单次购买'}
                  </div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-500">下单时间</div>
                  <div className="font-medium">{formatDate(selectedOrder.created_at)}</div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-500">配送日期</div>
                  <div className="font-medium">{formatDate(selectedOrder.delivery_date)}</div>
                </div>
              </div>

              {/* 状态操作按钮 */}
              <div className="flex flex-wrap gap-2">
                {selectedOrder.status === 'pending_payment' && (
                  <Button 
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                    onClick={() => handleUpdateStatus(selectedOrder.id, 'paid')}
                  >
                    标记为已支付
                  </Button>
                )}
                {selectedOrder.status === 'paid' && (
                  <Button 
                    className="flex-1 bg-orange-600 hover:bg-orange-700"
                    onClick={() => handleUpdateStatus(selectedOrder.id, 'preparing')}
                  >
                    开始准备
                  </Button>
                )}
                {selectedOrder.status === 'preparing' && (
                  <Button 
                    className="flex-1 bg-purple-600 hover:bg-purple-700"
                    onClick={() => handleUpdateStatus(selectedOrder.id, 'shipped')}
                  >
                    标记配送中
                  </Button>
                )}
                {selectedOrder.status === 'shipped' && (
                  <Button 
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={() => handleUpdateStatus(selectedOrder.id, 'delivered')}
                  >
                    标记已送达
                  </Button>
                )}
                {(selectedOrder.status === 'pending_payment' || selectedOrder.status === 'paid') && (
                  <Button 
                    variant="outline"
                    className="flex-1 text-red-600 hover:text-red-700"
                    onClick={() => handleUpdateStatus(selectedOrder.id, 'cancelled')}
                  >
                    取消订单
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
