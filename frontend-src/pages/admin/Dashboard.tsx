import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { mockApi } from '@/api/mock';
import {
  Users,
  ShoppingCart,
  DollarSign,
  Package,
  AlertTriangle,
  TrendingUp,
  ArrowRight,
  Truck,
  Clock
} from 'lucide-react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Link } from 'react-router-dom';

// 模拟数据
const revenueData = [
  { date: '周一', revenue: 12500 },
  { date: '周二', revenue: 18200 },
  { date: '周三', revenue: 15600 },
  { date: '周四', revenue: 22400 },
  { date: '周五', revenue: 28900 },
  { date: '周六', revenue: 34200 },
  { date: '周日', revenue: 29800 },
];

const categoryData = [
  { name: '肉类', value: 35 },
  { name: '蔬菜', value: 25 },
  { name: '海鲜', value: 20 },
  { name: '主食', value: 15 },
  { name: '其他', value: 5 },
];

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#6b7280'];

export default function AdminDashboard() {
  // 获取看板数据
  const { data: stats } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: () => mockApi.dashboard.getStats()
  });

  // 获取库存统计
  const { data: inventoryStats } = useQuery({
    queryKey: ['inventoryStats'],
    queryFn: () => mockApi.dashboard.getInventoryStats()
  });

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-2">管理概览</h1>
          <p className="text-gray-500">平台运营数据实时监控</p>
        </div>
        <Button variant="outline">
          <Clock className="w-4 h-4 mr-2" />
          刷新数据
        </Button>
      </div>

      {/* 核心指标 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">总用户数</p>
                <p className="text-2xl font-bold">{stats?.totalUsers.toLocaleString() || '1,256'}</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +{stats?.newUsersToday || 23} 今日新增
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">总订单数</p>
                <p className="text-2xl font-bold">{stats?.totalOrders.toLocaleString() || '3,456'}</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +{stats?.ordersToday || 45} 今日新增
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">总营收</p>
                <p className="text-2xl font-bold">¥{(stats?.totalRevenue || 256789).toLocaleString()}</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +¥{stats?.revenueToday || 5678} 今日
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">待处理</p>
                <p className="text-2xl font-bold text-orange-500">{stats?.pendingOrders || 12}</p>
                <p className="text-xs text-red-500 flex items-center mt-1">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  {stats?.lowStockCount || 5} 库存预警
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <Package className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 图表区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">营收趋势</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => `¥${value}`} />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  name="营收"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">商品分类占比</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  label
                >
                  {categoryData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap justify-center gap-3 mt-4">
              {categoryData.map((item, index) => (
                <div key={item.name} className="flex items-center space-x-1">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[index] }}
                  />
                  <span className="text-sm text-gray-600">{item.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 库存和供应商 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">库存状态</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/admin/inventory">
                查看全部 <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-500">总商品数</span>
                <span className="font-medium">{inventoryStats?.totalProducts || 156} 种</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">库存总值</span>
                <span className="font-medium">¥{(inventoryStats?.totalValue || 125678).toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">周转率</span>
                <span className="font-medium text-green-600">{inventoryStats?.turnoverRate || 3.2} 次/月</span>
              </div>
              <div className="pt-4">
                <div className="text-sm text-gray-500 mb-2">库存预警商品</div>
                <Progress value={30} className="h-2" />
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-red-500">5 种商品库存不足</span>
                  <Button variant="link" size="sm" className="h-auto p-0">
                    立即处理
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">供应商状态</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/admin/suppliers">
                查看全部 <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Truck className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <div className="font-medium">山东禽肉供应商</div>
                    <div className="text-sm text-gray-500">合作 128 天</div>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-700">正常</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Truck className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium">云南蔬菜基地</div>
                    <div className="text-sm text-gray-500">合作 86 天</div>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-700">正常</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                    <Truck className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <div className="font-medium">青岛海鲜供应商</div>
                    <div className="text-sm text-gray-500">合作 45 天</div>
                  </div>
                </div>
                <Badge className="bg-yellow-100 text-yellow-700">延迟</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
