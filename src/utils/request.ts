import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { message } from 'ant-design-vue'
import { getApiBaseUrl } from './env'
import { getToken, clearAuthInfo } from './token'

// 创建 axios 实例
const service: AxiosInstance = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json;charset=utf-8'
  }
})

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    // 从工具函数获取 token
    const token = getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  (response: AxiosResponse) => {
    const res = response.data

    // 如果是 Blob 类型，直接返回（用于文件下载）
    if (response.config.responseType === 'blob') {
      return res
    }

    // 判断响应状态
    if (res.code !== undefined) {
      // 如果返回的状态码不是 0，则判断为错误
      if (res.code !== 0) {
        message.error(res.message || '请求失败')
        
        // 401: 未登录或 token 过期
        if (res.code === 401) {
          clearAuthInfo()
          window.location.href = '/login'
        }
        
        return Promise.reject(new Error(res.message || '请求失败'))
      }
    }

    // 如果没有 code 字段，直接返回数据
    return res
  },
  (error) => {
    console.error('响应错误:', error)
    
    let errorMessage = '网络错误'
    if (error.response) {
      switch (error.response.status) {
        case 401:
          errorMessage = '未授权，请重新登录'
          clearAuthInfo()
          window.location.href = '/login'
          break
        case 403:
          errorMessage = '拒绝访问'
          break
        case 404:
          errorMessage = '请求地址不存在'
          break
        case 500:
          errorMessage = '服务器错误'
          break
        default:
          errorMessage = error.response.data.message || '请求失败'
      }
    }
    
    message.error(errorMessage)
    return Promise.reject(error)
  }
)

export default service