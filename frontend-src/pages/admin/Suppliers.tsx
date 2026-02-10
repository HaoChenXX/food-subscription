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
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
// import { mockApi } from '@/api/mock';
import {
  Search,
  Plus,
  Truck,
  Phone,
  Mail,
  MapPin,
  Star,
  Eye,
  Package
} from 'lucide-react';
// import { toast } from 'sonner';

// 模拟供应商数据
const mockSuppliers = [
  { 
    id: '1', 
    name: '山东禽肉供应商', 
    contact: '王经理', 
    phone: '13800138001', 
    email: 'wang@example.com',
    address: '山东省济南市历城区',
    products: 15,
    rating: 4.8,
    status: 'active',
    joinDate: '2023-06-15'
  },
  { 
    id: '2', 
    name: '云南蔬菜基地', 
    contact: '李经理', 
    phone: '13800138002', 
    email: 'li@example.com',
    address: '云南省昆明市呈贡区',
    products: 32,
    rating: 4.6,
    status: 'active',
    joinDate: '2023-08-20'
  },
  { 
    id: '3', 
    name: '澳洲牛肉进口商', 
    contact: '张经理', 
    phone: '13800138003', 
    email: 'zhang@example.com',
    address: '上海市浦东新区',
    products: 8,
    rating: 4.9,
    status: 'active',
    joinDate: '2023-05-10'
  },
  { 
    id: '4', 
    name: '青岛海鲜供应商', 
    contact: '赵经理', 
    phone: '13800138004', 
    email: 'zhao@example.com',
    address: '山东省青岛市市南区',
    products: 12,
    rating: 4.5,
    status: 'delayed',
    joinDate: '2023-09-01'
  },
];

export default function AdminSuppliers() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<any>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);

  // 过滤供应商
  const filteredSuppliers = mockSuppliers.filter(supplier =>
    supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    supplier.contact.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleViewDetail = (supplier: any) => {
    setSelectedSupplier(supplier);
    setShowDetailDialog(true);
  };

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* 页面标题 */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-2">供应商管理</h1>
          <p className="text-gray-500">管理平台供应商信息和合作状态</p>
        </div>
        <Button
          className="bg-purple-600 hover:bg-purple-700"
          onClick={() => setShowAddDialog(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          添加供应商
        </Button>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{mockSuppliers.length}</div>
            <div className="text-sm text-gray-500">总供应商</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {mockSuppliers.filter(s => s.status === 'active').length}
            </div>
            <div className="text-sm text-gray-500">合作中</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">
              {mockSuppliers.filter(s => s.status === 'delayed').length}
            </div>
            <div className="text-sm text-gray-500">延迟</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {(mockSuppliers.reduce((acc, s) => acc + s.rating, 0) / mockSuppliers.length).toFixed(1)}
            </div>
            <div className="text-sm text-gray-500">平均评分</div>
          </CardContent>
        </Card>
      </div>

      {/* 搜索 */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="搜索供应商名称或联系人..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* 供应商列表 */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>供应商</TableHead>
                <TableHead>联系人</TableHead>
                <TableHead>供应商品</TableHead>
                <TableHead>评分</TableHead>
                <TableHead>状态</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSuppliers.map((supplier) => (
                <TableRow key={supplier.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <Truck className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <div className="font-medium">{supplier.name}</div>
                        <div className="text-sm text-gray-500">{supplier.address}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>{supplier.contact}</div>
                    <div className="text-sm text-gray-500">{supplier.phone}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Package className="w-4 h-4 mr-1 text-gray-400" />
                      {supplier.products} 种
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Star className="w-4 h-4 mr-1 text-yellow-500 fill-current" />
                      {supplier.rating}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        supplier.status === 'active'
                          ? 'bg-green-100 text-green-700'
                          : supplier.status === 'delayed'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-gray-100 text-gray-700'
                      }
                    >
                      {supplier.status === 'active' && '正常'}
                      {supplier.status === 'delayed' && '延迟'}
                      {supplier.status === 'inactive' && '停用'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewDetail(supplier)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      查看
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 添加供应商对话框 */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>添加供应商</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label>供应商名称</Label>
              <Input placeholder="请输入供应商名称" />
            </div>
            <div className="space-y-2">
              <Label>联系人</Label>
              <Input placeholder="请输入联系人姓名" />
            </div>
            <div className="space-y-2">
              <Label>联系电话</Label>
              <Input placeholder="请输入联系电话" />
            </div>
            <div className="space-y-2">
              <Label>邮箱</Label>
              <Input type="email" placeholder="请输入邮箱" />
            </div>
            <div className="space-y-2 col-span-2">
              <Label>地址</Label>
              <Input placeholder="请输入地址" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              取消
            </Button>
            <Button className="bg-purple-600 hover:bg-purple-700">
              添加
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 供应商详情对话框 */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>供应商详情</DialogTitle>
          </DialogHeader>
          {selectedSupplier && (
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                  <Truck className="w-8 h-8 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">{selectedSupplier.name}</h3>
                  <Badge
                    className={
                      selectedSupplier.status === 'active'
                        ? 'bg-green-100 text-green-700'
                        : selectedSupplier.status === 'delayed'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-gray-100 text-gray-700'
                    }
                  >
                    {selectedSupplier.status === 'active' && '正常'}
                    {selectedSupplier.status === 'delayed' && '延迟'}
                    {selectedSupplier.status === 'inactive' && '停用'}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-500">联系电话</div>
                    <div>{selectedSupplier.phone}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-500">邮箱</div>
                    <div>{selectedSupplier.email}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg col-span-2">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-500">地址</div>
                    <div>{selectedSupplier.address}</div>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <Button className="flex-1 bg-purple-600 hover:bg-purple-700">
                  编辑信息
                </Button>
                <Button variant="outline" className="flex-1">
                  查看供应商品
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
