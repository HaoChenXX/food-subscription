import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuthStore, useSubscriptionStore } from '@/store';
import { mockApi } from '@/api/mock';
import {
  Calendar,
  Play,
  Pause,
  X,
  CheckCircle2,
  RotateCcw
} from 'lucide-react';

export default function Subscriptions() {
  const { user } = useAuthStore();
  const { subscriptions, setSubscriptions, updateSubscription } = useSubscriptionStore();
  const [selectedSub, setSelectedSub] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogAction, setDialogAction] = useState<'pause' | 'cancel' | 'resume'>('pause');

  // 获取订阅列表
  const { isLoading } = useQuery({
    queryKey: ['subscriptions', user?.id],
    queryFn: async () => {
      const data = await mockApi.subscriptions.getAll(user?.id || '');
      setSubscriptions(data);
      return data;
    },
    enabled: !!user
  });

  // 更新订阅状态
  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'active' | 'paused' | 'cancelled' }) =>
      mockApi.subscriptions.updateStatus(id, status),
    onSuccess: (data) => {
      updateSubscription(data);
      toast.success('订阅状态已更新');
      setDialogOpen(false);
    },
    onError: () => {
      toast.error('操作失败，请重试');
    }
  });

  const handleAction = (subId: string, action: 'pause' | 'cancel' | 'resume') => {
    setSelectedSub(subId);
    setDialogAction(action);
    setDialogOpen(true);
  };

  const confirmAction = () => {
    if (!selectedSub) return;
    
    const statusMap = {
      pause: 'paused',
      resume: 'active',
      cancel: 'cancelled'
    };
    
    updateMutation.mutate({
      id: selectedSub,
      status: statusMap[dialogAction] as 'active' | 'paused' | 'cancelled'
    });
  };

  const activeSubs = subscriptions.filter(s => s.status === 'active');
  const pausedSubs = subscriptions.filter(s => s.status === 'paused');
  const cancelledSubs = subscriptions.filter(s => s.status === 'cancelled');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  const renderSubscriptionCard = (sub: typeof subscriptions[0]) => (
    <Card key={sub.id} className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h3 className="font-bold text-lg">订阅 #{sub.id}</h3>
              <Badge
                className={
                  sub.status === 'active'
                    ? 'bg-green-100 text-green-700'
                    : sub.status === 'paused'
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-gray-100 text-gray-700'
                }
              >
                {sub.status === 'active' && '进行中'}
                {sub.status === 'paused' && '已暂停'}
                {sub.status === 'cancelled' && '已取消'}
              </Badge>
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="text-gray-500">订阅类型</div>
                <div className="font-medium">
                  {sub.type === 'weekly' && '周订阅'}
                  {sub.type === 'monthly' && '月订阅'}
                  {sub.type === 'quarterly' && '季订阅'}
                </div>
              </div>
              <div>
                <div className="text-gray-500">下次配送</div>
                <div className="font-medium flex items-center">
                  <Calendar className="w-4 h-4 mr-1 text-green-600" />
                  {new Date(sub.nextDeliveryDate).toLocaleDateString()}
                </div>
              </div>
              <div>
                <div className="text-gray-500">配送进度</div>
                <div className="font-medium">
                  {sub.completedDeliveries} / {sub.totalDeliveries}
                </div>
              </div>
              <div>
                <div className="text-gray-500">订阅价格</div>
                <div className="font-medium text-green-600">¥{sub.price}/次</div>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 mt-4 lg:mt-0">
            {sub.status === 'active' && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAction(sub.id, 'pause')}
                >
                  <Pause className="w-4 h-4 mr-1" />
                  暂停
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:text-red-700"
                  onClick={() => handleAction(sub.id, 'cancel')}
                >
                  <X className="w-4 h-4 mr-1" />
                  取消
                </Button>
              </>
            )}
            {sub.status === 'paused' && (
              <Button
                variant="outline"
                size="sm"
                className="text-green-600"
                onClick={() => handleAction(sub.id, 'resume')}
              >
                <Play className="w-4 h-4 mr-1" />
                恢复
              </Button>
            )}
            {sub.status === 'cancelled' && (
              <Button
                variant="outline"
                size="sm"
                asChild
              >
                <Link to="/packages">
                  <RotateCcw className="w-4 h-4 mr-1" />
                  重新订阅
                </Link>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-2xl font-bold mb-2">订阅管理</h1>
        <p className="text-gray-500">管理您的食材包订阅计划</p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center space-x-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">{activeSubs.length}</div>
              <div className="text-sm text-gray-500">进行中</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center space-x-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <Pause className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">{pausedSubs.length}</div>
              <div className="text-sm text-gray-500">已暂停</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center space-x-4">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
              <X className="w-6 h-6 text-gray-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">{cancelledSubs.length}</div>
              <div className="text-sm text-gray-500">已取消</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 订阅列表 */}
      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-flex">
          <TabsTrigger value="active">进行中</TabsTrigger>
          <TabsTrigger value="paused">已暂停</TabsTrigger>
          <TabsTrigger value="cancelled">已取消</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-6 space-y-4">
          {activeSubs.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">暂无进行中的订阅</h3>
              <p className="text-gray-500 mb-4">开始订阅，享受定期配送服务</p>
              <Button asChild className="bg-green-600 hover:bg-green-700">
                <Link to="/packages">去选购</Link>
              </Button>
            </div>
          ) : (
            activeSubs.map(renderSubscriptionCard)
          )}
        </TabsContent>

        <TabsContent value="paused" className="mt-6 space-y-4">
          {pausedSubs.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Pause className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">暂无暂停的订阅</h3>
              <p className="text-gray-500">您可以将订阅暂停，稍后恢复</p>
            </div>
          ) : (
            pausedSubs.map(renderSubscriptionCard)
          )}
        </TabsContent>

        <TabsContent value="cancelled" className="mt-6 space-y-4">
          {cancelledSubs.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <X className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">暂无取消的订阅</h3>
              <p className="text-gray-500">取消的订阅会显示在这里</p>
            </div>
          ) : (
            cancelledSubs.map(renderSubscriptionCard)
          )}
        </TabsContent>
      </Tabs>

      {/* 确认对话框 */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialogAction === 'pause' && '暂停订阅'}
              {dialogAction === 'resume' && '恢复订阅'}
              {dialogAction === 'cancel' && '取消订阅'}
            </DialogTitle>
            <DialogDescription>
              {dialogAction === 'pause' && '暂停后，您的订阅将暂时停止配送，可以随时恢复。'}
              {dialogAction === 'resume' && '恢复后，您的订阅将按原计划继续配送。'}
              {dialogAction === 'cancel' && '取消后，您的订阅将彻底终止，无法恢复。'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              取消
            </Button>
            <Button
              onClick={confirmAction}
              className={
                dialogAction === 'cancel'
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-green-600 hover:bg-green-700'
              }
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? (
                <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                '确认'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
