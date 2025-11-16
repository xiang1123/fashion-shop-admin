import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { login as loginApi } from '@/api/auth'
import {
  setToken,
  setUserInfo,
  setTokenExpireTime,
  getUserInfo as getStoredUserInfo,
  getToken,
  clearAuthInfo
} from '@/utils/token'
import type { UserInfo, LoginParams } from '@/types/user'

export const useUserStore = defineStore('user', () => {
  // 状态
  const token = ref<string | null>(getToken())
  const userInfo = ref<UserInfo | null>(getStoredUserInfo<UserInfo>())

  // 计算属性
  const isLoggedIn = computed(() => !!token.value)
  const username = computed(() => userInfo.value?.username || '')
  const nickname = computed(() => userInfo.value?.nickname || '')
  const avatar = computed(() => userInfo.value?.avatar || '')
  const roles = computed(() => userInfo.value?.roles || [])
  const permissions = computed(() => userInfo.value?.permissions || [])

  // 登录
  const login = async (params: LoginParams): Promise<void> => {
    try {
      const res = await loginApi(params)
      console.log('登录响应:', res) // 调试日志
      
      // 处理响应数据
      if (res.code === 0) {
        const { token: newToken, expires_in } = res.data
        
        // 创建临时用户信息（因为接口没有返回用户信息）
        const tempUserInfo: UserInfo = {
          id: '1',
          username: params.username,
          nickname: params.username,
          avatar: 'https://api.dicebear.com/7.x/miniavs/svg?seed=1'
        }

        // 存储 token 和过期时间
        setToken(newToken)
        if (expires_in) {
          const expireTime = Date.now() + expires_in * 1000
          setTokenExpireTime(expireTime)
        }
        setUserInfo(tempUserInfo)

        // 更新状态
        token.value = newToken
        userInfo.value = tempUserInfo
      } else {
        throw new Error(res.message || '登录失败')
      }
    } catch (error) {
      console.error('登录失败:', error)
      throw error
    }
  }

  // 登出
  const logout = async (): Promise<void> => {
    try {
      // 这里可以调用退出登录接口
      // await logoutApi()
    } catch (error) {
      console.error('退出登录失败:', error)
    } finally {
      // 清除所有登录信息
      clearAuthInfo()
      token.value = null
      userInfo.value = null
    }
  }

  // 重置状态
  const resetState = (): void => {
    token.value = null
    userInfo.value = null
  }

  // 更新用户信息
  const updateUserInfo = (info: Partial<UserInfo>): void => {
    if (userInfo.value) {
      userInfo.value = { ...userInfo.value, ...info }
      setUserInfo(userInfo.value)
    }
  }

  // 检查权限
  const hasRole = (role: string | string[]): boolean => {
    if (!roles.value || roles.value.length === 0) return false
    if (typeof role === 'string') {
      return roles.value.includes(role)
    }
    return role.some(r => roles.value.includes(r))
  }

  const hasPermission = (permission: string | string[]): boolean => {
    if (!permissions.value || permissions.value.length === 0) return false
    if (typeof permission === 'string') {
      return permissions.value.includes(permission)
    }
    return permission.some(p => permissions.value.includes(p))
  }

  return {
    // 状态
    token,
    userInfo,
    // 计算属性
    isLoggedIn,
    username,
    nickname,
    avatar,
    roles,
    permissions,
    // 方法
    login,
    logout,
    resetState,
    updateUserInfo,
    hasRole,
    hasPermission
  }
})