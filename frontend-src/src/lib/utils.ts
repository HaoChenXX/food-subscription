import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// 格式化价格
export function formatPrice(price: number): string {
  return `¥${price.toFixed(2)}`
}

// 格式化日期
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// 获取难度文本
export function getDifficultyText(difficulty: 'easy' | 'medium' | 'hard'): string {
  const map = {
    easy: '简单',
    medium: '中等',
    hard: '困难'
  }
  return map[difficulty] || difficulty
}

// 获取订单状态文本
export function getOrderStatusText(status: string): string {
  const map: Record<string, string> = {
    pending_payment: '待支付',
    paid: '已支付',
    preparing: '准备中',
    shipped: '配送中',
    delivered: '已送达',
    cancelled: '已取消',
    refunded: '已退款'
  }
  return map[status] || status
}
