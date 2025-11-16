/**
 * 订单状态
 */
export type OrderStatus = 'PENDING' | 'PAID' | 'SHIPPING' | 'COMPLETED' | 'CANCELED'

/**
 * 订单项
 */
export interface OrderItem {
  title: string
  quantity: number
  unit_price: number
  total_price?: number
}

/**
 * 订单信息
 */
export interface OrderInfo {
  id: number
  order_no: string
  status: OrderStatus
  amount_payable: number
  amount_total?: number
  user_id: number
  created_at: string
  items: OrderItem[]
  receiver_name?: string
  address?: string
}

/**
 * 订单列表响应
 */
export interface OrderListResponse {
  total: number
  list: OrderInfo[]
}

/**
 * 查询参数
 */
export interface OrderQueryParams {
  page?: number
  pageSize?: number
  status?: OrderStatus
  order_no?: string
}

/**
 * 发货参数
 */
export interface ShipParams {
  company: string
  tracking_no: string
}