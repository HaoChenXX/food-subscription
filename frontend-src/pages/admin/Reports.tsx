import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import {
  Download,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  Package
} from 'lucide-react';

// 模拟数据
const salesData = [
  { date: '1月', sales: 125000, orders: 450 },
  { date: '2月', sales: 148000, orders: 520 },
  { date: '3月', sales: 162000, orders: 580 },
  { date: '4月', sales: 155000, orders: 550 },
  { date: '5月', sales: 189000, orders: 680 },
  { date: '6月', sales: 210000, orders: 750 },
];

const userGrowthData = [
  { date: '1月', newUsers: 120, totalUsers: 800 },
  { date: '2月', newUsers: 150, totalUsers: 950 },
  { date: '3月', newUsers: 180, totalUsers: 1130 },
  { date: '4月', newUsers: 140, totalUsers: 1270 },
  { date: '5月', newUsers: 200, totalUsers: 1470 },
  { date: '6月', newUsers: 220, totalUsers: 1690 },
];

const categorySalesData = [
  { name: '肉类', value: 35, amount: 245000 },
  { name: '蔬菜', value: 25, amount: 175000 },
  { name: '海鲜', value: 20, amount: 140000 },
  { name: '主食', value: 15, amount: 105000 },
  { name: '调味品', value: 5, amount: 35000 },
];

const packagePerformanceData = [
  { name: '健康减脂套餐', sales: 320, revenue: 28480 },
  { name: '增肌力量套餐', sales: 280, revenue: 36120 },
  { name: '精品海鲜套餐', sales: 180, revenue: 35820 },
  { name: '控糖养生套餐', sales: 220, revenue: 21780 },
  { name: '快手新手套餐', sales: 380, revenue: 26220 },
];

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#6b7280'];

export default function AdminReports() {
  const [timeRange, setTimeRange] = useState('6months');

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* 页面标题 */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-2">数据报表</h1>
          <p className="text-gray-500">查看平台运营数据分析</p>
        </div>
        <div className="flex items-center space-x-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="时间范围" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">近7天</SelectItem>
              <SelectItem value="30days">近30天</SelectItem>
              <SelectItem value="3months">近3个月</SelectItem>
              <SelectItem value="6months">近6个月</SelectItem>
              <SelectItem value="1year">近1年</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            导出报表
          </Button>
        </div>
      </div>

      {/* 核心指标 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">总营收</p>
                <p className="text-2xl font-bold">¥989,000</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +15.3%
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
                <p className="text-sm text-gray-500">总订单</p>
                <p className="text-2xl font-bold">3,530</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +12.8%
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
                <p className="text-sm text-gray-500">新增用户</p>
                <p className="text-2xl font-bold">1,010</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +18.5%
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">商品销量</p>
                <p className="text-2xl font-bold">8,520</p>
                <p className="text-xs text-red-500 flex items-center mt-1">
                  <TrendingDown className="w-3 h-3 mr-1" />
                  -3.2%
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <Package className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="sales" className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-flex">
          <TabsTrigger value="sales">销售分析</TabsTrigger>
          <TabsTrigger value="users">用户分析</TabsTrigger>
          <TabsTrigger value="products">商品分析</TabsTrigger>
          <TabsTrigger value="packages">套餐分析</TabsTrigger>
        </TabsList>

        <TabsContent value="sales" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">销售趋势</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value) => `¥${value.toLocaleString()}`} />
                  <Area
                    type="monotone"
                    dataKey="sales"
                    stroke="#8b5cf6"
                    fill="#8b5cf6"
                    fillOpacity={0.3}
                    name="销售额"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">分类销售占比</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={categorySalesData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      fill="#8884d8"
                      paddingAngle={5}
                      dataKey="value"
                      label
                    >
                      {categorySalesData.map((_entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap justify-center gap-3 mt-4">
                  {categorySalesData.map((item, index) => (
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

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">分类销售额</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {categorySalesData.map((item, index) => (
                    <div key={item.name} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: COLORS[index] }}
                        />
                        <span>{item.name}</span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="text-gray-500">{item.value}%</span>
                        <span className="font-medium">¥{item.amount.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">用户增长趋势</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={userGrowthData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="newUsers"
                    stroke="#10b981"
                    strokeWidth={2}
                    name="新增用户"
                  />
                  <Line
                    type="monotone"
                    dataKey="totalUsers"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    name="总用户数"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">商品分类销量</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={categorySalesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3b82f6" name="销量占比" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="packages" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">套餐销售排行</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {packagePerformanceData.map((pkg, index) => (
                  <div
                    key={pkg.name}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                        index < 3 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-200 text-gray-600'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium">{pkg.name}</div>
                        <div className="text-sm text-gray-500">销量：{pkg.sales} 份</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-green-600">¥{pkg.revenue.toLocaleString()}</div>
                      <div className="text-sm text-gray-500">销售额</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
