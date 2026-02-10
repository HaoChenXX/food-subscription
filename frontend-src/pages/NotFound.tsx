import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Utensils, Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 p-4">
      <div className="text-center max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Utensils className="w-10 h-10 text-white" />
          </div>
        </div>
        
        {/* 错误代码 */}
        <h1 className="text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-emerald-600 mb-4">
          404
        </h1>
        
        {/* 错误信息 */}
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          页面未找到
        </h2>
        <p className="text-gray-600 mb-8">
          抱歉，您访问的页面不存在或已被移除。
        </p>
        
        {/* 操作按钮 */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            variant="outline"
            onClick={() => window.history.back()}
            className="flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回上一页
          </Button>
          <Button
            asChild
            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
          >
            <Link to="/" className="flex items-center">
              <Home className="w-4 h-4 mr-2" />
              返回首页
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
