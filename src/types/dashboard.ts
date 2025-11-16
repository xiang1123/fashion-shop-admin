/**
 * 仪表盘数据
 */
export interface DashboardData {
  total_orders: number
  paid_orders: number
  unshipped: number
}

/**
 * 订单统计
 */
export interface OrderStats {
  status: string
  count: number
}