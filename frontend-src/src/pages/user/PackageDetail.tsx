import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useFoodPackageStore, useCartStore } from '@/store';
import { mockApi } from '@/api/mock';
import {
  ArrowLeft,
  Clock,
  Users,
  ChefHat,
  Star,
  ShoppingCart,
  CheckCircle2,
  Leaf,
  Wheat,
  Droplets,
  PlayCircle,
  Minus,
  Plus,
  Heart,
  Flame
} from 'lucide-react';
import { toast } from 'sonner';

const subscriptionOptions = [
  { value: 'weekly', label: '周订阅', desc: '每周配送一次', discount: 0 },
  { value: 'monthly', label: '月订阅', desc: '每月配送四次', discount: 0.1 },
  { value: 'quarterly', label: '季订阅', desc: '每月配送四次，连订三月', discount: 0.2 },
];

export default function PackageDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { setCurrentPackage } = useFoodPackageStore();
  const { addItem, setIsOpen } = useCartStore();
  const [quantity, setQuantity] = useState(1);
  const [subscriptionType, setSubscriptionType] = useState<'weekly' | 'monthly' | 'quarterly'>('weekly');
  const [isFavorite, setIsFavorite] = useState(false);

  // 获取食材包详情
  const { data: pkg, isLoading } = useQuery({
    queryKey: ['foodPackage', id],
    queryFn: async () => {
      const data = await mockApi.foodPackages.getById(id || '');
      if (data) setCurrentPackage(data);
      return data;
    },
    enabled: !!id
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!pkg) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-bold mb-2">食材包不存在</h2>
        <Button onClick={() => navigate('/packages')} variant="outline">
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回列表
        </Button>
      </div>
    );
  }

  const discountedPrice = Math.round(pkg.price * (1 - subscriptionOptions.find(o => o.value === subscriptionType)!.discount));
  const totalPrice = discountedPrice * quantity;

  const handleAddToCart = () => {
    addItem({
      packageId: pkg.id,
      packageName: pkg.name,
      packageImage: pkg.image,
      price: discountedPrice,
      quantity,
      subscriptionType
    });
    toast.success(`已将 "${pkg.name}" 加入购物车`);
    setIsOpen(true);
  };

  const handleBuyNow = () => {
    addItem({
      packageId: pkg.id,
      packageName: pkg.name,
      packageImage: pkg.image,
      price: discountedPrice,
      quantity,
      subscriptionType
    });
    navigate('/checkout');
  };

  return (
    <div className="p-4 lg:p-6">
      {/* 返回按钮 */}
      <Button
        variant="ghost"
        className="mb-4"
        onClick={() => navigate('/packages')}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        返回列表
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 左侧：图片 */}
        <div className="space-y-4">
          <div className="relative rounded-2xl overflow-hidden">
            <img
              src={pkg.image}
              alt={pkg.name}
              className="w-full h-96 object-cover"
            />
            {pkg.isLimited && (
              <Badge className="absolute top-4 left-4 bg-red-500 text-lg px-3 py-1">
                <Flame className="w-4 h-4 mr-1" />
                限时特惠
              </Badge>
            )}
            <button
              onClick={() => setIsFavorite(!isFavorite)}
              className={`absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                isFavorite ? 'bg-red-500 text-white' : 'bg-white/90 text-gray-400'
              }`}
            >
              <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>

        {/* 右侧：信息 */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <Badge variant="secondary">
                {pkg.level === 'basic' && '基础'}
                {pkg.level === 'advanced' && '进阶'}
                {pkg.level === 'premium' && '精品'}
              </Badge>
              <div className="flex items-center text-yellow-500">
                <Star className="w-4 h-4 fill-current" />
                <span className="ml-1 font-medium">{pkg.rating}</span>
                <span className="text-gray-400 ml-1">({pkg.reviewCount}条评价)</span>
              </div>
            </div>
            <h1 className="text-3xl font-bold mb-2">{pkg.name}</h1>
            <p className="text-gray-500">{pkg.description}</p>
          </div>

          {/* 关键信息 */}
          <div className="flex items-center space-x-6 text-sm">
            <div className="flex items-center text-gray-600">
              <Clock className="w-5 h-5 mr-2 text-green-600" />
              <div>
                <div className="font-medium">{pkg.cookTime}分钟</div>
                <div className="text-gray-400">烹饪时间</div>
              </div>
            </div>
            <div className="flex items-center text-gray-600">
              <Users className="w-5 h-5 mr-2 text-blue-600" />
              <div>
                <div className="font-medium">{pkg.servingSize}人份</div>
                <div className="text-gray-400">适用人数</div>
              </div>
            </div>
            <div className="flex items-center text-gray-600">
              <ChefHat className="w-5 h-5 mr-2 text-orange-600" />
              <div>
                <div className="font-medium">
                  {pkg.difficulty === 'easy' && '简单'}
                  {pkg.difficulty === 'medium' && '中等'}
                  {pkg.difficulty === 'hard' && '困难'}
                </div>
                <div className="text-gray-400">难度</div>
              </div>
            </div>
          </div>

          {/* 标签 */}
          <div className="flex flex-wrap gap-2">
            {pkg.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="px-3 py-1">
                {tag}
              </Badge>
            ))}
          </div>

          <Separator />

          {/* 订阅类型选择 */}
          <div>
            <Label className="text-lg font-medium mb-3 block">选择订阅周期</Label>
            <RadioGroup
              value={subscriptionType}
              onValueChange={(value) => setSubscriptionType(value as typeof subscriptionType)}
              className="grid grid-cols-3 gap-4"
            >
              {subscriptionOptions.map((option) => (
                <div key={option.value}>
                  <RadioGroupItem
                    value={option.value}
                    id={option.value}
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor={option.value}
                    className="flex flex-col items-center p-4 border-2 rounded-lg cursor-pointer transition-all peer-data-[state=checked]:border-green-500 peer-data-[state=checked]:bg-green-50 hover:bg-gray-50"
                  >
                    <span className="font-medium">{option.label}</span>
                    <span className="text-xs text-gray-500">{option.desc}</span>
                    {option.discount > 0 && (
                      <Badge className="mt-2 bg-red-500">省{option.discount * 100}%</Badge>
                    )}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* 数量选择 */}
          <div>
            <Label className="text-lg font-medium mb-3 block">数量</Label>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <Minus className="w-4 h-4" />
              </Button>
              <span className="text-xl font-medium w-8 text-center">{quantity}</span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(Math.min(10, quantity + 1))}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* 价格 */}
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-baseline justify-between">
              <span className="text-gray-600">单价</span>
              <div>
                <span className="text-3xl font-bold text-green-600">¥{discountedPrice}</span>
                {discountedPrice < pkg.price && (
                  <span className="text-gray-400 line-through ml-2">¥{pkg.price}</span>
                )}
              </div>
            </div>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-gray-600">总计</span>
              <span className="text-2xl font-bold">¥{totalPrice}</span>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex space-x-4">
            <Button
              variant="outline"
              className="flex-1 h-12"
              onClick={handleAddToCart}
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              加入购物车
            </Button>
            <Button
              className="flex-1 h-12 bg-green-600 hover:bg-green-700"
              onClick={handleBuyNow}
            >
              立即购买
            </Button>
          </div>
        </div>
      </div>

      {/* 详细信息标签页 */}
      <div className="mt-12">
        <Tabs defaultValue="ingredients" className="w-full">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="ingredients">食材清单</TabsTrigger>
            <TabsTrigger value="recipe">菜谱详情</TabsTrigger>
            <TabsTrigger value="nutrition">营养成分</TabsTrigger>
          </TabsList>

          <TabsContent value="ingredients" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-bold mb-4">包含食材</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pkg.ingredients.map((ingredient) => (
                    <div
                      key={ingredient.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <Leaf className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <div className="font-medium">{ingredient.name}</div>
                          <div className="text-sm text-gray-500">{ingredient.category}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{ingredient.quantity}{ingredient.unit}</div>
                        {ingredient.origin && (
                          <div className="text-sm text-gray-500">产地：{ingredient.origin}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <h3 className="text-lg font-bold mb-4 mt-8">调味品</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pkg.seasonings.map((seasoning) => (
                    <div
                      key={seasoning.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <CheckCircle2 className={`w-5 h-5 ${seasoning.included ? 'text-green-500' : 'text-gray-400'}`} />
                        <span className="font-medium">{seasoning.name}</span>
                      </div>
                      <span className="text-gray-500">{seasoning.quantity}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recipe" className="mt-6">
            <Card>
              <CardContent className="p-6">
                {pkg.recipes.map((recipe) => (
                  <div key={recipe.id}>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-bold">{recipe.name}</h3>
                        <p className="text-gray-500">{recipe.description}</p>
                      </div>
                      {recipe.videoUrl && (
                        <Button variant="outline" className="flex items-center">
                          <PlayCircle className="w-4 h-4 mr-2" />
                          观看视频
                        </Button>
                      )}
                    </div>

                    <div className="space-y-4">
                      {recipe.steps.map((step) => (
                        <div key={step.order} className="flex space-x-4">
                          <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <span className="text-green-600 font-medium">{step.order}</span>
                          </div>
                          <div className="flex-1">
                            <p>{step.description}</p>
                            {step.duration && (
                              <span className="text-sm text-gray-500 mt-1">
                                <Clock className="w-3 h-3 inline mr-1" />
                                {step.duration}分钟
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {recipe.tips.length > 0 && (
                      <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
                        <h4 className="font-medium text-yellow-800 mb-2">烹饪小贴士</h4>
                        <ul className="list-disc list-inside space-y-1 text-yellow-700">
                          {recipe.tips.map((tip, index) => (
                            <li key={index}>{tip}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="nutrition" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-bold mb-4">营养成分表</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <Flame className="w-8 h-8 mx-auto mb-2 text-orange-500" />
                    <div className="text-2xl font-bold">{pkg.nutritionInfo.calories}</div>
                    <div className="text-sm text-gray-500">卡路里(kcal)</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 mx-auto mb-2 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-bold">P</span>
                    </div>
                    <div className="text-2xl font-bold">{pkg.nutritionInfo.protein}g</div>
                    <div className="text-sm text-gray-500">蛋白质</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <Wheat className="w-8 h-8 mx-auto mb-2 text-yellow-600" />
                    <div className="text-2xl font-bold">{pkg.nutritionInfo.carbs}g</div>
                    <div className="text-sm text-gray-500">碳水化合物</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <Droplets className="w-8 h-8 mx-auto mb-2 text-red-500" />
                    <div className="text-2xl font-bold">{pkg.nutritionInfo.fat}g</div>
                    <div className="text-sm text-gray-500">脂肪</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <Leaf className="w-8 h-8 mx-auto mb-2 text-green-500" />
                    <div className="text-2xl font-bold">{pkg.nutritionInfo.fiber}g</div>
                    <div className="text-sm text-gray-500">膳食纤维</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
