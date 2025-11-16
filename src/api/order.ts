import request from '@/utils/request'
import type { OrderInfo, OrderListResponse, OrderQueryParams, ShipParams } from '@/types/order'


/**
 * 获取订单列表的接口函数
 * @param params - 可选的查询参数对象，用于过滤和排序订单
 * @returns 返回一个Promise，解析为API响应结果
 */
export const getOrders = (params?: OrderQueryParams) =>
  request.get<OrderListResponse>('/admin/api/v1/orders', { params })

/**
 * 获取订单详情的API请求函数
 * @param id - 订单ID，数字类型
 * @returns 返回一个Promise，通过request.get发起获取订单详情的请求
 */
export const getOrderDetail = (id: number) =>
  request.get<OrderInfo>(`/admin/api/v1/orders/${id}`) // 发起GET请求到指定订单详情接口

/**
 * 
 * @param id 
 * @param data 
 * @returns 
 */
export const shipOrder = (id: number, data: ShipParams) =>
  request.post(`/admin/api/v1/orders/${id}/ship`, data)

/**
 * 取消订单的API请求函数
 * @param {number} id - 订单ID，用于指定需要取消的订单
 * @returns {Promise} 返回一个Promise对象，包含API请求的结果
 */
export const cancelOrder = (id: number) =>
  request.post(`/admin/api/v1/orders/${id}/cancel`) // 发送POST请求到取消订单的接口