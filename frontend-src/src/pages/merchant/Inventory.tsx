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
  Package,
  CheckCircle2,
  XCircle
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
  status: string;
  isLow: boolean;
  isOut: boolean;
}

interface StockAlert {
  id: string;
  productId: string;
  productName: string;
  currentStock: number;
  minStock: number;
  alertType: 'low_stock' | 'out_of_stock';
  resolved: boolean;
}

export default function MerchantInventory() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<InventoryItem | null>(null);
  const [showAdjustDialog, setShowAdjustDialog] = useState(false);
  const [adjustAmount, setAdjustAmount] = useState(0);

  // 获取商家库存数据
  const { data: products, isLoading: isLoadingInventory } = useQuery({
    queryKey: ['merchant-inventory'],
    queryFn: () => api.merchant.getInventory()
  });

  // 获取库存预警数据
  const { data: alerts, isLoading: isLoadingAlerts } = useQuery({
    queryKey: ['merchant-stock-alerts'],
    queryFn: () => api.merchant.getStockAlerts()
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
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || '更新库存失败');
      }
      return response.json();
    },
    onSuccess: () => {
      toast.success('库存调整成功');
      queryClient.invalidateQueries({ queryKey: ['merchant-inventory'] });
      queryClient.invalidateQueries({ queryKey: ['merchant-stock-alerts'] });
      setShowAdjustDialog(false);
      setAdjustAmount(0);
    },
    onError: (error: Error) => {
      toast.error(error.message || '库存调整失败');
    }
  });

  // 过滤商品
  const filteredProducts = products?.filter((product: InventoryItem) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 统计
  const totalProducts = products?.length || 0;
  const inStockProducts = products?.filter((p: InventoryItem) => p.stock >= p.minStock).length || 0;
  const lowStockCount = alerts?.filter((a: StockAlert) => a.alertType === 'low_stock').length || 0;
  const outOfStockCount = alerts?.filter((a: StockAlert) => a.alertType === 'out_of_stock').length || 0;

  const handleAdjustStock = (product: InventoryItem) => {
    setSelectedProduct(product);
    setAdjustAmount(0);
    setShowAdjustDialog(true);
  };

  const confirmAdjust = async (type: 'in' | 'out') => {
    if (!selectedProduct || adjustAmount <= 0) {
      toast.error('请输入有效的数量');
      return;
    }
    
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

  const isLoading = isLoadingInventory || isLoadingAlerts;

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
            共 <span className="font-bold text-gray-900">{totalProducts}</span> 个商品
          </div>
          <Button 
            variant="outline" 
            onClick={() => {
              queryClient.invalidateQueries({ queryKey: ['merchant-inventory'] });
              queryClient.invalidateQueries({ queryKey: ['merchant-stock-alerts'] });
            }}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            刷新
          </Button>
        </div>
      </div>

      {/* 库存统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-sm text-gray-500">总商品数</div>
                <div className="text-xl font-bold">{totalProducts}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="text-sm text-gray-500">库存充足</div>
                <div className="text-xl font-bold text-green-600">{inStockProducts}</div>
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
                <div className="text-sm text-gray-500">库存紧张</div>
                <div className="text-xl font-bold text-yellow-600">{lowStockCount}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <div className="text-sm text-gray-500">已售罄</div>
                <div className="text-xl font-bold text-red-600">{outOfStockCount}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 库存预警 */}
      {alerts && alerts.length > 0 && (
        <Card className="border-red-200 bg-red-50/50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <h3 className="font-bold text-red-700">库存预警 ({alerts.length})</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {alerts.map((alert: StockAlert) => (
                <div
                  key={alert.id}
                  className={`rounded-lg p-3 flex items-center justify-between ${
                    alert.alertType === 'out_of_stock' 
                      ? 'bg-red-100 border border-red-200' 
                      : 'bg-yellow-100 border border-yellow-200'
                  }`}
                >
                  <div>
                    <div className="font-medium text-sm">{alert.productName}</div>
                    <div className={`text-xs ${
                      alert.alertType === 'out_of_stock' ? 'text-red-600' : 'text-yellow-700'
                    }`}>
                      {alert.alertType === 'out_of_stock' 
                        ? `已售罄 (需${alert.minStock})` 
                        : `库存紧张: ${alert.currentStock} / 建议${alert.minStock}`}
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    className={alert.alertType === 'out_of_stock' 
                      ? 'bg-red-500 hover:bg-red-600' 
                      : 'bg-yellow-500 hover:bg-yellow-600'
                    }
                    onClick={() => {
                      const product = products?.find((p: InventoryItem) => p.id === alert.productId);
                      if (product) handleAdjustStock(product);
                    }}
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
          placeholder="搜索商品名称..."
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
                <TableHead>商品信息</TableHead>
                <TableHead>当前库存</TableHead>
                <TableHead>预警阈值</TableHead>
                <TableHead>库存状态</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts?.map((product: InventoryItem) => {
                const stockPercent = (product.stock / product.minStock) * 100;
                
                return (
                  <TableRow key={product.id} className={product.isOut ? 'bg-red-50/50' : product.isLow ? 'bg-yellow-50/50' : ''}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded-lg"
                        />
                        <div>
                          <div className="font-medium">{product.name}</div>
                          <div className="text-sm text-gray-500">{product.category}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className={`font-bold text-lg ${
                        product.isOut ? 'text-red-600' : product.isLow ? 'text-yellow-600' : 'text-green-600'
                      }`}>
                        {product.stock}
                      </div>
                      <div className="text-sm text-gray-500">{product.unit}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{product.minStock}</div>
                      <div className="text-sm text-gray-500">{product.unit}</div>
                    </TableCell>
                    <TableCell>
                      <div className="w-32">
                        <Progress
                          value={Math.min(stockPercent, 100)}
                          className={`h-2 ${
                            product.isOut ? 'bg-red-100 [&>div]:bg-red-500' : 
                            product.isLow ? 'bg-yellow-100 [&>div]:bg-yellow-500' : 
                            'bg-green-100 [&>div]:bg-green-500'
                          }`}
                        />
                        <div className={`text-xs mt-1 font-medium ${
                          product.isOut ? 'text-red-600' : 
                          product.isLow ? 'text-yellow-600' : 
                          'text-green-600'
                        }`}>
                          {product.isOut ? '已售罄' : product.isLow ? '库存紧张' : '库存充足'}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAdjustStock(product)}
                          className="text-green-600 hover:text-green-700 hover:bg-green-50"
                          disabled={updateStockMutation.isPending}
                        >
                          <TrendingUp className="w-4 h-4 mr-1" />
                          入库
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAdjustStock(product)}
                          className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                          disabled={updateStockMutation.isPending}
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
                    {searchQuery ? '没有找到匹配的商品' : '暂无库存数据'}
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
              <div className={`text-3xl font-bold ${
                selectedProduct?.isOut ? 'text-red-600' : 
                selectedProduct?.isLow ? 'text-yellow-600' : 'text-green-600'
              }`}>
                {selectedProduct?.stock}
              </div>
            </div>
            <div className="flex items-center justify-center space-x-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setAdjustAmount(prev => Math.max(0, prev - 1))}
              >
                <Minus className="w-4 h-4" />
              </Button>
              <Input
                type="number"
                min={0}
                value={adjustAmount}
                onChange={(e) => setAdjustAmount(Math.max(0, parseInt(e.target.value) || 0))}
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
                ((selectedProduct?.stock || 0) + adjustAmount) < (selectedProduct?.minStock || 0)
                  ? 'text-yellow-600'
                  : ((selectedProduct?.stock || 0) + adjustAmount) === 0
                    ? 'text-red-600'
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
              disabled={adjustAmount <= 0 || updateStockMutation.isPending || (selectedProduct?.stock || 0) < adjustAmount}
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
