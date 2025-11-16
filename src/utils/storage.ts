/**
 * 统一的本地存储工具
 */

export const StorageKeys = {
  TOKEN: 'admin_token',
  USER_INFO: 'admin_user_info',
  TOKEN_EXPIRE_TIME: 'admin_token_expire_time',
} as const

/**
 * 存储数据
 */
export const setStorage = (key: string, value: any): void => {
  try {
    const stringValue = JSON.stringify(value)
    localStorage.setItem(key, stringValue)
  } catch (error) {
    console.error('存储失败', error)
  }
}

/**
 * 获取数据
 */
export const getStorage = <T = any>(key: string): T | null => {
  try {
    const value = localStorage.getItem(key)
    if (value) {
      return JSON.parse(value) as T
    }
    return null
  } catch (error) {
    console.error('获取数据失败:', error)
    return null
  }
}

/**
 * 删除数据
 */
export const removeStorage = (key: string): void => {
  try {
    localStorage.removeItem(key)
  } catch (error) {
    console.error('删除数据失败:', error)
  }
}

/**
 * 清空所有数据
 */
export const clearStorage = (): void => {
  try {
    localStorage.clear()
  } catch (error) {
    console.error('清空数据失败:', error)
  }
}