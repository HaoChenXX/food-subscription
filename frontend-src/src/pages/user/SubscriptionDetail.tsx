import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuthStore, useSubscriptionStore, useUIStore } from '@/store';
import { mockApi } from '@/api/mock';
import { formatPrice, formatDate } from '@/lib/utils';
import { t } from '@/lib/i18n';
import {
  ArrowLeft,
  Calendar,
  Package,
  Truck,
  RotateCcw,
  Pause,
  Play,
  X,
  CheckCircle2,
  Clock,
  MapPin
} from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';

export default function SubscriptionDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { subscriptions, updateSubscription } = useSubscriptionStore();
  const { language } = useUIStore();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogAction, setDialogAction] = useState<'pause' | 'cancel' | 'resume'>('pause');

  // 获取订阅详情
  const { data: subscription, isLoading } = useQuery({
    queryKey: ['subscription', id],
    queryFn: async () => {
      const subs = await mockApi.subscriptions.getAll(user?.id || '');
      return subs.find(s => s.id === id);
    },
    enabled: !!id && !!user
  });

  // 优先使用 store 中的数据
  const sub = subscriptions.find(s => s.id === id) || subscription;

  // 更新订阅状�?
  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'active' | 'paused' | 'cancelled' }) =>
      mockApi.subscriptions.updateStatus(id, status),
    onSuccess: (data) => {
      updateSubscription(data);
      toast.success(t('', language));
      setDialogOpen(false);
    },
    onError: () => {
      toast.error(t('', language));
    }
  });

  const handleAction = (action: 'pause' | 'cancel' | 'resume') => {
    setDialogAction(action);
    setDialogOpen(true);
  };

  const confirmAction = () => {
    if (!id) return;
    
    const statusMap = {
      pause: 'paused',
      resume: 'active',
      cancel: 'cancelled'
    };
    
    updateMutation.mutate({
      id,
      status: statusMap[dialogAction] as 'active' | 'paused' | 'cancelled'
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!sub) {
    return (
      <div className="p-4 lg:p-6 text-center">
        <h2 className="text-xl font-bold mb-2">{t('', language)}</h2>
        <Button onClick={() => navigate('/subscriptions')} variant="outline">
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t('', language)}
        </Button>
      </div>
    );
  }

  const progressPercent = sub.totalDeliveries > 0 
    ? (sub.completedDeliveries / sub.totalDeliveries) * 100 
    : 0;

  const statusConfig = {
    active: { label: t('', language), color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
    paused: { label: t('', language), color: 'bg-yellow-100 text-yellow-700', icon: Pause },
    cancelled: { label: t('', language), color: 'bg-gray-100 text-gray-700', icon: X },
  };

  const typeConfig = {
    weekly: { label: t('', language), desc: t('', language) },
    monthly: { label: t('', language), desc: t('', language) },
    quarterly: { label: t('', language), desc: t('', language) },
  };

  const status = statusConfig[sub.status];
  const type = typeConfig[sub.type];
  const StatusIcon = status.icon;

  return (
    <div className="p-4 lg:p-6 max-w-4xl mx-auto">
      {/* 返回按钮 */}
      <Button
        variant="ghost"
        className="mb-4"
        onClick={() => navigate('/subscriptions')}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        {t('', language)}
      </Button>

      {/* 订阅状态卡�?*/}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-2xl font-bold">{t('', language)} #{sub.id}</h1>
                <Badge className={status.color}>
                  <StatusIcon className="w-3 h-3 mr-1" />
                  {status.label}
                </Badge>
              </div>
              <p className="text-gray-500">
                {t('', language)}：{formatDate(sub.startDate)}
              </p>
            </div>
            <div className="mt-4 lg:mt-0 text-right">
              <div className="text-3xl font-bold text-green-600">
                {formatPrice(sub.price)}
                <span className="text-sm text-gray-500 font-normal">{t('', language)}</span>
              </div>
            </div>
          </div>

          {/* 进度�?*/}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">{t('', language)}</span>
              <span className="font-medium">{sub.completedDeliveries} / {sub.totalDeliveries} {t('', language)}</span>
            </div>
            <Progress value={progressPercent} className="h-3" />
            <p className="text-sm text-gray-500">
              {t('', language)} {Math.round(progressPercent)}% {t('', language)}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧：订阅信�?*/}
        <div className="lg:col-span-2 space-y-6">
          {/* 订阅详情 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Package className="w-5 h-5 mr-2 text-green-600" />
                {t('', language)}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-500 mb-1"></div>
                  <div className="font-medium">{type.label}</div>
                  <div className="text-sm text-gray-500">{type.desc}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1"></div>
                  <div className="font-medium flex items-center">
                    <Calendar className="w-4 h-4 mr-1 text-green-600" />
                    {formatDate(sub.nextDeliveryDate)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1"></div>
                  <div className="font-medium">{sub.completedDeliveries} / {sub.totalDeliveries} </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1"></div>
                  <div className="font-medium text-green-600">{formatPrice(sub.price)}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 配送时间线 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Truck className="w-5 h-5 mr-2 text-green-600" />
                {t('', language)}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {sub.completedDeliveries === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>{t('', language)}</p>
                  <p className="text-sm">{t('subscription.nextDelivery', language)}: {formatDate(sub.nextDeliveryDate)} {t('', language)}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {Array.from({ length: sub.completedDeliveries }).map((_, index) => (
                    <div key={index} className="flex items-center space-x-4">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{t('subscription.deliveryNumber', language).replace('{number}', String(index + 1))}</div>
                        <div className="text-sm text-gray-500"></div>
                      </div>
                    </div>
                  ))}
                  {sub.status === 'active' && (
                    <div className="flex items-center space-x-4">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Clock className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{t('subscription.deliveryNumber', language).replace('{number}', String(sub.completedDeliveries + 1))}</div>
                        <div className="text-sm text-gray-500">{t('', language)} {formatDate(sub.nextDeliveryDate)}</div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 右侧：操作面�?*/}
        <div className="space-y-6">
          {/* 状态信�?*/}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('', language)}</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className={`p-4 rounded-lg ${status.color}`}>
                <div className="flex items-center space-x-2">
                  <StatusIcon className="w-5 h-5" />
                  <span className="font-medium">{status.label}</span>
                </div>
                <p className="text-sm mt-1 opacity-80">
                  {sub.status === 'active' && t('', language)}
                  {sub.status === 'paused' && t('', language)}
                  {sub.status === 'cancelled' && t('', language)}
                </p>
              </div>

              <Separator />

              {/* 操作按钮 */}
              <div className="space-y-3">
                {sub.status === 'active' && (
                  <>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => handleAction('pause')}
                    >
                      <Pause className="w-4 h-4 mr-2" />
                      {t('', language)}
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full text-red-600 hover:text-red-700"
                      onClick={() => handleAction('cancel')}
                    >
                      <X className="w-4 h-4 mr-2" />
                      {t('', language)}
                    </Button>
                  </>
                )}
                {sub.status === 'paused' && (
                  <>
                    <Button
                      className="w-full bg-green-600 hover:bg-green-700"
                      onClick={() => handleAction('resume')}
                    >
                      <Play className="w-4 h-4 mr-2" />
                      {t('', language)}
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full text-red-600 hover:text-red-700"
                      onClick={() => handleAction('cancel')}
                    >
                      <X className="w-4 h-4 mr-2" />
                      {t('', language)}
                    </Button>
                  </>
                )}
                {sub.status === 'cancelled' && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => navigate('/packages')}
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    {t('', language)}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 帮助信息 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-green-600" />
                {t('', language)}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-sm text-gray-500 mb-4">
                {t('', language)}
              </p>
              <Button variant="outline" className="w-full">
                {t('', language)}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 确认对话�?*/}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialogAction === 'pause' && t('', language)}
              {dialogAction === 'resume' && t('', language)}
              {dialogAction === 'cancel' && t('', language)}
            </DialogTitle>
            <DialogDescription>
              {dialogAction === 'pause' && t('', language)}
              {dialogAction === 'resume' && t('', language)}
              {dialogAction === 'cancel' && t('', language)}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              {t('', language)}
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
                t('', language)
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
