import request from '@/utils/request'

/**
 * 获取横幅列表数据
 * 该函数用于向服务器请求获取所有横幅广告的列表信息
 * @returns {Promise} 返回一个Promise对象，包含服务器响应的横幅数据
 */
export const getBanners = () => 
  request.get('/admin/api/v1/banners') // 发送GET请求到指定API端点获取横幅数据

/**
 * 创建横幅的函数
 * @param data - 横幅数据，类型为any
 * @returns 返回一个Promise，包含API请求的结果
 */
export const createBanner = (data: any) => 
  request.post('/admin/api/v1/banners', data) // 发送POST请求到指定API端点，传入横幅数据


export const updateBanner = (id: number, data: any) => 
  request.patch(`/admin/api/v1/banners/${id}`, data)

/**
 * 删除横幅广告的函数
 * @param id - 要删除的横幅广告的ID
 * @returns 返回一个Promise，包含删除操作的响应结果
 */
export const deleteBanner = (id: number) => 
  request.delete(`/admin/api/v1/banners/${id}`) // 发送DELETE请求到指定的API端点，删除对应ID的横幅广告