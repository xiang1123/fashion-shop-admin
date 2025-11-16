import { StorageKeys, setStorage, getStorage } from './storage'

/**
 * 设置 Token
 */
export const setToken = (token: string): void => {
  setStorage(StorageKeys.TOKEN, token)
}

/**
 * 获取 Token
 */
export const getToken = (): string | null => {
  return getStorage<string>(StorageKeys.TOKEN)
}

/**
 * 删除 Token
 */
export const removeToken = (): void => {
  localStorage.removeItem(StorageKeys.TOKEN)
}

/**
 * 设置用户信息
 */
export const setUserInfo = (userInfo: any): void => {
  setStorage(StorageKeys.USER_INFO, userInfo)
}

/**
 * 获取用户信息
 */
export const getUserInfo = <T = any>(): T | null => {
  return getStorage<T>(StorageKeys.USER_INFO)
}

/**
 * 删除用户信息
 */
export const removeUserInfo = (): void => {
  localStorage.removeItem(StorageKeys.USER_INFO)
}

/**
 * 设置 Token 过期时间
 */
export const setTokenExpireTime = (expireTime: number): void => {
  setStorage(StorageKeys.TOKEN_EXPIRE_TIME, expireTime)
}

/**
 * 获取 Token 过期时间
 */
export const getTokenExpireTime = (): number | null => {
  return getStorage<number>(StorageKeys.TOKEN_EXPIRE_TIME)
}

/**
 * 检查 Token 是否过期
 */
export const isTokenExpired = (): boolean => {
  const expireTime = getTokenExpireTime()
  if (!expireTime) return true
  return Date.now() > expireTime
}

/**
 * 清除所有登录信息
 */
export const clearAuthInfo = (): void => {
  removeToken()
  removeUserInfo()
  localStorage.removeItem(StorageKeys.TOKEN_EXPIRE_TIME)
}