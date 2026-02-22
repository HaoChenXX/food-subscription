import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useCartStore, useOrderStore } from '@/store';
import { api } from '@/api/api';
import type { Order } from '@/types';
import {
  MapPin,
  Clock,
  CreditCard,
  CheckCircle2,
  Package,
  Plus,
  Loader2,
  Shield
} from 'lucide-react';

const timeSlots = [
  '09:00-12:00',
  '12:00-14:00',
  '14:00-18:00',
  '18:00-21:00',
];

const paymentMethods = [
  { id: 'wechat', name: '微信支付', icon: '💚' },
  { id: 'alipay', name: '支付宝', icon: '💙' },
];

export default function Checkout() {
  const navigate = useNavigate();
  const { items, getTotalAmount, clearCart } = useCartStore();
  const { addOrder } = useOrderStore();
  
  const [selectedAddress, setSelectedAddress] = useState('1');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(timeSlots[0]);
  const [selectedPayment, setSelectedPayment] = useState('wechat');
  const [deliveryDate, setDeliveryDate] = useState(
    new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState('');

  // 模拟地址数据
  const addresses = [
    {
      id: '1',
      name: '张三',
      phone: '13800138000',
      province: '北京市',
      city: '北京市',
      district: '朝阳区',
      address: '建国路88号院1号楼',
      isDefault: true
    }
  ];

  const totalAmount = getTotalAmount();

  // 创建订单
  const createOrderMutation = useMutation({
    mutationFn: async () => {
      const address = addresses.find(a => a.id === selectedAddress);
      if (!address) throw new Error('请选择配送地址');

      // 为第一个购物车商品创建订单（简化流程）
      const firstItem = items[0];

      const order = await api.orders.create({
        packageId: firstItem.packageId,
        quantity: firstItem.quantity,
        deliveryAddress: address,
        contactName: address?.name || '',
        contactPhone: address?.phone || '',
        remark: firstItem.subscriptionType
      } as Partial<Order>);

      return [order]; // 返回数组以保持兼容性
    },
    onSuccess: async (orders) => {
      orders.forEach(order => addOrder(order));
      setCreatedOrderId(orders[0].id);
      clearCart();

      // 直接支付第一个订单（简化流程）
      try {
        await api.orders.pay(orders[0].id, 'mock');
        toast.success('订单创建并支付成功！');
        localStorage.setItem('shouldRefreshOrders', 'true');
        // 跳转到订单列表页
        setTimeout(() => {
          navigate('/orders', { state: { refresh: true } });
        }, 1500);
      } catch (error: any) {
        toast.error(error.message || '支付失败，但订单已创建');
        setShowSuccessDialog(true);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || '创建订单失败');
    }
  });

  const handleSubmit = () => {
    if (items.length === 0) {
      toast.error('购物车为空');
      navigate('/packages');
      return;
    }

    // 如果购物车有多个商品，显示提示
    if (items.length > 1) {
      toast.info('购物车有多个商品，目前只支持逐个结算', { duration: 3000 });
    }

    createOrderMutation.mutate();
  };

  if (items.length === 0) {
    return (
      <div className="p-4 lg:p-6 text-center">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Package className="w-12 h-12 text-gray-400" />
        </div>
        <h2 className="text-xl font-medium mb-2">购物车为空</h2>
        <p className="text-gray-500 mb-6">请先选择您喜欢的食材包</p>
        <Button asChild className="bg-green-600 hover:bg-green-700">
          <a href="/packages">去选购</a>
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">确认订单</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧：订单信息 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 配送地址 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-green-600" />
                配送地址
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <RadioGroup
                value={selectedAddress}
                onValueChange={setSelectedAddress}
                className="space-y-3"
              >
                {addresses.map((address) => (
                  <div
                    key={address.id}
                    className={`flex items-start space-x-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedAddress === address.id
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <RadioGroupItem value={address.id} id={address.id} className="mt-1" />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <Label htmlFor={address.id} className="font-medium">
                          {address.name} {address.phone}
                        </Label>
                        {address.isDefault && (
                          <Badge variant="secondary" className="text-xs">默认</Badge>
                        )}
                      </div>
                      <p className="text-gray-500 text-sm mt-1">
                        {address.province} {address.city} {address.district}
                      </p>
                      <p className="text-gray-500 text-sm">{address.address}</p>
                    </div>
                  </div>
                ))}
              </RadioGroup>
              <Button variant="outline" className="mt-4 w-full">
                <Plus className="w-4 h-4 mr-2" />
                添加新地址
              </Button>
            </CardContent>
          </Card>

          {/* 配送时间 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Clock className="w-5 h-5 mr-2 text-green-600" />
                配送时间
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="mb-4">
                <Label className="mb-2 block">选择日期</Label>
                <input
                  type="date"
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
              <div>
                <Label className="mb-2 block">选择时段</Label>
                <RadioGroup
                  value={selectedTimeSlot}
                  onValueChange={setSelectedTimeSlot}
                  className="grid grid-cols-2 gap-3"
                >
                  {timeSlots.map((slot) => (
                    <div key={slot}>
                      <RadioGroupItem
                        value={slot}
                        id={slot}
                        className="peer sr-only"
                      />
                      <Label
                        htmlFor={slot}
                        className="flex items-center justify-center p-3 border-2 rounded-lg cursor-pointer transition-all peer-data-[state=checked]:border-green-500 peer-data-[state=checked]:bg-green-50 hover:bg-gray-50"
                      >
                        {slot}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </CardContent>
          </Card>

          {/* 商品清单 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Package className="w-5 h-5 mr-2 text-green-600" />
                商品清单
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={item.packageId}
                    className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg"
                  >
                    <img
                      src={item.packageImage}
                      alt={item.packageName}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium">{item.packageName}</h4>
                      <p className="text-sm text-gray-500">
                        {item.subscriptionType === 'weekly' && '周订阅'}
                        {item.subscriptionType === 'monthly' && '月订阅'}
                        {item.subscriptionType === 'quarterly' && '季订阅'}
                        {' '}× {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">
                        ¥{item.price * item.quantity}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 支付方式 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <CreditCard className="w-5 h-5 mr-2 text-green-600" />
                支付方式
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <RadioGroup
                value={selectedPayment}
                onValueChange={setSelectedPayment}
                className="grid grid-cols-2 gap-4"
              >
                {paymentMethods.map((method) => (
                  <div key={method.id}>
                    <RadioGroupItem
                      value={method.id}
                      id={method.id}
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor={method.id}
                      className="flex items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-all peer-data-[state=checked]:border-green-500 peer-data-[state=checked]:bg-green-50 hover:bg-gray-50"
                    >
                      <span className="text-2xl mr-2">{method.icon}</span>
                      <span>{method.name}</span>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>
        </div>

        {/* 右侧：订单摘要 */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardContent className="p-6">
              <h3 className="font-bold text-lg mb-4">订单摘要</h3>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">商品总数</span>
                  <span>{items.length} 件</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">商品金额</span>
                  <span>¥{totalAmount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">运费</span>
                  <span className="text-green-600">免运费</span>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="flex justify-between items-center mb-6">
                <span className="font-medium">应付总额</span>
                <span className="text-3xl font-bold text-green-600">
                  ¥{totalAmount}
                </span>
              </div>

              <Button
                className="w-full h-12 bg-green-600 hover:bg-green-700"
                onClick={handleSubmit}
                disabled={createOrderMutation.isPending}
              >
                {createOrderMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    处理中...
                  </>
                ) : (
                  '确认支付'
                )}
              </Button>

              <div className="flex items-center justify-center mt-4 text-sm text-gray-500">
                <Shield className="w-4 h-4 mr-1" />
                安全支付保障
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 支付成功弹窗 */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <DialogTitle className="text-xl">支付成功！</DialogTitle>
          </DialogHeader>
          <div className="text-center space-y-4">
            <p className="text-gray-500">
              您的订单已创建成功，我们将尽快为您配送。
            </p>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-500">订单编号</div>
              <div className="font-medium">{createdOrderId}</div>
            </div>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => navigate('/orders')}
              >
                查看订单
              </Button>
              <Button
                className="flex-1 bg-green-600 hover:bg-green-700"
                onClick={() => navigate('/')}
              >
                返回首页
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
