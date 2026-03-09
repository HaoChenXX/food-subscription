import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuthStore, useSubscriptionStore, useUIStore } from '@/store';
import { t } from '@/lib/i18n';
import {
  Calendar,
  Play,
  Pause,
  X,
  CheckCircle2,
  RotateCcw
} from 'lucide-react';

// 演示订阅数据（直接内嵌，不依赖后端）
const demoSubscriptionsData = [
  {
    id: 'SUB202503010001',
    userId: '3',
    packageId: '1',
    packageName: '健康减脂套餐',
    packageImage: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop',
    type: 'weekly' as const,
    status: 'active' as const,
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    nextDeliveryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    totalDeliveries: 4,
    completedDeliveries: 1,
    price: 89
  },
  {
    id: 'SUB202502150002',
    userId: '3',
    packageId: '2',
    packageName: '增肌能量套餐',
    packageImage: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=800&auto=format&fit=crop',
    type: 'monthly' as const,
    status: 'paused' as const,
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    nextDeliveryDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    totalDeliveries: 2,
    completedDeliveries: 2,
    price: 129
  },
  {
    id: 'SUB202501100003',
    userId: '3',
    packageId: '3',
    packageName: '地中海风味套餐',
    packageImage: 'https://images.unsplash.com/photo-1543339308-43e59d6b73a6?w=800&auto=format&fit=crop',
    type: 'weekly' as const,
    status: 'cancelled' as const,
    startDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    nextDeliveryDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    totalDeliveries: 4,
    completedDeliveries: 4,
    price: 159
  }
];

export default function Subscriptions() {
  const { user } = useAuthStore();
  const { subscriptions, setSubscriptions, updateSubscription } = useSubscriptionStore();
  const { language } = useUIStore();
  const [selectedSub, setSelectedSub] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogAction, setDialogAction] = useState<'pause' | 'cancel' | 'resume'>('pause');
  const [isLoading, setIsLoading] = useState(true);

  // 获取订阅列表 - 使用假数据
  useEffect(() => {
    if (user) {
      console.log('使用演示订阅数据');
      setSubscriptions(demoSubscriptionsData);
      setIsLoading(false);
    }
  }, [user, setSubscriptions]);

  // 更新订阅状态 - 直接操作本地数据
  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'active' | 'paused' | 'cancelled' }) => {
      // 直接更新本地数据
      const updatedSub = subscriptions.find(s => s.id === id);
      if (updatedSub) {
        const newSub = { ...updatedSub, status };
        return Promise.resolve(newSub);
      }
      return Promise.reject('订阅不存在');
    },
    onSuccess: (data) => {
      updateSubscription(data);
      toast.success(t('subscription.updateSuccess', language));
      setDialogOpen(false);
    },
    onError: () => {
      toast.error(t('subscription.updateError', language));
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
              <h3 className="font-bold text-lg">{t('subscription.id', language)} #{sub.id}</h3>
              <Badge
                className={
                  sub.status === 'active'
                    ? 'bg-green-100 text-green-700'
                    : sub.status === 'paused'
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-gray-100 text-gray-700'
                }
              >
                {sub.status === 'active' && t('subscription.status.active', language)}
                {sub.status === 'paused' && t('subscription.status.paused', language)}
                {sub.status === 'cancelled' && t('subscription.status.cancelled', language)}
              </Badge>
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="text-gray-500">{t('subscription.type', language)}</div>
                <div className="font-medium">
                  {sub.type === 'weekly' && t('subscription.type.weekly', language)}
                  {sub.type === 'monthly' && t('subscription.type.monthly', language)}
                  {sub.type === 'quarterly' && t('subscription.type.quarterly', language)}
                </div>
              </div>
              <div>
                <div className="text-gray-500">{t('subscription.nextDelivery', language)}</div>
                <div className="font-medium flex items-center">
                  <Calendar className="w-4 h-4 mr-1 text-green-600" />
                  {new Date(sub.nextDeliveryDate).toLocaleDateString()}
                </div>
              </div>
              <div>
                <div className="text-gray-500">{t('subscription.deliveryProgress', language)}</div>
                <div className="font-medium">
                  {sub.completedDeliveries} / {sub.totalDeliveries}
                </div>
              </div>
              <div>
                <div className="text-gray-500">{t('subscription.price', language)}</div>
                <div className="font-medium text-green-600">¥{sub.price}/{t('subscription.perDelivery', language)}</div>
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
                  {t('subscription.pause', language)}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:text-red-700"
                  onClick={() => handleAction(sub.id, 'cancel')}
                >
                  <X className="w-4 h-4 mr-1" />
                  {t('subscription.cancel', language)}
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
                {t('subscription.resume', language)}
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
                  {t('subscription.resubscribe', language)}
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
        <h1 className="text-2xl font-bold mb-2">{t('subscription.title', language)}</h1>
        <p className="text-gray-500">{t('subscription.subtitle', language)}</p>
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
              <div className="text-sm text-gray-500">{t('subscription.status.active', language)}</div>
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
              <div className="text-sm text-gray-500">{t('subscription.status.paused', language)}</div>
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
              <div className="text-sm text-gray-500">{t('subscription.status.cancelled', language)}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 订阅列表 */}
      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-flex">
          <TabsTrigger value="active">{t('subscription.status.active', language)}</TabsTrigger>
          <TabsTrigger value="paused">{t('subscription.status.paused', language)}</TabsTrigger>
          <TabsTrigger value="cancelled">{t('subscription.status.cancelled', language)}</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-6 space-y-4">
          {activeSubs.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">{t('subscription.emptyActive', language)}</h3>
              <p className="text-gray-500 mb-4">{t('subscription.startHint', language)}</p>
              <Button asChild className="bg-green-600 hover:bg-green-700">
                <Link to="/packages">{t('subscription.browse', language)}</Link>
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
              <h3 className="text-lg font-medium text-gray-900 mb-1">{t('subscription.emptyPaused', language)}</h3>
              <p className="text-gray-500">{t('subscription.pauseHint', language)}</p>
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
              <h3 className="text-lg font-medium text-gray-900 mb-1">{t('subscription.emptyCancelled', language)}</h3>
              <p className="text-gray-500">{t('subscription.cancelledHint', language)}</p>
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
              {dialogAction === 'pause' && t('subscription.pauseTitle', language)}
              {dialogAction === 'resume' && t('subscription.resumeTitle', language)}
              {dialogAction === 'cancel' && t('subscription.cancelTitle', language)}
            </DialogTitle>
            <DialogDescription>
              {dialogAction === 'pause' && t('subscription.pauseDescription', language)}
              {dialogAction === 'resume' && t('subscription.resumeDescription', language)}
              {dialogAction === 'cancel' && t('subscription.cancelDescription', language)}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              {t('common.cancel', language)}
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
                t('common.confirm', language)
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
