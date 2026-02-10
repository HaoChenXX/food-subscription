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
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
// import { mockApi } from '@/api/mock';
import {
  Search,
  Filter,
  Eye,
  Mail,
  Phone,
  Calendar,
  ShoppingBag
} from 'lucide-react';

// 模拟用户数据
const mockUsers = [
  { id: '1', name: '张三', email: 'zhangsan@example.com', phone: '13800138000', role: 'user', orders: 12, joinedAt: '2024-01-15', status: 'active' },
  { id: '2', name: '李四', email: 'lisi@example.com', phone: '13900139000', role: 'user', orders: 8, joinedAt: '2024-02-01', status: 'active' },
  { id: '3', name: '王五', email: 'wangwu@example.com', phone: '13700137000', role: 'merchant', orders: 0, joinedAt: '2023-12-20', status: 'active' },
  { id: '4', name: '赵六', email: 'zhaoliu@example.com', phone: '13600136000', role: 'user', orders: 25, joinedAt: '2023-11-10', status: 'inactive' },
  { id: '5', name: '钱七', email: 'qianqi@example.com', phone: '13500135000', role: 'user', orders: 3, joinedAt: '2024-03-01', status: 'active' },
];

export default function AdminUsers() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);

  // 过滤用户
  const filteredUsers = mockUsers.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.phone.includes(searchQuery)
  );

  const handleViewDetail = (user: any) => {
    setSelectedUser(user);
    setShowDetailDialog(true);
  };

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-2xl font-bold mb-2">用户管理</h1>
        <p className="text-gray-500">管理平台所有用户信息</p>
      </div>

      {/* 搜索和过滤 */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="搜索用户姓名、邮箱或手机号..."
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

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">1,256</div>
            <div className="text-sm text-gray-500">总用户数</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">1,180</div>
            <div className="text-sm text-gray-500">普通用户</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">48</div>
            <div className="text-sm text-gray-500">商家用户</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">28</div>
            <div className="text-sm text-gray-500">今日新增</div>
          </CardContent>
        </Card>
      </div>

      {/* 用户列表 */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>用户信息</TableHead>
                <TableHead>角色</TableHead>
                <TableHead>订单数</TableHead>
                <TableHead>注册时间</TableHead>
                <TableHead>状态</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-purple-100 text-purple-600">
                          {user.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        user.role === 'admin'
                          ? 'bg-purple-100 text-purple-700'
                          : user.role === 'merchant'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-700'
                      }
                    >
                      {user.role === 'admin' && '管理员'}
                      {user.role === 'merchant' && '商家'}
                      {user.role === 'user' && '普通用户'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <ShoppingBag className="w-4 h-4 mr-1 text-gray-400" />
                      {user.orders}
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Date(user.joinedAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        user.status === 'active'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      }
                    >
                      {user.status === 'active' ? '正常' : '禁用'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewDetail(user)}
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

      {/* 用户详情对话框 */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>用户详情</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="bg-purple-100 text-purple-600 text-xl">
                    {selectedUser.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-bold">{selectedUser.name}</h3>
                  <Badge
                    className={
                      selectedUser.role === 'admin'
                        ? 'bg-purple-100 text-purple-700'
                        : selectedUser.role === 'merchant'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-700'
                    }
                  >
                    {selectedUser.role === 'admin' && '管理员'}
                    {selectedUser.role === 'merchant' && '商家'}
                    {selectedUser.role === 'user' && '普通用户'}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-500">邮箱</div>
                    <div>{selectedUser.email}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-500">手机号</div>
                    <div>{selectedUser.phone}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-500">注册时间</div>
                    <div>{new Date(selectedUser.joinedAt).toLocaleDateString()}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <ShoppingBag className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-500">订单数</div>
                    <div>{selectedUser.orders}</div>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <Button className="flex-1 bg-purple-600 hover:bg-purple-700">
                  编辑用户
                </Button>
                <Button variant="outline" className="flex-1">
                  查看订单
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
