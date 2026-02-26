import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import api from '@/api';
import {
  Search,
  AlertTriangle,
  Package,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Leaf,
  DollarSign,
  Layers
} from 'lucide-react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';

interface PackageItem {
  id: string;
  name: string;
  image: string;
  category: string;
  stock: number;
  minStock: number;
  unit: string;
  price: number;
  status: string;
  isLow: boolean;
  isOut: boolean;
}

interface IngredientItem {
  id: string;
  name: string;
  category: string;
  stock: number;
  minStock: number;
  unit: string;
  origin: string;
  supplier: string;
  isLow: boolean;
  isOut: boolean;
}

interface InventoryStats {
  totalPackages: number;
  totalIngredients: number;
  totalValue: number;
  lowStockCount: number;
  outOfStockCount: number;
}

export default function AdminInventory() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  // 获取真实库存数据
  const { data: inventoryData, isLoading, refetch } = useQuery({
    queryKey: ['admin-inventory'],
    queryFn: () => api.admin.getInventory()
  });

  const packages = inventoryData?.packages || [];
  const ingredients = inventoryData?.ingredients || [];
  const stats = inventoryData?.stats || {} as InventoryStats;

  // 过滤商品
  const filteredPackages = packages.filter((pkg: PackageItem) =>
    pkg.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 过滤食材
  const filteredIngredients = ingredients.filter((ing: IngredientItem) =>
    ing.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 获取库存预警商品
  const lowStockPackages = packages.filter((p: PackageItem) => p.isLow || p.isOut);
  const lowStockIngredients = ingredients.filter((i: IngredientItem) => i.isLow || i.isOut);

  // 分类统计
  const categoryStats = packages.reduce((acc: any, pkg: PackageItem) => {
    acc[pkg.category] = (acc[pkg.category] || 0) + 1;
    return acc;
  }, {});

  const categoryChartData = Object.entries(categoryStats).map(([name, value]) => ({
    name,
    value,
    fill: name === '基础套餐' ? '#10b981' : name === '进阶套餐' ? '#3b82f6' : '#8b5cf6'
  }));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-2">库存管理</h1>
          <p className="text-gray-500">监控全平台库存状态，优化库存周转</p>
        </div>
        <Button variant="outline" onClick={() => refetch()}>
          <RefreshCw className="w-4 h-4 mr-2" />
          刷新数据
        </Button>
      </div>

      {/* 核心指标 */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Package className="w-5 h-5 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">{stats.totalPackages || 0}</div>
                <div className="text-sm text-gray-500">食材包总数</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Leaf className="w-5 h-5 text-green-600" />
              <div>
                <div className="text-2xl font-bold">{stats.totalIngredients || 0}</div>
                <div className="text-sm text-gray-500">食材种类</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-5 h-5 text-purple-600" />
              <div>
                <div className="text-2xl font-bold">¥{(stats.totalValue || 0).toLocaleString()}</div>
                <div className="text-sm text-gray-500">库存总值</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              <div>
                <div className="text-2xl font-bold text-yellow-600">{stats.lowStockCount || 0}</div>
                <div className="text-sm text-gray-500">库存紧张</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <XCircle className="w-5 h-5 text-red-600" />
              <div>
                <div className="text-2xl font-bold text-red-600">{stats.outOfStockCount || 0}</div>
                <div className="text-sm text-gray-500">已售罄</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-flex">
          <TabsTrigger value="overview">库存概览</TabsTrigger>
          <TabsTrigger value="packages">食材包库存</TabsTrigger>
          <TabsTrigger value="ingredients">食材库存</TabsTrigger>
          <TabsTrigger value="alerts">
            库存预警
            {(lowStockPackages.length + lowStockIngredients.length) > 0 && (
              <Badge variant="destructive" className="ml-2">
                {lowStockPackages.length + lowStockIngredients.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6 space-y-6">
          {/* 库存分布图 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">食材包分类分布</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={categoryChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" name="数量">
                      {categoryChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">库存状态分布</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>库存充足</span>
                      <span className="text-green-600">
                        {packages.filter((p: PackageItem) => !p.isLow && !p.isOut).length}
                      </span>
                    </div>
                    <Progress 
                      value={(packages.filter((p: PackageItem) => !p.isLow && !p.isOut).length / packages.length) * 100} 
                      className="h-2 bg-gray-100 [&>div]:bg-green-500"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>库存紧张</span>
                      <span className="text-yellow-600">
                        {packages.filter((p: PackageItem) => p.isLow && !p.isOut).length}
                      </span>
                    </div>
                    <Progress 
                      value={(packages.filter((p: PackageItem) => p.isLow && !p.isOut).length / packages.length) * 100} 
                      className="h-2 bg-gray-100 [&>div]:bg-yellow-500"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>已售罄</span>
                      <span className="text-red-600">
                        {packages.filter((p: PackageItem) => p.isOut).length}
                      </span>
                    </div>
                    <Progress 
                      value={(packages.filter((p: PackageItem) => p.isOut).length / packages.length) * 100} 
                      className="h-2 bg-gray-100 [&>div]:bg-red-500"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 最近预警 */}
          {(lowStockPackages.length > 0 || lowStockIngredients.length > 0) && (
            <Card className="border-red-200 bg-red-50/50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center text-red-700">
                  <AlertTriangle className="w-5 h-5 mr-2" />
                  近期库存预警
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {lowStockPackages.slice(0, 4).map((pkg: PackageItem) => (
                    <div
                      key={pkg.id}
                      className={`p-4 rounded-lg border ${
                        pkg.isOut ? 'bg-red-100 border-red-200' : 'bg-yellow-100 border-yellow-200'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <img src={pkg.image} alt={pkg.name} className="w-10 h-10 rounded object-cover" />
                        <div className="flex-1">
                          <div className="font-medium">{pkg.name}</div>
                          <div className={`text-sm ${pkg.isOut ? 'text-red-600' : 'text-yellow-700'}`}>
                            {pkg.isOut ? `已售罄 (需${pkg.minStock})` : `库存紧张: ${pkg.stock}/${pkg.minStock}`}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="packages" className="mt-6">
          <Card>
            <CardContent className="p-0">
              <div className="p-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="搜索食材包..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>食材包</TableHead>
                    <TableHead>分类</TableHead>
                    <TableHead>当前库存</TableHead>
                    <TableHead>预警值</TableHead>
                    <TableHead>单价</TableHead>
                    <TableHead>状态</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPackages.map((pkg: PackageItem) => (
                    <TableRow key={pkg.id} className={pkg.isOut ? 'bg-red-50/50' : pkg.isLow ? 'bg-yellow-50/50' : ''}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <img src={pkg.image} alt={pkg.name} className="w-10 h-10 rounded object-cover" />
                          <span className="font-medium">{pkg.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{pkg.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <span className={`font-bold ${pkg.isOut ? 'text-red-600' : pkg.isLow ? 'text-yellow-600' : 'text-green-600'}`}>
                          {pkg.stock}
                        </span>
                        <span className="text-sm text-gray-500 ml-1">{pkg.unit}</span>
                      </TableCell>
                      <TableCell>{pkg.minStock} {pkg.unit}</TableCell>
                      <TableCell>¥{pkg.price}</TableCell>
                      <TableCell>
                        {pkg.isOut ? (
                          <Badge className="bg-red-100 text-red-700">已售罄</Badge>
                        ) : pkg.isLow ? (
                          <Badge className="bg-yellow-100 text-yellow-700">库存紧张</Badge>
                        ) : (
                          <Badge className="bg-green-100 text-green-700">库存充足</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredPackages.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                        {searchQuery ? '没有找到匹配的食材包' : '暂无数据'}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ingredients" className="mt-6">
          <Card>
            <CardContent className="p-0">
              <div className="p-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="搜索食材..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>食材</TableHead>
                    <TableHead>分类</TableHead>
                    <TableHead>产地</TableHead>
                    <TableHead>当前库存</TableHead>
                    <TableHead>预警值</TableHead>
                    <TableHead>供应商</TableHead>
                    <TableHead>状态</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredIngredients.map((ing: IngredientItem) => (
                    <TableRow key={ing.id} className={ing.isOut ? 'bg-red-50/50' : ing.isLow ? 'bg-yellow-50/50' : ''}>
                      <TableCell className="font-medium">{ing.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{ing.category}</Badge>
                      </TableCell>
                      <TableCell>{ing.origin}</TableCell>
                      <TableCell>
                        <span className={`font-bold ${ing.isOut ? 'text-red-600' : ing.isLow ? 'text-yellow-600' : 'text-green-600'}`}>
                          {ing.stock}
                        </span>
                        <span className="text-sm text-gray-500 ml-1">{ing.unit}</span>
                      </TableCell>
                      <TableCell>{ing.minStock} {ing.unit}</TableCell>
                      <TableCell>{ing.supplier || '-'}</TableCell>
                      <TableCell>
                        {ing.isOut ? (
                          <Badge className="bg-red-100 text-red-700">缺货</Badge>
                        ) : ing.isLow ? (
                          <Badge className="bg-yellow-100 text-yellow-700">紧张</Badge>
                        ) : (
                          <Badge className="bg-green-100 text-green-700">充足</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredIngredients.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                        {searchQuery ? '没有找到匹配的食材' : '暂无数据'}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 食材包预警 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Layers className="w-5 h-5 mr-2 text-blue-600" />
                  食材包预警 ({lowStockPackages.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {lowStockPackages.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <CheckCircle2 className="w-12 h-12 mx-auto mb-2 text-green-500" />
                    <p>食材包库存正常</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {lowStockPackages.map((pkg: PackageItem) => (
                      <div
                        key={pkg.id}
                        className={`p-4 rounded-lg border flex items-center justify-between ${
                          pkg.isOut ? 'bg-red-100 border-red-200' : 'bg-yellow-100 border-yellow-200'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <img src={pkg.image} alt={pkg.name} className="w-10 h-10 rounded object-cover" />
                          <div>
                            <div className="font-medium">{pkg.name}</div>
                            <div className={`text-sm ${pkg.isOut ? 'text-red-600' : 'text-yellow-700'}`}>
                              库存: {pkg.stock} / 建议: {pkg.minStock} {pkg.unit}
                            </div>
                          </div>
                        </div>
                        <Badge className={pkg.isOut ? 'bg-red-500' : 'bg-yellow-500'}>
                          {pkg.isOut ? '已售罄' : '紧张'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 食材预警 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Leaf className="w-5 h-5 mr-2 text-green-600" />
                  食材预警 ({lowStockIngredients.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {lowStockIngredients.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <CheckCircle2 className="w-12 h-12 mx-auto mb-2 text-green-500" />
                    <p>食材库存正常</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {lowStockIngredients.map((ing: IngredientItem) => (
                      <div
                        key={ing.id}
                        className={`p-4 rounded-lg border flex items-center justify-between ${
                          ing.isOut ? 'bg-red-100 border-red-200' : 'bg-yellow-100 border-yellow-200'
                        }`}
                      >
                        <div>
                          <div className="font-medium">{ing.name}</div>
                          <div className="text-sm text-gray-500">{ing.category} · {ing.origin}</div>
                          <div className={`text-sm ${ing.isOut ? 'text-red-600' : 'text-yellow-700'}`}>
                            库存: {ing.stock} / 建议: {ing.minStock} {ing.unit}
                          </div>
                        </div>
                        <Badge className={ing.isOut ? 'bg-red-500' : 'bg-yellow-500'}>
                          {ing.isOut ? '缺货' : '紧张'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
