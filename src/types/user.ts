/**
 * 用户状态枚举
 */
export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  BANNED = 'BANNED'
}

/**
 * 用户信息
 */
export interface UserInfo {
  id: number | string
  email: string
  phone?: string | null
  nickname: string
  status: UserStatus
  avatar?: string
  username?: string
  role?: string
  roles?: string[]
  permissions?: string[]
  createdAt?: string
  updatedAt?: string
}

/**
 * 用户列表查询参数
 */
export interface UserListParams {
  page?: number
  pageSize?: number
  keyword?: string
  status?: UserStatus
}

/**
 * 用户列表响应
 */
export interface UserListResponse {
  code: number
  message: string
  data: {
    total: number
    list: UserInfo[]
  }
}

/**
 * 用户详情响应
 */
export interface UserDetailResponse {
  code: number
  message: string
  data: UserInfo
}

/**
 * 登录请求参数
 */
export interface LoginParams {
  username: string
  password: string
  remember?: boolean
  captcha?: string
}

/**
 * 登录响应
 */
export interface LoginResponse {
  code: number
  message: string
  data: {
    token: string
    expires_in: number
  }
}