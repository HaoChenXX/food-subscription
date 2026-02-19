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
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { api } from '@/api/api';
import { toast } from 'sonner';

import {
  Search,
  Filter,
  Eye,
  Mail,
  Phone,
  Calendar,
  ShoppingBag,
  Trash2,
  Loader2,
  RefreshCw,
} from 'lucide-react';

// 后端返回的用户数据格式
interface BackendUser {
  id: number;
  email: string;
  name: string | null;
  phone: string | null;
  role: 'user' | 'merchant' | 'admin';
  avatar: string | null;
  created_at: string;
  updated_at: string;
}

// 后端返回的订单数据格式
interface BackendOrder {
  id: number;
  user_id: number;
  package_id: number;
  total_amount: number;
  status: string;
  created_at: string;
  updated_at: string;
  user_name?: string;
  user_email?: string;
  package_name?: string;
  delivery_address?: string;
}

interface UserWithStats extends BackendUser {
  orders: number;
  status: 'active' | 'inactive';
}

interface Statistics {
  users: {
    total: number;
    today: number;
  };
  orders: {
    total: number;
    totalAmount: number;
    today: number;
    todayAmount: number;
    byStatus: any[];
  };
  packages: {
    total: number;
    lowStock: number;
  };
}

export default function AdminUsers() {
  const [users, setUsers] = useState<UserWithStats[]>([]);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserWithStats | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // 加载用户数据和统计
  const loadData = async () => {
    try {
      setRefreshing(true);
      const [usersDataRaw, statsData, ordersDataRaw] = await Promise.all([
        api.admin.getUsers(),
        api.admin.getStatistics(),
        api.admin.getAllOrders(),
      ]);
      
      const usersData = usersDataRaw as unknown as BackendUser[];
      const ordersData = ordersDataRaw as unknown as BackendOrder[];
      
      // 统计每个用户的订单数
      const userOrderCounts: Record<number, number> = {};
      ordersData.forEach(order => {
        if (order.user_id) {
          userOrderCounts[order.user_id] = (userOrderCounts[order.user_id] || 0) + 1;
        }
      });
      
      // 合并用户数据和订单数
      const usersWithStats: UserWithStats[] = usersData.map(user => ({
        ...user,
        orders: userOrderCounts[user.id] || 0,
        status: 'active' as const,
      }));
      
      setUsers(usersWithStats);
      setStatistics(statsData);
    } catch (error: any) {
      toast.error(error.message || '加载数据失败');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // 删除用户
  const handleDeleteUser = async (userId: number) => {
    if (!confirm('确定要删除此用户吗？此操作不可恢复。')) {
      return;
    }
    
    try {
      await api.admin.deleteUser(userId);
      toast.success('用户已删除');
      loadData(); // 刷新数据
    } catch (error: any) {
      toast.error(error.message || '删除用户失败');
    }
  };

  // 过滤用户
  const filteredUsers = users.filter(user =>
    (user.name?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (user.phone?.includes(searchQuery) || false)
  );

  // 统计数据
  const totalUsers = statistics?.users.total || users.length || 0;
  const normalUsers = users.filter(u => u.role === 'user').length;
  const merchantUsers = users.filter(u => u.role === 'merchant').length;
  const todayNewUsers = statistics?.users.today || 0;

  const handleViewDetail = (user: UserWithStats) => {
    setSelectedUser(user);
    setShowDetailDialog(true);
  };

  if (loading) {
    return (
      <div className="p-4 lg:p-6 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
          <p className="text-gray-500">加载用户数据中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-2">用户管理</h1>
          <p className="text-gray-500">管理平台所有用户信息</p>
        </div>
        <Button 
          variant="outline" 
          onClick={loadData}
          disabled={refreshing}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          刷新
        </Button>
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
            <div className="text-2xl font-bold">{totalUsers}</div>
            <div className="text-sm text-gray-500">总用户数</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{normalUsers}</div>
            <div className="text-sm text-gray-500">普通用户</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{merchantUsers}</div>
            <div className="text-sm text-gray-500">商家用户</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">+{todayNewUsers}</div>
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
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    暂无用户数据
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-purple-100 text-purple-600">
                            {user.name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{user.name || '未设置昵称'}</div>
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
                      {user.created_at 
                        ? new Date(user.created_at).toLocaleDateString('zh-CN') 
                        : '-'}
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
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleDeleteUser(user.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        删除
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
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
                    {selectedUser.name?.charAt(0) || selectedUser.email.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-bold">{selectedUser.name || '未设置昵称'}</h3>
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
                    <div>{selectedUser.phone || '未设置'}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-500">注册时间</div>
                    <div>{selectedUser.created_at 
                      ? new Date(selectedUser.created_at).toLocaleDateString('zh-CN') 
                      : '-'}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <ShoppingBag className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-500">订单数</div>
                    <div>{selectedUser.orders || 0}</div>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <Button 
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                  onClick={() => toast.info('编辑功能开发中...')}
                >
                  编辑用户
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => toast.info('订单查看功能开发中...')}
                >
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
