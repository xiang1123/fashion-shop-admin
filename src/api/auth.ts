import request from '@/utils/request'

export const login = (data: { username: string; password: string }) =>
  request.post('/admin/api/v1/auth/login', data)