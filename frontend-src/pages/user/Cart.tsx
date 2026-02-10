import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
// import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useCartStore } from '@/store';
import {
  ShoppingCart,
  Trash2,
  Minus,
  Plus,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';
import { toast } from 'sonner';

const subscriptionOptions = [
  { value: 'weekly', label: '周订阅', discount: 0 },
  { value: 'monthly', label: '月订阅', discount: 0.1 },
  { value: 'quarterly', label: '季订阅', discount: 0.2 },
];

export default function Cart() {
  const navigate = useNavigate();
  const { items, removeItem, updateQuantity, updateSubscriptionType, clearCart } = useCartStore();
  const [selectedItems, setSelectedItems] = useState<string[]>(items.map(i => i.packageId));

  const toggleSelectItem = (packageId: string) => {
    setSelectedItems(prev =>
      prev.includes(packageId)
        ? prev.filter(id => id !== packageId)
        : [...prev, packageId]
    );
  };

  const selectAll = () => {
    if (selectedItems.length === items.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(items.map(i => i.packageId));
    }
  };

  const handleRemove = (packageId: string) => {
    removeItem(packageId);
    setSelectedItems(prev => prev.filter(id => id !== packageId));
    toast.success('已从购物车移除');
  };

  const selectedTotal = items
    .filter(item => selectedItems.includes(item.packageId))
    .reduce((total, item) => total + item.price * item.quantity, 0);

  const handleCheckout = () => {
    if (selectedItems.length === 0) {
      toast.error('请选择要结算的商品');
      return;
    }
    navigate('/checkout');
  };

  if (items.length === 0) {
    return (
      <div className="p-4 lg:p-6">
        <h1 className="text-2xl font-bold mb-6">购物车</h1>
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingCart className="w-12 h-12 text-gray-400" />
          </div>
          <h2 className="text-xl font-medium text-gray-900 mb-2">购物车是空的</h2>
          <p className="text-gray-500 mb-6">快去选购您喜欢的食材包吧</p>
          <Button asChild className="bg-green-600 hover:bg-green-700">
            <Link to="/packages">去选购</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6">
      <h1 className="text-2xl font-bold mb-6">购物车 ({items.length})</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 商品列表 */}
        <div className="lg:col-span-2 space-y-4">
          {/* 全选 */}
          <div className="flex items-center justify-between bg-white p-4 rounded-lg border">
            <div className="flex items-center space-x-3">
              <button
                onClick={selectAll}
                className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                  selectedItems.length === items.length
                    ? 'bg-green-500 border-green-500'
                    : 'border-gray-300'
                }`}
              >
                {selectedItems.length === items.length && (
                  <CheckCircle2 className="w-3 h-3 text-white" />
                )}
              </button>
              <span className="font-medium">
                全选 ({selectedItems.length}/{items.length})
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-red-600 hover:text-red-700"
              onClick={clearCart}
            >
              <Trash2 className="w-4 h-4 mr-1" />
              清空
            </Button>
          </div>

          {/* 商品卡片 */}
          {items.map((item) => (
            <Card key={item.packageId} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-start space-x-4">
                  {/* 选择框 */}
                  <button
                    onClick={() => toggleSelectItem(item.packageId)}
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center mt-1 flex-shrink-0 ${
                      selectedItems.includes(item.packageId)
                        ? 'bg-green-500 border-green-500'
                        : 'border-gray-300'
                    }`}
                  >
                    {selectedItems.includes(item.packageId) && (
                      <CheckCircle2 className="w-3 h-3 text-white" />
                    )}
                  </button>

                  {/* 商品图片 */}
                  <img
                    src={item.packageImage}
                    alt={item.packageName}
                    className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                  />

                  {/* 商品信息 */}
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/packages/${item.packageId}`}
                      className="font-medium text-lg hover:text-green-600 transition-colors"
                    >
                      {item.packageName}
                    </Link>

                    {/* 订阅类型选择 */}
                    <RadioGroup
                      value={item.subscriptionType}
                      onValueChange={(value) =>
                        updateSubscriptionType(item.packageId, value as typeof item.subscriptionType)
                      }
                      className="flex flex-wrap gap-2 mt-3"
                    >
                      {subscriptionOptions.map((option) => (
                        <div key={option.value}>
                          <RadioGroupItem
                            value={option.value}
                            id={`${item.packageId}-${option.value}`}
                            className="peer sr-only"
                          />
                          <Label
                            htmlFor={`${item.packageId}-${option.value}`}
                            className="flex items-center px-3 py-1 border-2 rounded-full text-sm cursor-pointer transition-all peer-data-[state=checked]:border-green-500 peer-data-[state=checked]:bg-green-50 hover:bg-gray-50"
                          >
                            {option.label}
                            {option.discount > 0 && (
                              <span className="ml-1 text-red-500 text-xs">
                                -{option.discount * 100}%
                              </span>
                            )}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>

                    {/* 数量和价格 */}
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() =>
                            updateQuantity(item.packageId, Math.max(1, item.quantity - 1))
                          }
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() =>
                            updateQuantity(item.packageId, Math.min(10, item.quantity + 1))
                          }
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>

                      <div className="flex items-center space-x-4">
                        <span className="text-xl font-bold text-green-600">
                          ¥{item.price * item.quantity}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-gray-400 hover:text-red-600"
                          onClick={() => handleRemove(item.packageId)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 结算区域 */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardContent className="p-6">
              <h3 className="font-bold text-lg mb-4">订单摘要</h3>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">商品总数</span>
                  <span>{selectedItems.length} 件</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">商品金额</span>
                  <span>¥{selectedTotal}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">运费</span>
                  <span className="text-green-600">免运费</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">优惠</span>
                  <span className="text-red-500">
                    -¥{items
                      .filter(item => selectedItems.includes(item.packageId))
                      .reduce((total, item) => {
                        const discount = subscriptionOptions.find(
                          o => o.value === item.subscriptionType
                        )?.discount || 0;
                        return total + item.price * item.quantity * discount / (1 - discount);
                      }, 0)
                      .toFixed(0)}
                  </span>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="flex justify-between items-center mb-6">
                <span className="font-medium">合计</span>
                <span className="text-2xl font-bold text-green-600">
                  ¥{selectedTotal}
                </span>
              </div>

              <Button
                className="w-full h-12 bg-green-600 hover:bg-green-700"
                disabled={selectedItems.length === 0}
                onClick={handleCheckout}
              >
                去结算
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>

              <p className="text-xs text-gray-500 text-center mt-4">
                点击结算即表示您同意我们的服务条款
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
