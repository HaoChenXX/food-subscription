// API 导出文件 - 使用真实 API
import { api, mockApi } from './api'

// 默认导出真实 API
export default api

// 为了保持兼容性，同时导出 mockApi
export { api, mockApi }

// 为了方便使用，也单独导出各个模块
export const packageApi = api.foodPackages
export const orderApi = api.orders
export const subscriptionApi = api.subscriptions
export const addressApi = api.addresses
export const dietProfileApi = api.dietProfile
