import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { useAuthStore, useDietProfileStore, useFoodPackageStore, useOrderStore, useSubscriptionStore } from '@/store';
import { mockApi } from '@/api/mock';
import {
  ChefHat,
  Clock,
  Users,
  Star,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Package,
  Calendar,
  CheckCircle2,
  Truck,
  Heart
} from 'lucide-react';

export default function UserHome() {
  const { user } = useAuthStore();
  const { profile } = useDietProfileStore();
  const { recommendedPackages, limitedPackages, setRecommendedPackages, setLimitedPackages } = useFoodPackageStore();
  const { orders } = useOrderStore();
  const { subscriptions } = useSubscriptionStore();

  // 获取推荐食材包
  const { data: recommendedData } = useQuery({
    queryKey: ['recommendedPackages', user?.id],
    queryFn: () => mockApi.foodPackages.getRecommended(user?.id || ''),
    enabled: !!user
  });

  // 获取限时特惠
  const { data: limitedData } = useQuery({
    queryKey: ['limitedPackages'],
    queryFn: () => mockApi.foodPackages.getLimited()
  });

  useEffect(() => {
    if (recommendedData) {
      setRecommendedPackages(recommendedData);
    }
  }, [recommendedData, setRecommendedPackages]);

  useEffect(() => {
    if (limitedData) {
      setLimitedPackages(limitedData);
    }
  }, [limitedData, setLimitedPackages]);

  // 获取最近的订单
  const recentOrders = orders.slice(0, 3);

  // 获取进行中的订阅
  const activeSubscriptions = subscriptions.filter(s => s.status === 'active');

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* 欢迎区域 */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 lg:p-8 text-white">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold mb-2">
              欢迎回来，{user?.name}！
            </h1>
            <p className="text-green-100 mb-4">
              {profile ? '根据您的饮食画像，为您推荐以下食材包' : '完善您的饮食画像，获取个性化推荐'}
            </p>
            {!profile && (
              <Button
                variant="secondary"
                className="bg-white text-green-600 hover:bg-green-50"
                asChild
              >
                <Link to="/diet-profile">
                  <Sparkles className="w-4 h-4 mr-2" />
                  创建饮食画像
                </Link>
              </Button>
            )}
          </div>
          <div className="mt-6 lg:mt-0 flex items-center space-x-4">
            <div className="text-center">
              <div className="text-3xl font-bold">{orders.length}</div>
              <div className="text-sm text-green-100">总订单</div>
            </div>
            <Separator orientation="vertical" className="h-12 bg-green-400" />
            <div className="text-center">
              <div className="text-3xl font-bold">{activeSubscriptions.length}</div>
              <div className="text-sm text-green-100">活跃订阅</div>
            </div>
          </div>
        </div>
      </div>

      {/* 快捷操作 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Link to="/packages">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardContent className="p-4 flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
                <Package className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-medium">浏览食材包</h3>
              <p className="text-sm text-gray-500 mt-1">发现更多美味</p>
            </CardContent>
          </Card>
        </Link>
        <Link to="/orders">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardContent className="p-4 flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                <Truck className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-medium">订单追踪</h3>
              <p className="text-sm text-gray-500 mt-1">查看配送进度</p>
            </CardContent>
          </Card>
        </Link>
        <Link to="/subscriptions">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardContent className="p-4 flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-3">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-medium">订阅管理</h3>
              <p className="text-sm text-gray-500 mt-1">管理配送计划</p>
            </CardContent>
          </Card>
        </Link>
        <Link to="/diet-profile">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardContent className="p-4 flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-3">
                <Heart className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="font-medium">饮食画像</h3>
              <p className="text-sm text-gray-500 mt-1">个性化设置</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* 限时特惠 */}
      {limitedPackages.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-red-500" />
              限时特惠
            </h2>
            <Link to="/packages" className="text-green-600 hover:text-green-700 flex items-center text-sm">
              查看全部 <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {limitedPackages.map((pkg) => (
              <Link key={pkg.id} to={`/packages/${pkg.id}`}>
                <Card className="overflow-hidden hover:shadow-lg transition-shadow group">
                  <div className="relative">
                    <img
                      src={pkg.image}
                      alt={pkg.name}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform"
                    />
                    <Badge className="absolute top-3 left-3 bg-red-500">
                      限时特惠
                    </Badge>
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 text-sm font-bold text-red-500">
                      ¥{pkg.price}
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-bold text-lg mb-1">{pkg.name}</h3>
                    <p className="text-gray-500 text-sm line-clamp-2 mb-3">{pkg.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 text-sm text-gray-500">
                        <span className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {pkg.cookTime}分钟
                        </span>
                        <span className="flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          {pkg.servingSize}人份
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-gray-400 line-through text-sm">¥{pkg.originalPrice}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* 个性化推荐 */}
      {recommendedPackages.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold flex items-center">
              <Sparkles className="w-5 h-5 mr-2 text-yellow-500" />
              为您推荐
            </h2>
            <Link to="/packages" className="text-green-600 hover:text-green-700 flex items-center text-sm">
              查看全部 <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {recommendedPackages.map((pkg) => (
              <Link key={pkg.id} to={`/packages/${pkg.id}`}>
                <Card className="overflow-hidden hover:shadow-lg transition-shadow group h-full">
                  <div className="relative">
                    <img
                      src={pkg.image}
                      alt={pkg.name}
                      className="w-full h-40 object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 text-sm font-bold text-green-600">
                      ¥{pkg.price}
                    </div>
                  </div>
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
                      </div>
                    </div>
                    <h3 className="font-bold mb-1">{pkg.name}</h3>
                    <p className="text-gray-500 text-sm line-clamp-2 mb-3">{pkg.description}</p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {pkg.cookTime}分钟
                      </span>
                      <span className="flex items-center">
                        <ChefHat className="w-4 h-4 mr-1" />
                        {pkg.difficulty === 'easy' && '简单'}
                        {pkg.difficulty === 'medium' && '中等'}
                        {pkg.difficulty === 'hard' && '困难'}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* 最近订单 */}
      {recentOrders.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">最近订单</h2>
            <Link to="/orders" className="text-green-600 hover:text-green-700 flex items-center text-sm">
              查看全部 <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          <div className="space-y-3">
            {recentOrders.map((order) => (
              <Card key={order.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <img
                        src={order.packageImage}
                        alt={order.packageName}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div>
                        <h4 className="font-medium">{order.packageName}</h4>
                        <p className="text-sm text-gray-500">
                          订单号：{order.id} · {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                        <div className="flex items-center mt-1">
                          {order.status === 'delivered' && (
                            <Badge variant="secondary" className="bg-green-100 text-green-700">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              已送达
                            </Badge>
                          )}
                          {order.status === 'shipped' && (
                            <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                              <Truck className="w-3 h-3 mr-1" />
                              配送中
                            </Badge>
                          )}
                          {order.status === 'preparing' && (
                            <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
                              <ChefHat className="w-3 h-3 mr-1" />
                              准备中
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">¥{order.totalAmount}</p>
                      <Button variant="ghost" size="sm" className="text-green-600" asChild>
                        <Link to={`/orders/${order.id}`}>查看详情</Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* 饮食目标进度 */}
      {profile && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">饮食目标</h3>
              <Badge variant="outline">
                {profile.dietGoal === 'weight_loss' && '减脂'}
                {profile.dietGoal === 'muscle_gain' && '增肌'}
                {profile.dietGoal === 'blood_sugar_control' && '控糖'}
                {profile.dietGoal === 'balanced' && '均衡'}
                {profile.dietGoal === 'other' && '其他'}
              </Badge>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">本周目标完成度</span>
                  <span className="font-medium">75%</span>
                </div>
                <Progress value={75} className="h-2" />
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-2xl font-bold text-green-600">12</div>
                  <div className="text-xs text-gray-500">健康餐</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-2xl font-bold text-blue-600">8</div>
                  <div className="text-xs text-gray-500">蛋白质(g)</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-2xl font-bold text-orange-600">450</div>
                  <div className="text-xs text-gray-500">卡路里</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
