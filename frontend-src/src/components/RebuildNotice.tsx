import { AlertTriangle, Clock, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

export function RebuildNotice() {
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center animate-pulse">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg">
                🚧 系统即将重构升级
              </h3>
              <p className="text-white/90 text-xs sm:text-sm mt-0.5">
                平台即将进行全面重构，<span className="font-bold underline">各项服务可能随时暂停</span>，请尽快处理未完成的订单
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-full">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-medium">预计维护时间：近期</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsDismissed(true)}
              className="text-white hover:bg-white/20 flex-shrink-0"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
      {/* 底部条纹装饰 */}
      <div className="h-1 w-full bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(255,255,255,0.3)_10px,rgba(255,255,255,0.3)_20px)]" />
    </div>
  );
}

// 简化的内联版本，用于登录/注册页面
export function RebuildNoticeInline() {
  return (
    <div className="w-full bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 text-white rounded-xl p-4 shadow-lg mb-6 animate-in fade-in slide-in-from-top-2 duration-500">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center mt-0.5">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-base">
            🚧 系统即将重构升级
          </h3>
          <p className="text-white/90 text-sm mt-1">
            平台即将进行全面重构，<span className="font-bold underline">各项服务可能随时暂停</span>
          </p>
          <div className="flex items-center gap-2 mt-2 bg-white/20 px-3 py-1 rounded-full w-fit">
            <Clock className="w-3.5 h-3.5" />
            <span className="text-xs font-medium">预计维护时间：近期</span>
          </div>
        </div>
      </div>
    </div>
  );
}
