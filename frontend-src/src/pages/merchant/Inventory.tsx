import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
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
import api from '@/api';
import {
  Search,
  Plus,
  Minus,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  RefreshCw,
  Package
} from 'lucide-react';
import { toast } from 'sonner';

interface InventoryItem {
  id: string;
  name: string;
  image: string;
  category: string;
  stock: number;
  minStock: number;
  unit: string;
  price: number;
}

export default function MerchantInventory() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<InventoryItem | null>(null);
  const [showAdjustDialog, setShowAdjustDialog] = useState(false);
  const [adjustAmount, setAdjustAmount] = useState(0);

  // 获取商家的食材包作为库存数据
  const { data: products, isLoading } = useQuery({
    queryKey: ['merchant-inventory'],
    queryFn: async () => {
      // 获取所有食材包，筛选出当前商家的
      const allPackages = await api.foodPackages.getAll();
      // 转换为库存项格式
      return allPackages.map((pkg: any) => ({
        id: pkg.id,
        name: pkg.name,
        image: pkg.image || 'https://via.placeholder.com/40',
        category: pkg.level === 'basic' ? '基础套餐' : pkg.level === 'advanced' ? '进阶套餐' : '精品套餐',
        stock: pkg.stockQuantity || 0,
        minStock: 10, // 默认预警值
        unit: '份',
        price: pkg.price
      }));
    }
  });

  // 更新库存 mutation
  const updateStockMutation = useMutation({
    mutationFn: async ({ id, quantity, type }: { id: string; quantity: number; type: string }) => {
      const response = await fetch(`/api/food-packages/${id}/inventory`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ quantity, type, remark: '商家库存调整' })
      });
      if (!response.ok) throw new Error('更新库存失败');
      return response.json();
    },
    onSuccess: () => {
      toast.success('库存调整成功');
      queryClient.invalidateQueries({ queryKey: ['merchant-inventory'] });
      setShowAdjustDialog(false);
    },
    onError: (error: Error) => {
      toast.error(error.message || '库存调整失败');
    }
  });

  // 过滤商品
  const filteredProducts = products?.filter((product: InventoryItem) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 库存预警列表
  const lowStockAlerts = products?.filter((p: InventoryItem) => p.stock < p.minStock) || [];

  const handleAdjustStock = (product: InventoryItem) => {
    setSelectedProduct(product);
    setAdjustAmount(0);
    setShowAdjustDialog(true);
  };

  const confirmAdjust = async (type: 'in' | 'out') => {
    if (!selectedProduct || adjustAmount === 0) return;
    
    const newStock = type === 'in' 
      ? selectedProduct.stock + adjustAmount 
      : selectedProduct.stock - adjustAmount;
      
    if (newStock < 0) {
      toast.error('库存不能为负数');
      return;
    }

    updateStockMutation.mutate({
      id: selectedProduct.id,
      quantity: adjustAmount,
      type
    });
  };

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
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-2">库存管理</h1>
          <p className="text-gray-500">管理食材包库存，及时补货</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="text-sm text-gray-500">
            共 <span className="font-bold text-gray-900">{products?.length || 0}</span> 个商品
          </div>
          <Button 
            variant="outline" 
            onClick={() => queryClient.invalidateQueries({ queryKey: ['merchant-inventory'] })}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            刷新
          </Button>
        </div>
      </div>

      {/* 库存统计 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-sm text-gray-500">总商品数</div>
                <div className="text-xl font-bold">{products?.length || 0}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="text-sm text-gray-500">库存充足</div>
                <div className="text-xl font-bold">
                  {products?.filter((p: InventoryItem) => p.stock >= p.minStock).length || 0}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <div className="text-sm text-gray-500">库存预警</div>
                <div className="text-xl font-bold text-yellow-600">
                  {lowStockAlerts.length}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <div className="text-sm text-gray-500">缺货</div>
                <div className="text-xl font-bold text-red-600">
                  {products?.filter((p: InventoryItem) => p.stock === 0).length || 0}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 库存预警 */}
      {lowStockAlerts.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <h3 className="font-bold text-red-700">库存预警</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {lowStockAlerts.slice(0, 6).map((alert: InventoryItem) => (
                <div
                  key={alert.id}
                  className="bg-white rounded-lg p-3 flex items-center justify-between"
                >
                  <div className="flex items-center space-x-2">
                    <img src={alert.image} alt={alert.name} className="w-8 h-8 rounded object-cover" />
                    <div>
                      <div className="font-medium text-sm">{alert.name}</div>
                      <div className="text-xs text-red-500">
                        库存：{alert.stock} / 预警：{alert.minStock}
                      </div>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    className="bg-red-500 hover:bg-red-600"
                    onClick={() => handleAdjustStock(alert)}
                  >
                    补货
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 搜索 */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="搜索商品..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* 库存列表 */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>商品</TableHead>
                <TableHead>当前库存</TableHead>
                <TableHead>预警值</TableHead>
                <TableHead>库存状态</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts?.map((product: InventoryItem) => {
                const stockPercent = (product.stock / product.minStock) * 100;
                const isLow = stockPercent < 100;
                const isOut = product.stock === 0;
                
                return (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-10 h-10 object-cover rounded"
                        />
                        <div>
                          <div className="font-medium">{product.name}</div>
                          <div className="text-sm text-gray-500">{product.category}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className={`font-medium text-lg ${isOut ? 'text-red-500' : isLow ? 'text-yellow-500' : 'text-green-600'}`}>
                        {product.stock}
                      </div>
                      <div className="text-sm text-gray-500">{product.unit}</div>
                    </TableCell>
                    <TableCell>{product.minStock}</TableCell>
                    <TableCell>
                      <div className="w-32">
                        <Progress
                          value={Math.min(stockPercent, 100)}
                          className={`h-2 ${isOut ? 'bg-red-100' : isLow ? 'bg-yellow-100' : 'bg-green-100'}`}
                        />
                        <div className={`text-xs mt-1 ${isOut ? 'text-red-500' : isLow ? 'text-yellow-500' : 'text-green-600'}`}>
                          {isOut ? '缺货' : isLow ? '库存不足' : '库存充足'}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAdjustStock(product)}
                          className="text-green-600 hover:text-green-700"
                        >
                          <TrendingUp className="w-4 h-4 mr-1" />
                          入库
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAdjustStock(product)}
                          className="text-orange-600 hover:text-orange-700"
                        >
                          <TrendingDown className="w-4 h-4 mr-1" />
                          出库
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filteredProducts?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                    暂无库存数据
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 调整库存对话框 */}
      <Dialog open={showAdjustDialog} onOpenChange={setShowAdjustDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>调整库存 - {selectedProduct?.name}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="text-center mb-4">
              <div className="text-sm text-gray-500">当前库存</div>
              <div className="text-3xl font-bold">{selectedProduct?.stock}</div>
            </div>
            <div className="flex items-center justify-center space-x-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setAdjustAmount(prev => prev - 1)}
              >
                <Minus className="w-4 h-4" />
              </Button>
              <Input
                type="number"
                value={adjustAmount}
                onChange={(e) => setAdjustAmount(parseInt(e.target.value) || 0)}
                className="w-24 text-center text-xl"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => setAdjustAmount(prev => prev + 1)}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="text-center mt-4">
              <div className="text-sm text-gray-500">调整后库存</div>
              <div className={`text-2xl font-bold ${
                (selectedProduct?.stock || 0) + adjustAmount < (selectedProduct?.minStock || 0)
                  ? 'text-red-500'
                  : 'text-green-600'
              }`}>
                {(selectedProduct?.stock || 0) + adjustAmount}
              </div>
            </div>
          </div>
          <DialogFooter className="space-x-2">
            <Button variant="outline" onClick={() => setShowAdjustDialog(false)}>
              取消
            </Button>
            <Button 
              variant="outline"
              className="text-orange-600 hover:text-orange-700"
              onClick={() => confirmAdjust('out')}
              disabled={adjustAmount <= 0 || updateStockMutation.isPending}
            >
              <TrendingDown className="w-4 h-4 mr-1" />
              出库
            </Button>
            <Button 
              className="bg-green-600 hover:bg-green-700"
              onClick={() => confirmAdjust('in')}
              disabled={adjustAmount <= 0 || updateStockMutation.isPending}
            >
              <TrendingUp className="w-4 h-4 mr-1" />
              入库
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
