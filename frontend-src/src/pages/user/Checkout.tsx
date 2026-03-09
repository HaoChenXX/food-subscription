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
import { useCartStore, useOrderStore, useUIStore } from '@/store';
import { api } from '@/api/api';
import { t } from '@/lib/i18n';
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
  { id: 'wechat', name: 'wechat', icon: '💚' },
  { id: 'alipay', name: 'alipay', icon: '💙' },
];

export default function Checkout() {
  const navigate = useNavigate();
  const { items, getTotalAmount, clearCart } = useCartStore();
  const { addOrder } = useOrderStore();
  const { language } = useUIStore();
  
  const [selectedAddress, setSelectedAddress] = useState('1');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(timeSlots[0]);
  const [selectedPayment, setSelectedPayment] = useState('wechat');
  const [deliveryDate, setDeliveryDate] = useState(
    new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState('');

  // Mock address data
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

  // 创建订单 - 支持多个商品
  const createOrderMutation = useMutation({
    mutationFn: async () => {
      const address = addresses.find(a => a.id === selectedAddress);
      if (!address) throw new Error('请选择配送地址');

      // 为每个购物车商品创建订单
      const createdOrders: Order[] = [];
      
      for (const item of items) {
        const order = await api.orders.create({
          packageId: item.packageId,
          quantity: item.quantity,
          deliveryAddress: address,
          contactName: address?.name || '',
          contactPhone: address?.phone || '',
          remark: `${item.subscriptionType}|${deliveryDate}|${selectedTimeSlot}`
        } as Partial<Order>);
        createdOrders.push(order);
      }

      return createdOrders;
    },
    onSuccess: async (orders) => {
      orders.forEach(order => addOrder(order));
      setCreatedOrderId(orders[0].id);
      clearCart();

      // 支付所有订单
      try {
        for (const order of orders) {
          await api.orders.pay(order.id, selectedPayment);
        }
        toast.success(`成功创建并支付 ${orders.length} 个订单！`);
        localStorage.setItem('shouldRefreshOrders', 'true');
        // 跳转到订单列表页
        setTimeout(() => {
          navigate('/orders', { state: { refresh: true } });
        }, 1500);
      } catch (error: any) {
        toast.error(error.message || '部分订单支付失败');
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

    createOrderMutation.mutate();
  };

  if (items.length === 0) {
    return (
      <div className="p-4 lg:p-6 text-center">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Package className="w-12 h-12 text-gray-400" />
        </div>
        <h2 className="text-xl font-medium mb-2">{t('checkout.emptyCart', language)}</h2>
        <p className="text-gray-500 mb-6">{t('checkout.emptyCartDesc', language)}</p>
        <Button asChild className="bg-green-600 hover:bg-green-700">
          <a href="/packages">{t('checkout.goShopping', language)}</a>
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">{t('checkout.title', language)}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Order Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Delivery Address */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-green-600" />
                {t('checkout.deliveryAddress', language)}
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
                          <Badge variant="secondary" className="text-xs">{t('checkout.default', language)}</Badge>
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
                {t('checkout.addAddress', language)}
              </Button>
            </CardContent>
          </Card>

          {/* Delivery Time */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Clock className="w-5 h-5 mr-2 text-green-600" />
                {t('checkout.deliveryTime', language)}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="mb-4">
                <Label className="mb-2 block">{t('checkout.deliveryDate', language)}</Label>
                <input
                  type="date"
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
              <div>
                <Label className="mb-2 block">{t('checkout.selectTimeSlot', language)}</Label>
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

          {/* Product List */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Package className="w-5 h-5 mr-2 text-green-600" />
                {t('checkout.productList', language)}
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
                        {item.subscriptionType === 'weekly' && t('checkout.weekly', language)}
                        {item.subscriptionType === 'monthly' && t('checkout.monthly', language)}
                        {item.subscriptionType === 'quarterly' && t('checkout.quarterly', language)}
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

          {/* Payment Method */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <CreditCard className="w-5 h-5 mr-2 text-green-600" />
                {t('checkout.payment', language)}
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
                      <span>{t(`checkout.payment.${method.name}`, language)}</span>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>
        </div>

        {/* Right: Order Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardContent className="p-6">
              <h3 className="font-bold text-lg mb-4">{t('checkout.summary', language)}</h3>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">{t('checkout.totalItems', language)}</span>
                  <span>{items.length} {t('checkout.items', language)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">{t('checkout.subtotal', language)}</span>
                  <span>¥{totalAmount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">{t('checkout.shipping', language)}</span>
                  <span className="text-green-600">{t('checkout.freeShipping', language)}</span>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="flex justify-between items-center mb-6">
                <span className="font-medium">{t('checkout.total', language)}</span>
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
                    {t('checkout.processing', language)}
                  </>
                ) : (
                  t('checkout.pay', language)
                )}
              </Button>

              <div className="flex items-center justify-center mt-4 text-sm text-gray-500">
                <Shield className="w-4 h-4 mr-1" />
                {t('checkout.security', language)}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Payment Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <DialogTitle className="text-xl">{t('checkout.success', language)}</DialogTitle>
          </DialogHeader>
          <div className="text-center space-y-4">
            <p className="text-gray-500">
              {t('checkout.successDesc', language)}
            </p>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-500">{t('checkout.orderId', language)}</div>
              <div className="font-medium">{createdOrderId}</div>
            </div>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => navigate('/orders')}
              >
                {t('checkout.viewOrder', language)}
              </Button>
              <Button
                className="flex-1 bg-green-600 hover:bg-green-700"
                onClick={() => navigate('/')}
              >
                {t('checkout.backHome', language)}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
