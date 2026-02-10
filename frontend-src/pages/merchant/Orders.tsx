import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
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
  DialogFooter,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { orderApi } from '@/api';
import type { Order, OrderStatus } from '@/types';
import {
  Search,
  Filter,
  Eye,
  Package,
  Truck,
  CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';

// 订单状态配置
const statusConfig: Record<OrderStatus, { label: string; color: string }> = {
  pending_payment: { label: '待支付', color: 'bg-yellow-100 text-yellow-700' },
  paid: { label: '已支付', color: 'bg-blue-100 text-blue-700' },
  preparing: { label: '准备中', color: 'bg-orange-100 text-orange-700' },
  shipped: { label: '配送中', color: 'bg-purple-100 text-purple-700' },
  delivered: { label: '已送达', color: 'bg-green-100 text-green-700' },
  cancelled: { label: '已取消', color: 'bg-gray-100 text-gray-700' },
  refunded: { label: '已退款', color: 'bg-gray-100 text-gray-700' },
};

// 订单标签页
const orderTabs = [
  { value: 'all', label: '全部' },
  { value: 'pending', label: '待处理' },
  { value: 'processing', label: '进行中' },
  { value: 'completed', label: '已完成' },
];

export default function MerchantOrders() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  // 获取订单列表
  const { data: orders, isLoading } = useQuery({
    queryKey: ['merchantOrders'],
    queryFn: () => orderApi.getAll('1')
  });

  // 更新订单状态 mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: OrderStatus }) =>
      orderApi.updateStatus(orderId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merchantOrders'] });
      toast.success('订单状态更新成功');
      setShowDetailDialog(false);
      setSelectedOrder(null);
    },
    onError: () => {
      toast.error('订单状态更新失败');
    }
  });

  // 过滤订单
  const filteredOrders = orders?.filter(order => {
    if (searchQuery && !order.id.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !order.packageName.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (activeTab === 'pending') {
      return ['pending_payment', 'paid'].includes(order.status);
    }
    if (activeTab === 'processing') {
      return ['preparing', 'shipped'].includes(order.status);
    }
    if (activeTab === 'completed') {
      return ['delivered', 'cancelled', 'refunded'].includes(order.status);
    }
    return true;
  });

  const handleViewDetail = (order: Order) => {
    setSelectedOrder(order);
    setShowDetailDialog(true);
  };

  const handleUpdateStatus = (orderId: string, newStatus: OrderStatus) => {
    updateStatusMutation.mutate({ orderId, status: newStatus });
  };

  // 获取可执行的操作
  const getAvailableActions = (order: Order) => {
    const actions = [];
    if (order.status === 'paid') {
      actions.push({
        label: '开始准备',
        status: 'preparing' as OrderStatus,
        icon: Package,
        color: 'bg-blue-600 hover:bg-blue-700'
      });
    }
    if (order.status === 'preparing') {
      actions.push({
        label: '标记发货',
        status: 'shipped' as OrderStatus,
        icon: Truck,
        color: 'bg-purple-600 hover:bg-purple-700'
      });
    }
    if (order.status === 'shipped') {
      actions.push({
        label: '确认送达',
        status: 'delivered' as OrderStatus,
        icon: CheckCircle,
        color: 'bg-green-600 hover:bg-green-700'
      });
    }
    return actions;
  };

  if (isLoading) {
    return (
      <div className="p-4 lg:p-6 space-y-6">
        <div>
          <Skeleton className="h-8 w-32 mb-2" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-10 w-full" />
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-64" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-2xl font-bold mb-2">订单管理</h1>
        <p className="text-gray-500">查看和处理客户订单</p>
      </div>

      {/* 搜索和过滤 */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="搜索订单号或商品名称..."
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
                    <TableHead>商品</TableHead>
                    <TableHead>金额</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>下单时间</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                        暂无订单数据
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredOrders?.map((order) => {
                      const status = statusConfig[order.status];
                      return (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">{order.id}</TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <img
                                src={order.packageImage}
                                alt={order.packageName}
                                className="w-10 h-10 object-cover rounded"
                              />
                              <span className="truncate max-w-[150px]">
                                {order.packageName}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">¥{order.totalAmount}</div>
                            <div className="text-sm text-gray-500">×{order.quantity}</div>
                          </TableCell>
                          <TableCell>
                            <Badge className={status.color}>{status.label}</Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(order.createdAt).toLocaleDateString()}
                          </TableCell>
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
            <DialogTitle>订单详情</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              {/* 订单信息 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-gray-500 text-sm">订单号</span>
                  <p className="font-medium">{selectedOrder.id}</p>
                </div>
                <div>
                  <span className="text-gray-500 text-sm">下单时间</span>
                  <p className="font-medium">
                    {new Date(selectedOrder.createdAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500 text-sm">商品</span>
                  <p className="font-medium">{selectedOrder.packageName}</p>
                </div>
                <div>
                  <span className="text-gray-500 text-sm">数量</span>
                  <p className="font-medium">×{selectedOrder.quantity}</p>
                </div>
                <div>
                  <span className="text-gray-500 text-sm">订单金额</span>
                  <p className="font-medium text-lg text-blue-600">
                    ¥{selectedOrder.totalAmount}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500 text-sm">状态</span>
                  <p>
                    <Badge className={statusConfig[selectedOrder.status].color}>
                      {statusConfig[selectedOrder.status].label}
                    </Badge>
                  </p>
                </div>
              </div>

              {/* 配送信息 */}
              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">配送信息</h4>
                <div className="space-y-2 text-sm">
                  <p>
                    <span className="text-gray-500">收货人：</span>
                    {selectedOrder.address.name} {selectedOrder.address.phone}
                  </p>
                  <p>
                    <span className="text-gray-500">配送地址：</span>
                    {selectedOrder.address.province} {selectedOrder.address.city}{' '}
                    {selectedOrder.address.district} {selectedOrder.address.address}
                  </p>
                  <p>
                    <span className="text-gray-500">配送日期：</span>
                    {selectedOrder.deliveryDate}
                  </p>
                  <p>
                    <span className="text-gray-500">配送时段：</span>
                    {selectedOrder.deliveryTimeSlot}
                  </p>
                </div>
              </div>

              {/* 操作按钮 */}
              <DialogFooter className="gap-2">
                {getAvailableActions(selectedOrder).map((action) => {
                  const Icon = action.icon;
                  return (
                    <Button
                      key={action.status}
                      className={action.color}
                      onClick={() => handleUpdateStatus(selectedOrder.id, action.status)}
                      disabled={updateStatusMutation.isPending}
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {updateStatusMutation.isPending ? '处理中...' : action.label}
                    </Button>
                  );
                })}
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
