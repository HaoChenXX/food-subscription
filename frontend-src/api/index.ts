// API 导出文件
import { mockApi } from './mock'

// 导出模拟 API，后续可替换为真实 API
export const packageApi = {
  getAll: mockApi.foodPackages.getAll,
  getById: mockApi.foodPackages.getById,
  getRecommended: mockApi.foodPackages.getRecommended,
  getLimited: mockApi.foodPackages.getLimited,
}

export const cartApi = {
  // 购物车使用 localStorage/Zustand，无需 API
}

export const orderApi = {
  getAll: mockApi.orders.getAll,
  getById: mockApi.orders.getById,
  create: mockApi.orders.create,
  updateStatus: mockApi.orders.updateStatus,
}

export const subscriptionApi = {
  getAll: mockApi.subscriptions.getAll,
  create: mockApi.subscriptions.create,
  updateStatus: mockApi.subscriptions.updateStatus,
}

export const addressApi = {
  getAll: mockApi.addresses.getAll,
  create: mockApi.addresses.create,
}

export const dietProfileApi = {
  get: mockApi.dietProfile.get,
  create: mockApi.dietProfile.create,
  update: mockApi.dietProfile.update,
}

export { mockApi }
export default mockApi
