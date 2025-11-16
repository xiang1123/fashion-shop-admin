import request from '@/utils/request'
import type {
  UserListParams,
} from '@/types/user'

export const getUser = (params?: UserListParams) =>
  request.get('/admin/api/v1/users', { params })

export const getUserDetail = (id: number) =>
  request.get(`/admin/api/v1/users/${id}`)