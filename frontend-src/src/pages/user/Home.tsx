import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { useAuthStore, useDietProfileStore, useFoodPackageStore, useOrderStore, useSubscriptionStore, useUIStore } from '@/store';
import { t } from '@/lib/i18n';
import api from '@/api';
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
  Heart,
  Loader2
} from 'lucide-react';

export default function UserHome() {
  const { user } = useAuthStore();
  const { profile } = useDietProfileStore();
  const { recommendedPackages, limitedPackages, setRecommendedPackages, setLimitedPackages } = useFoodPackageStore();
  const { orders } = useOrderStore();
  const { subscriptions } = useSubscriptionStore();
  const { language } = useUIStore();

  // 获取推荐食材包
  const { data: recommendedData, isLoading: isLoadingRecommended } = useQuery({
    queryKey: ['recommendedPackages', user?.id],
    queryFn: () => api.foodPackages.getRecommended(user?.id || ''),
    enabled: !!user
  });

  // 获取限时特惠
  const { data: limitedData, isLoading: isLoadingLimited } = useQuery({
    queryKey: ['limitedPackages'],
    queryFn: () => api.foodPackages.getLimited()
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
      <div className="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-600 rounded-2xl p-6 lg:p-8 text-white relative overflow-hidden">
        {/* 装饰性背景元素 */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4"></div>
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <img src="/logo.svg" alt={t('app.name', language)} className="w-8 h-8 rounded-lg" />
              <span className="text-green-100 text-sm font-medium">{t('app.name', language)}</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold mb-2">
              {t('home.welcome', language).replace('{name}', user?.name || '')}
            </h1>
            <p className="text-green-100 mb-4">
              {profile ? t('home.recommendationWithProfile', language) : t('home.recommendationWithoutProfile', language)}
            </p>
            {!profile && (
              <Button
                variant="secondary"
                className="bg-white text-green-600 hover:bg-green-50"
                asChild
              >
                <Link to="/diet-profile">
                  <Sparkles className="w-4 h-4 mr-2" />
                  {t('home.createDietProfile', language)}
                </Link>
              </Button>
            )}
          </div>
          <div className="mt-6 lg:mt-0 flex items-center space-x-4">
            <div className="text-center">
              <div className="text-3xl font-bold">{orders.length}</div>
              <div className="text-sm text-green-100">{t('home.stats.totalOrders', language)}</div>
            </div>
            <Separator orientation="vertical" className="h-12 bg-white/30" />
            <div className="text-center">
              <div className="text-3xl font-bold">{activeSubscriptions.length}</div>
              <div className="text-sm text-green-100">{t('home.stats.activeSubs', language)}</div>
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
              <h3 className="font-medium">{t('home.quickActions.browse', language)}</h3>
              <p className="text-sm text-gray-500 mt-1">{t('home.quickActions.browse.desc', language)}</p>
            </CardContent>
          </Card>
        </Link>
        <Link to="/orders">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardContent className="p-4 flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                <Truck className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-medium">{t('home.quickActions.track', language)}</h3>
              <p className="text-sm text-gray-500 mt-1">{t('home.quickActions.track.desc', language)}</p>
            </CardContent>
          </Card>
        </Link>
        <Link to="/subscriptions">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardContent className="p-4 flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-3">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-medium">{t('home.quickActions.manage', language)}</h3>
              <p className="text-sm text-gray-500 mt-1">{t('home.quickActions.manage.desc', language)}</p>
            </CardContent>
          </Card>
        </Link>
        <Link to="/diet-profile">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardContent className="p-4 flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-3">
                <Heart className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="font-medium">{t('home.quickActions.profile', language)}</h3>
              <p className="text-sm text-gray-500 mt-1">{t('home.quickActions.profile.desc', language)}</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* 限时特惠 */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-red-500" />
            {t('home.section.limited', language)}
          </h2>
          <Link to="/packages" className="text-green-600 hover:text-green-700 flex items-center text-sm">
            {t('common.seeAll', language)} <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
        {isLoadingLimited ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="w-8 h-8 animate-spin text-green-600" />
          </div>
        ) : limitedPackages.length > 0 ? (
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
                      {t('home.section.limited', language)}
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
                          {pkg.cookTime}{t('common.minutes', language)}
                        </span>
                        <span className="flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          {pkg.servingSize}{t('common.servings', language)}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-gray-400 line-through text-sm">{t('home.originalPrice', language)} ¥{pkg.originalPrice}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card className="bg-gray-50">
            <CardContent className="p-8 text-center">
              <Package className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p className="text-gray-500">{t('home.noLimited', language)}</p>
              <Button variant="link" asChild className="mt-2">
                <Link to="/packages">{t('home.goBrowse', language)}</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* 个性化推荐 */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold flex items-center">
            <Sparkles className="w-5 h-5 mr-2 text-yellow-500" />
            {t('home.section.recommended', language)}
          </h2>
          <Link to="/packages" className="text-green-600 hover:text-green-700 flex items-center text-sm">
            {t('common.seeAll', language)} <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
        {isLoadingRecommended ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="w-8 h-8 animate-spin text-green-600" />
          </div>
        ) : recommendedPackages.length > 0 ? (
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
                        {pkg.level === 'basic' && t('package.level.basic', language)}
                        {pkg.level === 'advanced' && t('package.level.advanced', language)}
                        {pkg.level === 'premium' && t('package.level.premium', language)}
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
                        {pkg.cookTime}{t('common.minutes', language)}
                      </span>
                      <span className="flex items-center">
                        <ChefHat className="w-4 h-4 mr-1" />
                        {pkg.difficulty === 'easy' && t('package.difficulty.easy', language)}
                        {pkg.difficulty === 'medium' && t('package.difficulty.medium', language)}
                        {pkg.difficulty === 'hard' && t('package.difficulty.hard', language)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card className="bg-gray-50">
            <CardContent className="p-8 text-center">
              <Sparkles className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p className="text-gray-500">{t('home.noRecommended', language)}</p>
              <p className="text-sm text-gray-400 mt-1">{t('home.createProfileTip', language)}</p>
              <Button variant="link" asChild className="mt-2">
                <Link to="/diet-profile">{t('home.createDietProfile', language)}</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* 最近订单 */}
      {recentOrders.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">{t('home.recentOrders', language)}</h2>
            <Link to="/orders" className="text-green-600 hover:text-green-700 flex items-center text-sm">
              {t('common.seeAll', language)} <ArrowRight className="w-4 h-4 ml-1" />
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
                          {t('order.orderNumber', language)}：{order.id} · {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                        <div className="flex items-center mt-1">
                          {order.status === 'delivered' && (
                            <Badge variant="secondary" className="bg-green-100 text-green-700">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              {t('order.status.delivered', language)}
                            </Badge>
                          )}
                          {order.status === 'shipped' && (
                            <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                              <Truck className="w-3 h-3 mr-1" />
                              {t('order.status.shipping', language)}
                            </Badge>
                          )}
                          {order.status === 'preparing' && (
                            <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
                              <ChefHat className="w-3 h-3 mr-1" />
                              {t('order.status.preparing', language)}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">¥{order.totalAmount}</p>
                      <Button variant="ghost" size="sm" className="text-green-600" asChild>
                        <Link to={`/orders/${order.id}`}>{t('common.viewDetails', language)}</Link>
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
              <h3 className="font-bold text-lg">{t('home.dietGoals', language)}</h3>
              <Badge variant="outline">
                {profile.dietGoal === 'weight_loss' && t('dietGoal.weightLoss', language)}
                {profile.dietGoal === 'muscle_gain' && t('dietGoal.muscleGain', language)}
                {profile.dietGoal === 'blood_sugar_control' && t('dietGoal.bloodSugar', language)}
                {profile.dietGoal === 'balanced' && t('dietGoal.balanced', language)}
                {profile.dietGoal === 'other' && t('dietGoal.other', language)}
              </Badge>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">{t('home.weeklyGoal', language)}</span>
                  <span className="font-medium">75%</span>
                </div>
                <Progress value={75} className="h-2" />
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-2xl font-bold text-green-600">12</div>
                  <div className="text-xs text-gray-500">{t('home.stats.healthyMeals', language)}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-2xl font-bold text-blue-600">8</div>
                  <div className="text-xs text-gray-500">{t('home.stats.protein', language)}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-2xl font-bold text-orange-600">450</div>
                  <div className="text-xs text-gray-500">{t('home.stats.calories', language)}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
