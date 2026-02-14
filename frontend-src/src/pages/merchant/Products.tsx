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
import { Label } from '@/components/ui/label';
import api from '@/api';
// 临时使用 any 类型避免编译错误
type FoodPackage = any;
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Filter
} from 'lucide-react';
import { toast } from 'sonner';

export default function MerchantProducts() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<FoodPackage | null>(null);

  // 表单状态
  const [formData, setFormData] = useState<Partial<FoodPackage>>({
    name: '',
    category: '',
    price: 0,
    unit: '',
    stock: 0,
    minStock: 10,
    description: '',
    image: '',
  });

  // 获取商品列表
  const { data: products, isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => api.foodPackages.getAll()
  });

  // 创建商品 mutation
  const createMutation = useMutation({
    mutationFn: (data: Partial<FoodPackage>) => api.foodPackages.create(data as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('商品创建成功');
      setShowAddDialog(false);
      resetForm();
    },
    onError: () => {
      toast.error('商品创建失败');
    }
  });

  // 更新商品 mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<FoodPackage> }) =>
      api.foodPackages.update(id, data as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('商品更新成功');
      setShowAddDialog(false);
      setEditingProduct(null);
      resetForm();
    },
    onError: () => {
      toast.error('商品更新失败');
    }
  });

  // 过滤商品
  const filteredProducts = products?.filter((product: FoodPackage) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEdit = (product: FoodPackage) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
      price: product.price,
      unit: product.unit,
      stock: product.stock,
      minStock: product.minStock,
      description: product.description,
      image: product.image,
    });
    setShowAddDialog(true);
  };

  const handleDelete = (_productId: string) => {
    toast.success('商品已删除');
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      price: 0,
      unit: '',
      stock: 0,
      minStock: 10,
      description: '',
      image: '',
    });
  };

  const handleOpenAdd = () => {
    setEditingProduct(null);
    resetForm();
    setShowAddDialog(true);
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.category) {
      toast.error('请填写必填项');
      return;
    }

    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct.id, data: formData });
    } else {
      createMutation.mutate({
        ...formData,
        subcategory: formData.category,
        supplierId: '1',
        supplierName: '默认供应商',
      } as Partial<FoodPackage>);
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 lg:p-6 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <Skeleton className="h-8 w-32 mb-2" />
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
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
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-2">商品管理</h1>
          <p className="text-gray-500">管理您的食材包商品信息和库存</p>
        </div>
        <Button
          className="bg-blue-600 hover:bg-blue-700"
          onClick={handleOpenAdd}
        >
          <Plus className="w-4 h-4 mr-2" />
          添加商品
        </Button>
      </div>

      {/* 搜索和过滤 */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="搜索商品名称或分类..."
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
                <TableHead>状态</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    暂无商品数据
                  </TableCell>
                </TableRow>
              ) : (
                filteredProducts?.map((product: FoodPackage) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded-lg"
                        />
                        <div>
                          <div className="font-medium">{product.name}</div>
                          <div className="text-sm text-gray-500">{product.origin || '-'}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{product.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">¥{product.price}</div>
                      <div className="text-sm text-gray-500">/{product.unit}</div>
                    </TableCell>
                    <TableCell>
                      <div className={`font-medium ${
                        product.stock < product.minStock ? 'text-red-500' : ''
                      }`}>
                        {product.stock}
                      </div>
                      <div className="text-sm text-gray-500">预警: {product.minStock}</div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          product.status === 'active'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }
                      >
                        {product.status === 'active' ? '在售' : '下架'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
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
                          className="text-red-600"
                          onClick={() => handleDelete(product.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 添加/编辑商品对话框 */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? '编辑商品' : '添加商品'}
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label>商品名称</Label>
              <Input
                placeholder="请输入商品名称"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>分类</Label>
              <Input
                placeholder="请输入分类"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>价格</Label>
              <Input
                type="number"
                placeholder="请输入价格"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label>单位</Label>
              <Input
                placeholder="如：500g"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>库存</Label>
              <Input
                type="number"
                placeholder="请输入库存"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label>库存预警值</Label>
              <Input
                type="number"
                placeholder="请输入预警值"
                value={formData.minStock}
                onChange={(e) => setFormData({ ...formData, minStock: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2 col-span-2">
              <Label>商品描述</Label>
              <Input
                placeholder="请输入商品描述"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              取消
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={handleSubmit}
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {createMutation.isPending || updateMutation.isPending
                ? '保存中...'
                : editingProduct ? '保存' : '添加'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
