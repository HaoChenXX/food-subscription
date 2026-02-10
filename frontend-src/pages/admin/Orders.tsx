import { useState } from 'react';
// import { useQuery } from '@tanstack/react-query';
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
// import { mockApi } from '@/api/mock';
import type { OrderStatus } from '@/types';
import {
  Search,
  Filter,
  Eye,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  XCircle
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

// 模拟订单数据
const mockOrders = [
  { id: 'ORD001', customer: '张三', packageName: '健康减脂套餐', total: 89, status: 'delivered', createdAt: '2024-01-20', supplier: '山东禽肉供应商' },
  { id: 'ORD002', customer: '李四', packageName: '增肌力量套餐', total: 258, status: 'shipped', createdAt: '2024-01-22', supplier: '澳洲牛肉进口商' },
  { id: 'ORD003', customer: '王五', packageName: '精品海鲜套餐', total: 199, status: 'preparing', createdAt: '2024-01-23', supplier: '青岛海鲜供应商' },
  { id: 'ORD004', customer: '赵六', packageName: '控糖养生套餐', total: 99, status: 'paid', createdAt: '2024-01-24', supplier: '挪威三文鱼进口商' },
  { id: 'ORD005', customer: '钱七', packageName: '快手新手套餐', total: 69, status: 'pending_payment', createdAt: '2024-01-24', supplier: '本地蔬菜基地' },
];

export default function AdminOrders() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  // 过滤订单
  const filteredOrders = mockOrders.filter(order => {
    if (searchQuery && !order.id.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (activeTab === 'pending') {
      return ['pending_payment', 'paid'].includes(order.status);
    }
    if (activeTab === 'processing') {
      return ['preparing', 'shipped'].includes(order.status);
    }
    return true;
  });

  const handleViewDetail = (order: any) => {
    setSelectedOrder(order);
    setShowDetailDialog(true);
  };

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-2xl font-bold mb-2">订单管理</h1>
        <p className="text-gray-500">查看和管理平台所有订单</p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">3,456</div>
            <div className="text-sm text-gray-500">总订单</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">45</div>
            <div className="text-sm text-gray-500">今日订单</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">12</div>
            <div className="text-sm text-gray-500">待处理</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">¥256,789</div>
            <div className="text-sm text-gray-500">总营收</div>
          </CardContent>
        </Card>
      </div>

      {/* 搜索和过滤 */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="搜索订单号..."
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
                    <TableHead>供应商</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => {
                    const status = statusConfig[order.status as OrderStatus];
                    const StatusIcon = status.icon;
                    
                    return (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.id}</TableCell>
                        <TableCell>{order.customer}</TableCell>
                        <TableCell>{order.packageName}</TableCell>
                        <TableCell className="font-medium">¥{order.total}</TableCell>
                        <TableCell>
                          <Badge className={status.color}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {status.label}
                          </Badge>
                        </TableCell>
                        <TableCell>{order.supplier}</TableCell>
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
                  })}
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
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-500">订单号</div>
                  <div className="font-medium">{selectedOrder.id}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">客户</div>
                  <div className="font-medium">{selectedOrder.customer}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">商品</div>
                  <div className="font-medium">{selectedOrder.packageName}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">金额</div>
                  <div className="font-medium text-green-600">¥{selectedOrder.total}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">状态</div>
                  <Badge className={statusConfig[selectedOrder.status as OrderStatus].color}>
                    {statusConfig[selectedOrder.status as OrderStatus].label}
                  </Badge>
                </div>
                <div>
                  <div className="text-sm text-gray-500">供应商</div>
                  <div className="font-medium">{selectedOrder.supplier}</div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
