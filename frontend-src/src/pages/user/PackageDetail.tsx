import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useFoodPackageStore, useCartStore } from '@/store';
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
  Flame,
  AlertCircle,
  Package,
  MapPin,
  Factory,
  Thermometer,
  Droplet,
  Sprout
} from 'lucide-react';
import { toast } from 'sonner';
import type { FoodPackage } from '@/types';

// 演示食材包数据（对应数据库中真实存在的三个食材包）
const demoPackages: Record<string, FoodPackage> = {
  '1': {
    id: '1',
    name: '健康减脂套餐',
    description: '低卡路里、高蛋白的健康食材组合，适合减脂期食用',
    level: 'basic',
    price: 89,
    originalPrice: 109,
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop',
    tags: ['减脂', '高蛋白', '低卡'],
    servingSize: 2,
    cookTime: 30,
    difficulty: 'easy',
    rating: 4.5,
    reviewCount: 128,
    soldCount: 520,
    isLimited: false,
    stockQuantity: 80,
    stockStatus: { allSufficient: true, hasStock: true, status: '库存充足', canOrder: true },
    ingredients: [
      { id: '1', name: '鸡胸肉', category: '肉类', quantity: 500, unit: 'g', origin: '山东' },
      { id: '2', name: '西兰花', category: '蔬菜', quantity: 300, unit: 'g', origin: '云南' },
      { id: '3', name: '胡萝卜', category: '蔬菜', quantity: 200, unit: 'g', origin: '山东' },
      { id: '4', name: '糙米', category: '主食', quantity: 500, unit: 'g', origin: '东北' }
    ],
    seasonings: [
      { id: '1', name: '海盐', quantity: '适量', included: true },
      { id: '2', name: '黑胡椒', quantity: '适量', included: true },
      { id: '3', name: '橄榄油', quantity: '30ml', included: true }
    ],
    recipes: [
      {
        id: '1',
        name: '香煎鸡胸肉配蔬菜',
        description: '低脂高蛋白的经典减脂餐',
        steps: [
          { order: 1, description: '鸡胸肉洗净切片，用盐和黑胡椒腌制15分钟', duration: 15 },
          { order: 2, description: '西兰花和胡萝卜焯水备用', duration: 5 },
          { order: 3, description: '平底锅少油煎鸡胸肉至两面金黄', duration: 8 },
          { order: 4, description: '搭配蔬菜装盘即可', duration: 2 }
        ],
        tips: ['鸡胸肉不要煎太久，避免口感柴', '可以搭配低脂沙拉酱']
      }
    ],
    nutritionInfo: { calories: 450, protein: 35, carbs: 45, fat: 12, fiber: 8 }
  },
  '2': {
    id: '2',
    name: '增肌能量套餐',
    description: '高蛋白、适量碳水的增肌食材组合',
    level: 'advanced',
    price: 129,
    originalPrice: 159,
    image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=800&auto=format&fit=crop',
    tags: ['增肌', '高蛋白', '健身'],
    servingSize: 2,
    cookTime: 45,
    difficulty: 'medium',
    rating: 4.7,
    reviewCount: 256,
    soldCount: 890,
    isLimited: false,
    stockQuantity: 45,
    stockStatus: { allSufficient: true, hasStock: true, status: '库存充足', canOrder: true },
    ingredients: [
      { id: '5', name: '牛肉', category: '肉类', quantity: 600, unit: 'g', origin: '澳洲' },
      { id: '6', name: '鸡蛋', category: '蛋奶', quantity: 12, unit: '个', origin: '本地' },
      { id: '7', name: '红薯', category: '主食', quantity: 800, unit: 'g', origin: '新疆' },
      { id: '8', name: '菠菜', category: '蔬菜', quantity: 400, unit: 'g', origin: '山东' }
    ],
    seasonings: [
      { id: '4', name: '黑胡椒酱', quantity: '50g', included: true },
      { id: '5', name: '海盐', quantity: '适量', included: true },
      { id: '6', name: '橄榄油', quantity: '30ml', included: true }
    ],
    recipes: [
      {
        id: '2',
        name: '黑椒牛柳配烤红薯',
        description: '高蛋白增肌餐，搭配优质碳水',
        steps: [
          { order: 1, description: '牛肉切条，用黑胡椒酱腌制20分钟', duration: 20 },
          { order: 2, description: '红薯切块，烤箱200度烤30分钟', duration: 30 },
          { order: 3, description: '热锅快炒牛柳至变色', duration: 5 },
          { order: 4, description: '菠菜焯水后摆盘', duration: 3 }
        ],
        tips: ['牛肉逆纹切更嫩', '红薯烤后口感更佳']
      }
    ],
    nutritionInfo: { calories: 680, protein: 55, carbs: 65, fat: 22, fiber: 10 }
  },
  '3': {
    id: '3',
    name: '地中海风味套餐',
    description: '健康的地中海饮食风格，富含不饱和脂肪酸',
    level: 'premium',
    price: 159,
    originalPrice: 199,
    image: 'https://images.unsplash.com/photo-1543339308-43e59d6b73a6?w=800&auto=format&fit=crop',
    tags: ['地中海', '健康', '高端'],
    servingSize: 2,
    cookTime: 40,
    difficulty: 'medium',
    rating: 4.8,
    reviewCount: 189,
    soldCount: 420,
    isLimited: true,
    stockQuantity: 8,
    stockStatus: { allSufficient: true, hasStock: true, status: '库存紧张', canOrder: true },
    ingredients: [
      { id: '9', name: '三文鱼', category: '海鲜', quantity: 400, unit: 'g', origin: '挪威' },
      { id: '10', name: '牛油果', category: '水果', quantity: 2, unit: '个', origin: '墨西哥' },
      { id: '11', name: '藜麦', category: '主食', quantity: 300, unit: 'g', origin: '秘鲁' },
      { id: '12', name: '樱桃番茄', category: '蔬菜', quantity: 300, unit: 'g', origin: '山东' }
    ],
    seasonings: [
      { id: '7', name: '特级初榨橄榄油', quantity: '50ml', included: true },
      { id: '8', name: '海盐', quantity: '适量', included: true },
      { id: '9', name: '柠檬', quantity: '1个', included: true }
    ],
    recipes: [
      {
        id: '3',
        name: '香煎三文鱼藜麦碗',
        description: '地中海经典健康餐',
        steps: [
          { order: 1, description: '藜麦淘洗后煮15分钟至熟透', duration: 15 },
          { order: 2, description: '三文鱼用盐和黑胡椒腌制', duration: 10 },
          { order: 3, description: '平底锅煎三文鱼至两面金黄', duration: 8 },
          { order: 4, description: '牛油果切片，番茄对半切', duration: 5 },
          { order: 5, description: '组装成碗，淋上柠檬汁', duration: 2 }
        ],
        tips: ['三文鱼不要煎过头，保持嫩滑', '可额外加入坚果增加口感']
      }
    ],
    nutritionInfo: { calories: 580, protein: 42, carbs: 48, fat: 28, fiber: 12 }
  }
};

// 溯源数据接口（预留，用于对接溯源模块）
interface TraceabilityInfo {
  ingredientId: string;
  supplier: {
    name: string;
    address: string;
    cert: string;
  };
  origin: {
    province: string;
    city: string;
    farm: string;
    coordinates: string;
  };
  production: {
    harvestDate: string;
    processMethod: string;
    storageTemp: string;
  };
  quality: {
    inspectionDate: string;
    inspector: string;
    grade: string;
  };
}

// 演示溯源数据
const demoTraceability: Record<string, TraceabilityInfo[]> = {
  '1': [
    { 
      ingredientId: '1', 
      supplier: { name: '绿源农场', address: '山东省寿光市', cert: '有机认证' },
      origin: { province: '山东', city: '寿光', farm: '绿源生态养殖基地', coordinates: '36.85°N, 118.73°E' },
      production: { harvestDate: '2025-03-01', processMethod: '冷链屠宰', storageTemp: '0-4°C' },
      quality: { inspectionDate: '2025-03-05', inspector: '张检验员', grade: 'A级' }
    },
    { 
      ingredientId: '2', 
      supplier: { name: '云南蔬菜基地', address: '云南省昆明市', cert: '绿色食品认证' },
      origin: { province: '云南', city: '昆明', farm: '高原蔬菜种植基地', coordinates: '25.04°N, 102.71°E' },
      production: { harvestDate: '2025-03-06', processMethod: '人工采摘', storageTemp: '4-8°C' },
      quality: { inspectionDate: '2025-03-07', inspector: '李检验员', grade: '特级' }
    }
  ],
  '2': [
    { 
      ingredientId: '5', 
      supplier: { name: '澳洲牛肉进口商', address: '澳大利亚墨尔本', cert: '澳洲牛肉认证' },
      origin: { province: '维多利亚州', city: '墨尔本', farm: 'Green Valley牧场', coordinates: '37.81°S, 144.96°E' },
      production: { harvestDate: '2025-02-15', processMethod: '排酸处理', storageTemp: '-18°C' },
      quality: { inspectionDate: '2025-03-01', inspector: '王检验员', grade: 'M3级' }
    }
  ],
  '3': [
    { 
      ingredientId: '9', 
      supplier: { name: '挪威海鲜进口商', address: '挪威奥斯陆', cert: 'MSC海洋认证' },
      origin: { province: '特罗姆斯郡', city: '特罗姆瑟', farm: '北极海域养殖场', coordinates: '69.64°N, 18.95°E' },
      production: { harvestDate: '2025-03-03', processMethod: '速冻保鲜', storageTemp: '-60°C' },
      quality: { inspectionDate: '2025-03-06', inspector: '赵检验员', grade: 'AAA级' }
    }
  ]
};

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
  const [pkg, setPkg] = useState<FoodPackage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showTraceability, setShowTraceability] = useState(false);

  // 获取食材包详情 - 使用假数据
  useEffect(() => {
    if (id) {
      // 从假数据中查找，不存在则使用第一个
      const data = demoPackages[id] || demoPackages['1'];
      setPkg(data);
      setCurrentPackage(data);
      setIsLoading(false);
    }
  }, [id, setCurrentPackage]);

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
              disabled={!pkg.stockStatus?.canOrder}
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              {pkg.stockStatus?.canOrder ? '加入购物车' : '暂时缺货'}
            </Button>
            <Button
              className="flex-1 h-12 bg-green-600 hover:bg-green-700"
              onClick={handleBuyNow}
              disabled={!pkg.stockStatus?.canOrder}
            >
              {pkg.stockStatus?.canOrder ? '立即购买' : '暂时缺货'}
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
                {/* 库存状态提示 */}
                {pkg.stockStatus && (
                  <div className={`mb-6 p-4 rounded-lg ${
                    pkg.stockStatus.allSufficient 
                      ? 'bg-green-50 border border-green-200' 
                      : pkg.stockStatus.hasStock 
                        ? 'bg-yellow-50 border border-yellow-200' 
                        : 'bg-red-50 border border-red-200'
                  }`}>
                    <div className="flex items-center space-x-2">
                      {pkg.stockStatus.allSufficient ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      ) : (
                        <AlertCircle className={`w-5 h-5 ${pkg.stockStatus.hasStock ? 'text-yellow-600' : 'text-red-600'}`} />
                      )}
                      <span className={`font-medium ${
                        pkg.stockStatus.allSufficient 
                          ? 'text-green-800' 
                          : pkg.stockStatus.hasStock 
                            ? 'text-yellow-800' 
                            : 'text-red-800'
                      }`}>
                        食材库存：{pkg.stockStatus.status}
                      </span>
                    </div>
                    {!pkg.stockStatus.canOrder && (
                      <p className="text-sm mt-1 text-red-600">
                        部分食材库存不足，暂时无法购买
                      </p>
                    )}
                  </div>
                )}

                <h3 className="text-lg font-bold mb-4">包含食材</h3>
                
                {/* 数据库关联的食材库存信息 */}
                {pkg.ingredientStocks && pkg.ingredientStocks.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {pkg.ingredientStocks.map((ingredient) => (
                      <div
                        key={ingredient.id}
                        className={`flex items-center justify-between p-3 rounded-lg border ${
                          ingredient.isStockSufficient 
                            ? 'bg-green-50/50 border-green-100' 
                            : 'bg-red-50/50 border-red-100'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            ingredient.isStockSufficient 
                              ? 'bg-green-100' 
                              : 'bg-red-100'
                          }`}>
                            {ingredient.isStockSufficient ? (
                              <Leaf className="w-5 h-5 text-green-600" />
                            ) : (
                              <AlertCircle className="w-5 h-5 text-red-600" />
                            )}
                          </div>
                          <div>
                            <div className="font-medium flex items-center space-x-2">
                              <span>{ingredient.name}</span>
                              {!ingredient.isStockSufficient && (
                                <span className="text-xs px-2 py-0.5 bg-red-100 text-red-600 rounded-full">
                                  库存不足
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-gray-500">
                              {ingredient.category} · 产地：{ingredient.origin || '未知'}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">
                            需{ingredient.required_quantity}{ingredient.required_unit}
                          </div>
                          <div className={`text-sm ${
                            ingredient.isStockSufficient ? 'text-green-600' : 'text-red-600'
                          }`}>
                            库存{ingredient.stock_quantity}{ingredient.unit}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  /* 静态食材信息（当没有数据库关联时） */
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
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
                )}
                
                {/* 食材溯源说明 */}
                <div className="bg-blue-50 rounded-lg p-4 mb-6">
                  <h4 className="font-medium text-blue-800 mb-2 flex items-center">
                    <Package className="w-4 h-4 mr-2" />
                    食材溯源
                  </h4>
                  <p className="text-sm text-blue-700">
                    所有食材均来自认证供应商，经过严格质检。我们实时追踪库存状态，
                    确保您收到的每一份食材都是最新鲜的。
                  </p>
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
