/**
 * 获取环境变量
 */
export const getEnv = () => {
  return import.meta.env
}

/**
 * 获取 API 基础路径
 */
export const getApiBaseUrl = () => {
  return import.meta.env.VITE_API_BASE_URL
}


/**
 * 是否为开发环境
 */
export const isDev = () => {
  return import.meta.env.DEV
}

/**
 * 是否为生产环境
 */
export const isProd = () => {
  return import.meta.env.PROD
}

/**
 * 是否开启 Mock
 */
export const useMock = () => {
  return import.meta.env.VITE_USE_MOCK === 'true'
}