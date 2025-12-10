import request from '@/utils/request'
import type { OrderInfo, ShipParams } from '@/types/order'

// 定义分页返回结构
export interface PageResult<T> {
  total: number
  list: T[]
  page: number
  page_size: number
}

// 查询参数接口
export interface OrderQueryParams {
  page?: number
  page_size?: number  // 统一为 snake_case 匹配后端
  status?: string
  order_no?: string
}

/**
 * 获取订单列表
 */
export const getOrders = (params?: OrderQueryParams) => {
  return request.get<PageResult<OrderInfo>>('/admin/api/v1/orders', { params })
}

/**
 * 获取订单详情
 */
export const getOrderDetail = (id: number) =>
  request.get<OrderInfo>(`/admin/api/v1/orders/${id}`)

/**
 * 发货
 */
export const shipOrder = (id: number, data: ShipParams) =>
  request.post(`/admin/api/v1/orders/${id}/ship`, data)

/**
 * 取消订单
 */
export const cancelOrder = (id: number) =>
  request.post(`/admin/api/v1/orders/${id}/cancel`)