import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFoodPackageStore, useCartStore } from '@/store';
import { mockApi } from '@/api/mock';
import {
  Search,
  ShoppingCart,
  Clock,
  Users,
  ChefHat,
  Star,
  Flame
} from 'lucide-react';
import { toast } from 'sonner';

const levelFilters = [
  { value: 'all', label: '全部' },
  { value: 'basic', label: '基础' },
  { value: 'advanced', label: '进阶' },
  { value: 'premium', label: '精品' },
];

const tagFilters = [
  '减脂', '增肌', '控糖', '高蛋白', '低卡', '新手', '快手', '家庭', '海鲜', '素食'
];

export default function FoodPackages() {
  const { packages, setPackages } = useFoodPackageStore();
  const { addItem, setIsOpen } = useCartStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('recommended');

  // 获取所有食材包
  const { data, isLoading } = useQuery({
    queryKey: ['foodPackages'],
    queryFn: () => mockApi.foodPackages.getAll()
  });

  useEffect(() => {
    if (data) {
      setPackages(data);
    }
  }, [data, setPackages]);

  // 过滤和排序
  const filteredPackages = packages.filter(pkg => {
    // 搜索过滤
    if (searchQuery && !pkg.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !pkg.description.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    // 等级过滤
    if (selectedLevel !== 'all' && pkg.level !== selectedLevel) {
      return false;
    }
    // 标签过滤
    if (selectedTags.length > 0 && !selectedTags.some(tag => pkg.tags.includes(tag))) {
      return false;
    }
    return true;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'price_asc':
        return a.price - b.price;
      case 'price_desc':
        return b.price - a.price;
      case 'rating':
        return b.rating - a.rating;
      case 'sold':
        return b.soldCount - a.soldCount;
      default:
        return 0;
    }
  });

  const handleAddToCart = (pkg: typeof packages[0]) => {
    addItem({
      packageId: pkg.id,
      packageName: pkg.name,
      packageImage: pkg.image,
      price: pkg.price,
      quantity: 1,
      subscriptionType: 'weekly'
    });
    toast.success(`已将 "${pkg.name}" 加入购物车`);
    setIsOpen(true);
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-2xl font-bold mb-2">食材包</h1>
        <p className="text-gray-500">发现适合您的食材组合，轻松享受美味</p>
      </div>

      {/* 搜索和过滤 */}
      <div className="space-y-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="搜索食材包..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full lg:w-48">
              <SelectValue placeholder="排序方式" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recommended">综合推荐</SelectItem>
              <SelectItem value="price_asc">价格从低到高</SelectItem>
              <SelectItem value="price_desc">价格从高到低</SelectItem>
              <SelectItem value="rating">评分最高</SelectItem>
              <SelectItem value="sold">销量最高</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 标签过滤 */}
        <div className="flex flex-wrap gap-2">
          {tagFilters.map((tag) => (
            <Badge
              key={tag}
              variant={selectedTags.includes(tag) ? 'default' : 'outline'}
              className={`cursor-pointer px-3 py-1 ${
                selectedTags.includes(tag)
                  ? 'bg-green-500 hover:bg-green-600'
                  : 'hover:bg-gray-100'
              }`}
              onClick={() => toggleTag(tag)}
            >
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      {/* 标签页 */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-flex">
          {levelFilters.map((filter) => (
            <TabsTrigger
              key={filter.value}
              value={filter.value}
              onClick={() => setSelectedLevel(filter.value)}
            >
              {filter.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {levelFilters.map((filter) => (
          <TabsContent key={filter.value} value={filter.value} className="mt-6">
            {filteredPackages.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">未找到相关食材包</h3>
                <p className="text-gray-500">尝试调整搜索条件或筛选条件</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredPackages.map((pkg) => (
                  <Card key={pkg.id} className="overflow-hidden hover:shadow-xl transition-shadow group">
                    <Link to={`/packages/${pkg.id}`}>
                      <div className="relative">
                        <img
                          src={pkg.image}
                          alt={pkg.name}
                          className="w-full h-48 object-cover group-hover:scale-105 transition-transform"
                        />
                        {pkg.isLimited && (
                          <Badge className="absolute top-3 left-3 bg-red-500">
                            <Flame className="w-3 h-3 mr-1" />
                            限时特惠
                          </Badge>
                        )}
                        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 text-sm font-bold text-green-600">
                          ¥{pkg.price}
                        </div>
                        {pkg.originalPrice > pkg.price && (
                          <div className="absolute bottom-3 right-3 bg-red-500 text-white rounded-full px-2 py-1 text-xs font-bold">
                            省¥{pkg.originalPrice - pkg.price}
                          </div>
                        )}
                      </div>
                    </Link>
                    
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge variant="secondary" className="text-xs">
                          {pkg.level === 'basic' && '基础'}
                          {pkg.level === 'advanced' && '进阶'}
                          {pkg.level === 'premium' && '精品'}
                        </Badge>
                        <div className="flex items-center text-yellow-500 text-xs">
                          <Star className="w-3 h-3 fill-current" />
                          <span className="ml-1">{pkg.rating}</span>
                          <span className="text-gray-400 ml-1">({pkg.reviewCount})</span>
                        </div>
                      </div>
                      
                      <Link to={`/packages/${pkg.id}`}>
                        <h3 className="font-bold text-lg mb-1 group-hover:text-green-600 transition-colors">
                          {pkg.name}
                        </h3>
                      </Link>
                      
                      <p className="text-gray-500 text-sm line-clamp-2 mb-3">
                        {pkg.description}
                      </p>
                      
                      <div className="flex items-center space-x-3 text-sm text-gray-500 mb-3">
                        <span className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {pkg.cookTime}分钟
                        </span>
                        <span className="flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          {pkg.servingSize}人份
                        </span>
                        <span className="flex items-center">
                          <ChefHat className="w-4 h-4 mr-1" />
                          {pkg.difficulty === 'easy' && '简单'}
                          {pkg.difficulty === 'medium' && '中等'}
                          {pkg.difficulty === 'hard' && '困难'}
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap gap-1 mb-4">
                        {pkg.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-2xl font-bold text-green-600">¥{pkg.price}</span>
                          {pkg.originalPrice > pkg.price && (
                            <span className="text-sm text-gray-400 line-through ml-2">
                              ¥{pkg.originalPrice}
                            </span>
                          )}
                        </div>
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => handleAddToCart(pkg)}
                        >
                          <ShoppingCart className="w-4 h-4 mr-1" />
                          加入购物车
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
