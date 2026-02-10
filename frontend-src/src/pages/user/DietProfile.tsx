import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
// import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { useAuthStore, useDietProfileStore } from '@/store';
import { mockApi } from '@/api/mock';
import {
  User,
  Heart,
  ChefHat,
  Users,
  Clock,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

const cuisineOptions = [
  { id: 'sichuan', label: '川菜', icon: '' },
  { id: 'cantonese', label: '粤菜', icon: '' },
  { id: 'shandong', label: '鲁菜', icon: '' },
  { id: 'jiangsu', label: '苏菜', icon: '' },
  { id: 'zhejiang', label: '浙菜', icon: '' },
  { id: 'fujian', label: '闽菜', icon: '' },
  { id: 'hunan', label: '湘菜', icon: '' },
  { id: 'anhui', label: '徽菜', icon: '' },
];

const tasteOptions = [
  { id: 'salty', label: '咸鲜' },
  { id: 'sweet', label: '甜香' },
  { id: 'sour', label: '酸甜' },
  { id: 'spicy', label: '麻辣' },
  { id: 'light', label: '清淡' },
  { id: 'rich', label: '浓郁' },
];

const applianceOptions = [
  { id: 'stove', label: '燃气灶' },
  { id: 'rice_cooker', label: '电饭煲' },
  { id: 'oven', label: '烤箱' },
  { id: 'air_fryer', label: '空气炸锅' },
  { id: 'microwave', label: '微波炉' },
  { id: 'induction', label: '电磁炉' },
  { id: 'steamer', label: '蒸锅' },
  { id: 'pressure_cooker', label: '压力锅' },
];

const allergyOptions = [
  { id: 'peanuts', label: '花生' },
  { id: 'shellfish', label: '贝类' },
  { id: 'eggs', label: '鸡蛋' },
  { id: 'milk', label: '牛奶' },
  { id: 'soy', label: '大豆' },
  { id: 'wheat', label: '小麦' },
  { id: 'fish', label: '鱼类' },
  { id: 'nuts', label: '坚果' },
];

export default function DietProfilePage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { profile, setProfile } = useDietProfileStore();
  const [step, setStep] = useState(1);
  const totalSteps = 4;

  // 表单数据
  const [formData, setFormData] = useState({
    // 基础属性
    age: profile?.age || 30,
    gender: profile?.gender || 'male',
    dietGoal: profile?.dietGoal || 'balanced',
    allergies: profile?.allergies || [],
    avoidances: profile?.avoidances || [],
    // 口味偏好
    cuisinePreferences: profile?.cuisinePreferences || [],
    spiceLevel: profile?.spiceLevel || 'mild',
    tastePreference: profile?.tastePreference || [],
    // 烹饪能力
    cookingSkill: profile?.cookingSkill || 'beginner',
    availableAppliances: profile?.availableAppliances || [],
    avgCookingTime: profile?.avgCookingTime || 30,
    // 用餐习惯
    householdSize: profile?.householdSize || 2,
    mealFrequency: profile?.mealFrequency || 3,
    consumptionRate: profile?.consumptionRate || 'normal',
  });

  // 获取现有画像
  const { data: existingProfile, isLoading } = useQuery({
    queryKey: ['dietProfile', user?.id],
    queryFn: () => mockApi.dietProfile.get(user?.id || ''),
    enabled: !!user
  });

  useEffect(() => {
    if (existingProfile) {
      setProfile(existingProfile);
      setFormData({
        age: existingProfile.age,
        gender: existingProfile.gender,
        dietGoal: existingProfile.dietGoal,
        allergies: existingProfile.allergies,
        avoidances: existingProfile.avoidances,
        cuisinePreferences: existingProfile.cuisinePreferences,
        spiceLevel: existingProfile.spiceLevel,
        tastePreference: existingProfile.tastePreference,
        cookingSkill: existingProfile.cookingSkill,
        availableAppliances: existingProfile.availableAppliances,
        avgCookingTime: existingProfile.avgCookingTime,
        householdSize: existingProfile.householdSize,
        mealFrequency: existingProfile.mealFrequency,
        consumptionRate: existingProfile.consumptionRate,
      });
    }
  }, [existingProfile, setProfile]);

  // 保存画像
  const saveMutation = useMutation({
    mutationFn: async () => {
      if (profile) {
        return mockApi.dietProfile.update(user?.id || '', formData);
      } else {
        return mockApi.dietProfile.create(user?.id || '', formData);
      }
    },
    onSuccess: (data) => {
      setProfile(data);
      toast.success('饮食画像保存成功！');
      navigate('/');
    },
    onError: () => {
      toast.error('保存失败，请重试');
    }
  });

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const handlePrev = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSave = () => {
    saveMutation.mutate();
  };

  const updateFormData = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const toggleArrayItem = (key: string, item: string) => {
    setFormData(prev => {
      const arr = prev[key as keyof typeof prev] as string[];
      if (arr.includes(item)) {
        return { ...prev, [key]: arr.filter(i => i !== item) };
      } else {
        return { ...prev, [key]: [...arr, item] };
      }
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 lg:p-6">
      {/* 标题 */}
      <div className="text-center mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold mb-2">
          {profile ? '更新饮食画像' : '创建您的饮食画像'}
        </h1>
        <p className="text-gray-500">
          帮助我们了解您的饮食偏好，为您推荐最合适的食材包
        </p>
      </div>

      {/* 进度条 */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-500">步骤 {step} / {totalSteps}</span>
          <span className="text-sm font-medium">{Math.round((step / totalSteps) * 100)}%</span>
        </div>
        <Progress value={(step / totalSteps) * 100} className="h-2" />
      </div>

      {/* 步骤内容 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            {step === 1 && <User className="w-5 h-5 mr-2 text-green-600" />}
            {step === 2 && <Heart className="w-5 h-5 mr-2 text-red-500" />}
            {step === 3 && <ChefHat className="w-5 h-5 mr-2 text-orange-500" />}
            {step === 4 && <Users className="w-5 h-5 mr-2 text-blue-500" />}
            {step === 1 && '基础属性'}
            {step === 2 && '口味偏好'}
            {step === 3 && '烹饪能力'}
            {step === 4 && '用餐习惯'}
          </CardTitle>
          <CardDescription>
            {step === 1 && '告诉我们您的基本信息和饮食目标'}
            {step === 2 && '选择您喜欢的菜系和口味'}
            {step === 3 && '了解您的烹饪技能和设备'}
            {step === 4 && '告诉我们您的用餐习惯'}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* 步骤1：基础属性 */}
          {step === 1 && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>年龄</Label>
                  <Input
                    type="number"
                    value={formData.age}
                    onChange={(e) => updateFormData('age', parseInt(e.target.value))}
                    min={18}
                    max={100}
                  />
                </div>
                <div className="space-y-2">
                  <Label>性别</Label>
                  <RadioGroup
                    value={formData.gender}
                    onValueChange={(value) => updateFormData('gender', value)}
                    className="flex space-x-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="male" id="male" />
                      <Label htmlFor="male">男</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="female" id="female" />
                      <Label htmlFor="female">女</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>

              <div className="space-y-2">
                <Label>饮食目标</Label>
                <RadioGroup
                  value={formData.dietGoal}
                  onValueChange={(value) => updateFormData('dietGoal', value)}
                  className="grid grid-cols-2 gap-4"
                >
                  {[
                    { value: 'weight_loss', label: '减脂', desc: '控制热量摄入' },
                    { value: 'muscle_gain', label: '增肌', desc: '高蛋白饮食' },
                    { value: 'blood_sugar_control', label: '控糖', desc: '低GI食材' },
                    { value: 'balanced', label: '均衡', desc: '营养均衡' },
                  ].map((goal) => (
                    <div key={goal.value}>
                      <RadioGroupItem
                        value={goal.value}
                        id={goal.value}
                        className="peer sr-only"
                      />
                      <Label
                        htmlFor={goal.value}
                        className="flex flex-col items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-all peer-data-[state=checked]:border-green-500 peer-data-[state=checked]:bg-green-50 hover:bg-gray-50"
                      >
                        <span className="font-medium">{goal.label}</span>
                        <span className="text-xs text-gray-500">{goal.desc}</span>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1 text-orange-500" />
                  过敏食材
                </Label>
                <div className="grid grid-cols-4 gap-3">
                  {allergyOptions.map((allergy) => (
                    <div key={allergy.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={allergy.id}
                        checked={formData.allergies.includes(allergy.label)}
                        onCheckedChange={() => toggleArrayItem('allergies', allergy.label)}
                      />
                      <Label htmlFor={allergy.id} className="text-sm">{allergy.label}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>忌口偏好</Label>
                <Input
                  placeholder="请输入您不吃的食材，用逗号分隔"
                  value={formData.avoidances.join(', ')}
                  onChange={(e) => updateFormData('avoidances', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                />
              </div>
            </>
          )}

          {/* 步骤2：口味偏好 */}
          {step === 2 && (
            <>
              <div className="space-y-2">
                <Label>喜欢的菜系</Label>
                <div className="grid grid-cols-4 gap-3">
                  {cuisineOptions.map((cuisine) => (
                    <div key={cuisine.id}>
                      <Checkbox
                        id={cuisine.id}
                        checked={formData.cuisinePreferences.includes(cuisine.label)}
                        onCheckedChange={() => toggleArrayItem('cuisinePreferences', cuisine.label)}
                        className="peer sr-only"
                      />
                      <Label
                        htmlFor={cuisine.id}
                        className="flex items-center justify-center p-3 border-2 rounded-lg cursor-pointer transition-all peer-data-[state=checked]:border-green-500 peer-data-[state=checked]:bg-green-50 hover:bg-gray-50"
                      >
                        {cuisine.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>辛辣接受度</Label>
                <RadioGroup
                  value={formData.spiceLevel}
                  onValueChange={(value) => updateFormData('spiceLevel', value)}
                  className="flex space-x-4"
                >
                  {[
                    { value: 'none', label: '不吃辣' },
                    { value: 'mild', label: '微辣' },
                    { value: 'medium', label: '中辣' },
                    { value: 'hot', label: '重辣' },
                  ].map((level) => (
                    <div key={level.value} className="flex items-center space-x-2">
                      <RadioGroupItem value={level.value} id={level.value} />
                      <Label htmlFor={level.value}>{level.label}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label>口味偏好</Label>
                <div className="flex flex-wrap gap-3">
                  {tasteOptions.map((taste) => (
                    <Badge
                      key={taste.id}
                      variant={formData.tastePreference.includes(taste.label) ? 'default' : 'outline'}
                      className={`cursor-pointer px-3 py-1 ${
                        formData.tastePreference.includes(taste.label)
                          ? 'bg-green-500 hover:bg-green-600'
                          : 'hover:bg-gray-100'
                      }`}
                      onClick={() => toggleArrayItem('tastePreference', taste.label)}
                    >
                      {taste.label}
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* 步骤3：烹饪能力 */}
          {step === 3 && (
            <>
              <div className="space-y-2">
                <Label>烹饪技能</Label>
                <RadioGroup
                  value={formData.cookingSkill}
                  onValueChange={(value) => updateFormData('cookingSkill', value)}
                  className="grid grid-cols-3 gap-4"
                >
                  {[
                    { value: 'beginner', label: '新手', desc: '刚入门' },
                    { value: 'intermediate', label: '熟练', desc: '有一定经验' },
                    { value: 'advanced', label: '高手', desc: '厨艺精湛' },
                  ].map((skill) => (
                    <div key={skill.value}>
                      <RadioGroupItem
                        value={skill.value}
                        id={skill.value}
                        className="peer sr-only"
                      />
                      <Label
                        htmlFor={skill.value}
                        className="flex flex-col items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-all peer-data-[state=checked]:border-green-500 peer-data-[state=checked]:bg-green-50 hover:bg-gray-50"
                      >
                        <ChefHat className="w-6 h-6 mb-2 text-gray-400" />
                        <span className="font-medium">{skill.label}</span>
                        <span className="text-xs text-gray-500">{skill.desc}</span>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label>可用厨具</Label>
                <div className="grid grid-cols-4 gap-3">
                  {applianceOptions.map((appliance) => (
                    <div key={appliance.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={appliance.id}
                        checked={formData.availableAppliances.includes(appliance.label)}
                        onCheckedChange={() => toggleArrayItem('availableAppliances', appliance.label)}
                      />
                      <Label htmlFor={appliance.id} className="text-sm">{appliance.label}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <Label className="flex items-center justify-between">
                  <span>平均烹饪时间</span>
                  <span className="text-green-600 font-medium">{formData.avgCookingTime} 分钟</span>
                </Label>
                <Slider
                  value={[formData.avgCookingTime]}
                  onValueChange={(value) => updateFormData('avgCookingTime', value[0])}
                  min={10}
                  max={120}
                  step={5}
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>10分钟</span>
                  <span>60分钟</span>
                  <span>120分钟</span>
                </div>
              </div>
            </>
          )}

          {/* 步骤4：用餐习惯 */}
          {step === 4 && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>家庭人数</Label>
                  <div className="flex items-center space-x-4">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => updateFormData('householdSize', Math.max(1, formData.householdSize - 1))}
                    >
                      -
                    </Button>
                    <span className="text-xl font-medium w-8 text-center">{formData.householdSize}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => updateFormData('householdSize', Math.min(10, formData.householdSize + 1))}
                    >
                      +
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>每日用餐次数</Label>
                  <div className="flex items-center space-x-4">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => updateFormData('mealFrequency', Math.max(1, formData.mealFrequency - 1))}
                    >
                      -
                    </Button>
                    <span className="text-xl font-medium w-8 text-center">{formData.mealFrequency}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => updateFormData('mealFrequency', Math.min(5, formData.mealFrequency + 1))}
                    >
                      +
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>食材消耗速度</Label>
                <RadioGroup
                  value={formData.consumptionRate}
                  onValueChange={(value) => updateFormData('consumptionRate', value)}
                  className="grid grid-cols-3 gap-4"
                >
                  {[
                    { value: 'slow', label: '较慢', desc: '2-3天' },
                    { value: 'normal', label: '正常', desc: '1-2天' },
                    { value: 'fast', label: '较快', desc: '当天' },
                  ].map((rate) => (
                    <div key={rate.value}>
                      <RadioGroupItem
                        value={rate.value}
                        id={rate.value}
                        className="peer sr-only"
                      />
                      <Label
                        htmlFor={rate.value}
                        className="flex flex-col items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-all peer-data-[state=checked]:border-green-500 peer-data-[state=checked]:bg-green-50 hover:bg-gray-50"
                      >
                        <Clock className="w-6 h-6 mb-2 text-gray-400" />
                        <span className="font-medium">{rate.label}</span>
                        <span className="text-xs text-gray-500">{rate.desc}</span>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </>
          )}
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrev}
            disabled={step === 1}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            上一步
          </Button>
          
          {step < totalSteps ? (
            <Button onClick={handleNext} className="bg-green-600 hover:bg-green-700">
              下一步
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSave}
              className="bg-green-600 hover:bg-green-700"
              disabled={saveMutation.isPending}
            >
              {saveMutation.isPending ? (
                <>
                  <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  保存中...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  保存画像
                </>
              )}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
