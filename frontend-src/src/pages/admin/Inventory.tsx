import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
// import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { mockApi } from '@/api/mock';
import {
  Search,
  AlertTriangle,
  Package,
  RefreshCw
} from 'lucide-react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
// import { Link } from 'react-router-dom';

// 模拟库存趋势数据
const stockTrendData = [
  { date: '周一', in: 500, out: 300 },
  { date: '周二', in: 400, out: 350 },
  { date: '周三', in: 600, out: 400 },
  { date: '周四', in: 450, out: 380 },
  { date: '周五', in: 550, out: 420 },
  { date: '周六', in: 500, out: 450 },
  { date: '周日', in: 480, out: 400 },
];

// 模拟商品数据
const mockProducts = [
  { id: '1', name: '鸡胸肉', category: '肉类', stock: 500, minStock: 100, price: 25, turnover: 120 },
  { id: '2', name: '西兰花', category: '蔬菜', stock: 80, minStock: 100, price: 12, turnover: 200 },
  { id: '3', name: '牛肉', category: '肉类', stock: 200, minStock: 50, price: 68, turnover: 80 },
  { id: '4', name: '大虾', category: '海鲜', stock: 30, minStock: 50, price: 58, turnover: 60 },
  { id: '5', name: '三文鱼', category: '海鲜', stock: 150, minStock: 40, price: 88, turnover: 45 },
];

export default function AdminInventory() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  // 获取库存统计
  const { data: inventoryStats } = useQuery({
    queryKey: ['inventoryStats'],
    queryFn: () => mockApi.dashboard.getInventoryStats()
  });

  // 过滤商品
  const filteredProducts = mockProducts.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 获取库存预警商品
  const lowStockProducts = mockProducts.filter(p => p.stock < p.minStock);

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-2">库存管理</h1>
          <p className="text-gray-500">监控库存状态，优化库存周转</p>
        </div>
        <Button variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          同步库存
        </Button>
      </div>

      {/* 核心指标 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{inventoryStats?.totalProducts || 156}</div>
            <div className="text-sm text-gray-500">总商品数</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">¥{(inventoryStats?.totalValue || 125678).toLocaleString()}</div>
            <div className="text-sm text-gray-500">库存总值</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{inventoryStats?.turnoverRate || 3.2}</div>
            <div className="text-sm text-gray-500">周转率(次/月)</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-500">{lowStockProducts.length}</div>
            <div className="text-sm text-gray-500">库存预警</div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-flex">
          <TabsTrigger value="overview">库存概览</TabsTrigger>
          <TabsTrigger value="products">商品库存</TabsTrigger>
          <TabsTrigger value="alerts">库存预警</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6 space-y-6">
          {/* 库存趋势图 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">库存出入库趋势</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={stockTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="in" stroke="#10b981" strokeWidth={2} name="入库" />
                  <Line type="monotone" dataKey="out" stroke="#ef4444" strokeWidth={2} name="出库" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* 分类库存 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">分类库存分布</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                {inventoryStats?.categoryDistribution.map((cat) => (
                  <div key={cat.category} className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold">{cat.count}</div>
                    <div className="text-sm text-gray-500">{cat.category}</div>
                    <div className="text-sm text-green-600">¥{cat.value.toLocaleString()}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="mt-6">
          <Card>
            <CardContent className="p-0">
              <div className="p-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="搜索商品..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>商品</TableHead>
                    <TableHead>分类</TableHead>
                    <TableHead>当前库存</TableHead>
                    <TableHead>预警值</TableHead>
                    <TableHead>周转率</TableHead>
                    <TableHead>状态</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => {
                    const isLow = product.stock < product.minStock;
                    return (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{product.category}</Badge>
                        </TableCell>
                        <TableCell>
                          <span className={isLow ? 'text-red-500 font-bold' : ''}>
                            {product.stock}
                          </span>
                        </TableCell>
                        <TableCell>{product.minStock}</TableCell>
                        <TableCell>{product.turnover}/月</TableCell>
                        <TableCell>
                          <Badge className={isLow ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}>
                            {isLow ? '库存不足' : '正常'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2 text-red-500" />
                库存预警商品
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {lowStockProducts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  暂无库存预警商品
                </div>
              ) : (
                <div className="space-y-4">
                  {lowStockProducts.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between p-4 bg-red-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                          <Package className="w-6 h-6 text-red-500" />
                        </div>
                        <div>
                          <div className="font-medium">{product.name}</div>
                          <div className="text-sm text-gray-500">{product.category}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-red-500 font-bold">
                          {product.stock} / {product.minStock}
                        </div>
                        <div className="text-sm text-red-400">库存不足</div>
                      </div>
                      <Button size="sm" className="bg-red-500 hover:bg-red-600">
                        一键补货
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
