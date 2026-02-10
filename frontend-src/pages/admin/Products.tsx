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
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import type { Product } from '@/types';
import {
  Search,
  Filter,
  Plus,
  Eye,
  Edit2,
  Trash2,
  Package,
  AlertTriangle,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { toast } from 'sonner';

// 商品分类选项
const categories = [
  { value: 'all', label: '全部' },
  { value: 'meat', label: '肉类' },
  { value: 'vegetable', label: '蔬菜' },
  { value: 'seafood', label: '海鲜' },
  { value: 'grain', label: '主食' },
  { value: 'seasoning', label: '调味品' },
];

// 模拟商品数据
const mockProducts: Product[] = [
  {
    id: '1',
    name: '澳洲进口牛排',
    category: 'meat',
    subcategory: '牛肉',
    description: '优质澳洲安格斯牛排，肉质鲜嫩',
    image: '/images/products/steak.jpg',
    price: 128,
    unit: '500g',
    stock: 50,
    minStock: 10,
    origin: '澳大利亚',
    shelfLife: 180,
    supplierId: 'SUP001',
    supplierName: '澳洲牛肉进口商',
    status: 'active',
    createdAt: '2024-01-15',
  },
  {
    id: '2',
    name: '新鲜有机西兰花',
    category: 'vegetable',
    subcategory: '叶菜类',
    description: '有机种植，新鲜采摘',
    image: '/images/products/broccoli.jpg',
    price: 12.8,
    unit: '500g',
    stock: 8,
    minStock: 20,
    origin: '云南',
    shelfLife: 7,
    supplierId: 'SUP002',
    supplierName: '云南蔬菜基地',
    status: 'active',
    createdAt: '2024-01-10',
  },
  {
    id: '3',
    name: '挪威三文鱼',
    category: 'seafood',
    subcategory: '鱼类',
    description: '深海捕捞，冰鲜直达',
    image: '/images/products/salmon.jpg',
    price: 168,
    unit: '400g',
    stock: 0,
    minStock: 5,
    origin: '挪威',
    shelfLife: 3,
    supplierId: 'SUP003',
    supplierName: '挪威三文鱼进口商',
    status: 'inactive',
    createdAt: '2024-01-08',
  },
  {
    id: '4',
    name: '东北五常大米',
    category: 'grain',
    subcategory: '米面',
    description: '正宗五常大米，香气浓郁',
    image: '/images/products/rice.jpg',
    price: 58,
    unit: '5kg',
    stock: 200,
    minStock: 30,
    origin: '黑龙江',
    shelfLife: 365,
    supplierId: 'SUP004',
    supplierName: '东北粮油供应商',
    status: 'active',
    createdAt: '2024-01-05',
  },
  {
    id: '5',
    name: '山东大葱',
    category: 'vegetable',
    subcategory: '根茎类',
    description: '章丘大葱，葱白长而甜',
    image: '/images/products/scallion.jpg',
    price: 8.5,
    unit: '1kg',
    stock: 15,
    minStock: 25,
    origin: '山东',
    shelfLife: 14,
    supplierId: 'SUP005',
    supplierName: '山东蔬菜基地',
    status: 'active',
    createdAt: '2024-01-12',
  },
];

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // 获取商品列表
  const fetchProducts = async () => {
    setLoading(true);
    try {
      // 实际项目中使用 fetch 或 axios 调用 API
      // const response = await fetch('/api/admin/products');
      // const data = await response.json();
      
      // 模拟 API 调用延迟
      await new Promise(resolve => setTimeout(resolve, 500));
      setProducts(mockProducts);
    } catch (error) {
      toast.error('获取商品列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // 过滤商品
  const filteredProducts = products.filter(product => {
    const matchSearch = 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.supplierName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCategory = categoryFilter === 'all' || product.category === categoryFilter;
    const matchStatus = statusFilter === 'all' || product.status === statusFilter;
    return matchSearch && matchCategory && matchStatus;
  });

  // 获取库存状态
  const getStockStatus = (product: Product) => {
    if (product.stock === 0) return { label: '缺货', color: 'bg-red-100 text-red-700', icon: XCircle };
    if (product.stock <= product.minStock) return { label: '库存不足', color: 'bg-yellow-100 text-yellow-700', icon: AlertTriangle };
    return { label: '库存充足', color: 'bg-green-100 text-green-700', icon: CheckCircle2 };
  };

  const handleViewDetail = (product: Product) => {
    setSelectedProduct(product);
    setShowDetailDialog(true);
  };

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setShowEditDialog(true);
  };

  const handleDelete = (product: Product) => {
    setSelectedProduct(product);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!selectedProduct) return;
    try {
      // 实际项目中调用 API
      // await fetch(`/api/admin/products/${selectedProduct.id}`, { method: 'DELETE' });
      
      setProducts(products.filter(p => p.id !== selectedProduct.id));
      toast.success('商品已删除');
      setShowDeleteDialog(false);
    } catch (error) {
      toast.error('删除失败');
    }
  };

  const handleSaveProduct = async () => {
    if (!selectedProduct) return;
    try {
      // 实际项目中调用 API
      // await fetch(`/api/admin/products/${selectedProduct.id}`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(selectedProduct)
      // });
      
      setProducts(products.map(p => p.id === selectedProduct.id ? selectedProduct : p));
      toast.success('商品信息已更新');
      setShowEditDialog(false);
    } catch (error) {
      toast.error('更新失败');
    }
  };

  // 统计信息
  const totalProducts = products.length;
  const lowStockCount = products.filter(p => p.stock > 0 && p.stock <= p.minStock).length;
  const outOfStockCount = products.filter(p => p.stock === 0).length;
  const totalValue = products.reduce((sum, p) => sum + p.price * p.stock, 0);

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* 页面标题 */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-2">商品管理</h1>
          <p className="text-gray-500">管理平台所有商品信息</p>
        </div>
        <Button className="bg-purple-600 hover:bg-purple-700">
          <Plus className="w-4 h-4 mr-2" />
          添加商品
        </Button>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{totalProducts}</div>
                <div className="text-sm text-gray-500">总商品数</div>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Package className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-yellow-600">{lowStockCount}</div>
                <div className="text-sm text-gray-500">库存不足</div>
              </div>
              <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-red-600">{outOfStockCount}</div>
                <div className="text-sm text-gray-500">缺货商品</div>
              </div>
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">¥{totalValue.toLocaleString()}</div>
                <div className="text-sm text-gray-500">库存总值</div>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Package className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 搜索和过滤 */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="搜索商品名称或供应商..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full lg:w-40">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="分类" />
          </SelectTrigger>
          <SelectContent>
            {categories.map(cat => (
              <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full lg:w-40">
            <SelectValue placeholder="状态" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部状态</SelectItem>
            <SelectItem value="active">上架</SelectItem>
            <SelectItem value="inactive">下架</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 商品列表 */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>商品信息</TableHead>
                <TableHead>分类</TableHead>
                <TableHead>价格</TableHead>
                <TableHead>库存</TableHead>
                <TableHead>库存状态</TableHead>
                <TableHead>供应商</TableHead>
                <TableHead>状态</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    加载中...
                  </TableCell>
                </TableRow>
              ) : filteredProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                    暂无商品数据
                  </TableCell>
                </TableRow>
              ) : (
                filteredProducts.map((product) => {
                  const stockStatus = getStockStatus(product);
                  const StockIcon = stockStatus.icon;
                  
                  return (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                            <Package className="w-6 h-6 text-gray-400" />
                          </div>
                          <div>
                            <div className="font-medium">{product.name}</div>
                            <div className="text-sm text-gray-500">{product.origin && `产地: ${product.origin}`}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {categories.find(c => c.value === product.category)?.label || product.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">¥{product.price}</TableCell>
                      <TableCell>
                        <span className={product.stock <= product.minStock ? 'text-red-600 font-medium' : ''}>
                          {product.stock} {product.unit}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge className={stockStatus.color}>
                          <StockIcon className="w-3 h-3 mr-1" />
                          {stockStatus.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{product.supplierName}</TableCell>
                      <TableCell>
                        <Badge className={product.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                          {product.status === 'active' ? '上架' : '下架'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleViewDetail(product)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(product)}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => handleDelete(product)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 商品详情对话框 */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>商品详情</DialogTitle>
          </DialogHeader>
          {selectedProduct && (
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Package className="w-12 h-12 text-gray-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2">{selectedProduct.name}</h3>
                  <p className="text-gray-500 text-sm mb-3">{selectedProduct.description}</p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">
                      {categories.find(c => c.value === selectedProduct.category)?.label}
                    </Badge>
                    <Badge className={selectedProduct.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                      {selectedProduct.status === 'active' ? '上架' : '下架'}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-500">价格</div>
                  <div className="font-medium text-lg">¥{selectedProduct.price}</div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-500">规格</div>
                  <div className="font-medium">{selectedProduct.unit}</div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-500">当前库存</div>
                  <div className={`font-medium ${selectedProduct.stock <= selectedProduct.minStock ? 'text-red-600' : ''}`}>
                    {selectedProduct.stock} {selectedProduct.unit}
                  </div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-500">安全库存</div>
                  <div className="font-medium">{selectedProduct.minStock} {selectedProduct.unit}</div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-500">产地</div>
                  <div className="font-medium">{selectedProduct.origin || '-'}</div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-500">保质期</div>
                  <div className="font-medium">{selectedProduct.shelfLife ? `${selectedProduct.shelfLife}天` : '-'}</div>
                </div>
              </div>

              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-500 mb-1">供应商</div>
                <div className="font-medium">{selectedProduct.supplierName}</div>
              </div>

              <div className="flex space-x-3">
                <Button 
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                  onClick={() => {
                    setShowDetailDialog(false);
                    handleEdit(selectedProduct);
                  }}
                >
                  <Edit2 className="w-4 h-4 mr-2" />
                  编辑商品
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 编辑商品对话框 */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>编辑商品</DialogTitle>
          </DialogHeader>
          {selectedProduct && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>商品名称</Label>
                <Input
                  value={selectedProduct.name}
                  onChange={(e) => setSelectedProduct({ ...selectedProduct, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>价格 (¥)</Label>
                  <Input
                    type="number"
                    value={selectedProduct.price}
                    onChange={(e) => setSelectedProduct({ ...selectedProduct, price: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>库存</Label>
                  <Input
                    type="number"
                    value={selectedProduct.stock}
                    onChange={(e) => setSelectedProduct({ ...selectedProduct, stock: Number(e.target.value) })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>状态</Label>
                <Select 
                  value={selectedProduct.status} 
                  onValueChange={(value: 'active' | 'inactive') => setSelectedProduct({ ...selectedProduct, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">上架</SelectItem>
                    <SelectItem value="inactive">下架</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>商品描述</Label>
                <Input
                  value={selectedProduct.description}
                  onChange={(e) => setSelectedProduct({ ...selectedProduct, description: e.target.value })}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>取消</Button>
            <Button className="bg-purple-600 hover:bg-purple-700" onClick={handleSaveProduct}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 删除确认对话框 */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-500">
              确定要删除商品 "{selectedProduct?.name}" 吗？此操作无法撤销。
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>取消</Button>
            <Button variant="destructive" onClick={confirmDelete}>删除</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
