import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
// import { Badge } from '@/components/ui/badge';
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
// import { Label } from '@/components/ui/label';
import { mockApi } from '@/api/mock';
import {
  Search,
  Plus,
  Minus,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';

export default function MerchantInventory() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [showAdjustDialog, setShowAdjustDialog] = useState(false);
  const [adjustAmount, setAdjustAmount] = useState(0);

  // 获取商品列表
  const { data: products, isLoading } = useQuery({
    queryKey: ['inventory'],
    queryFn: () => mockApi.products.getAll()
  });

  // 获取库存预警
  const { data: alerts } = useQuery({
    queryKey: ['stockAlerts'],
    queryFn: () => mockApi.stockAlerts.getAll()
  });

  // 过滤商品
  const filteredProducts = products?.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAdjustStock = (product: any) => {
    setSelectedProduct(product);
    setAdjustAmount(0);
    setShowAdjustDialog(true);
  };

  const confirmAdjust = async () => {
    if (!selectedProduct) return;
    
    const newStock = selectedProduct.stock + adjustAmount;
    if (newStock < 0) {
      toast.error('库存不能为负数');
      return;
    }

    await mockApi.products.updateStock(selectedProduct.id, newStock);
    toast.success(`库存已调整为 ${newStock}`);
    setShowAdjustDialog(false);
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
          <p className="text-gray-500">管理商品库存，及时补货</p>
        </div>
        <Button variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          同步库存
        </Button>
      </div>

      {/* 库存预警 */}
      {alerts && alerts.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <h3 className="font-bold text-red-700">库存预警</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {alerts.filter(a => !a.resolved).map((alert) => (
                <div
                  key={alert.id}
                  className="bg-white rounded-lg p-3 flex items-center justify-between"
                >
                  <div>
                    <div className="font-medium">{alert.productName}</div>
                    <div className="text-sm text-red-500">
                      库存：{alert.currentStock} / 预警：{alert.minStock}
                    </div>
                  </div>
                  <Button size="sm" className="bg-red-500 hover:bg-red-600">
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
              {filteredProducts?.map((product) => {
                const stockPercent = (product.stock / product.minStock) * 100;
                const isLow = stockPercent < 100;
                
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
                      <div className={`font-medium text-lg ${isLow ? 'text-red-500' : ''}`}>
                        {product.stock}
                      </div>
                      <div className="text-sm text-gray-500">{product.unit}</div>
                    </TableCell>
                    <TableCell>{product.minStock}</TableCell>
                    <TableCell>
                      <div className="w-32">
                        <Progress
                          value={Math.min(stockPercent, 100)}
                          className={`h-2 ${isLow ? 'bg-red-100' : ''}`}
                        />
                        <div className={`text-xs mt-1 ${isLow ? 'text-red-500' : 'text-gray-500'}`}>
                          {isLow ? '库存不足' : '库存充足'}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAdjustStock(product)}
                        >
                          <TrendingUp className="w-4 h-4 mr-1" />
                          入库
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAdjustStock(product)}
                        >
                          <TrendingDown className="w-4 h-4 mr-1" />
                          出库
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
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
                (selectedProduct?.stock + adjustAmount) < selectedProduct?.minStock
                  ? 'text-red-500'
                  : 'text-green-600'
              }`}>
                {selectedProduct?.stock + adjustAmount}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdjustDialog(false)}>
              取消
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={confirmAdjust}>
              确认调整
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
