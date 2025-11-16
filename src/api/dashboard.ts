import request from '@/utils/request'
import type { DashboardData } from '@/types/dashboard'

/**
 * 获取仪表盘数据
 */
export const getDashboardData = () => {
  return request.get<DashboardData>('/admin/api/v1/dashboard')
}