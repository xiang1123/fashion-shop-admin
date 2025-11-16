/**
 * 分类管理相关的API请求函数集合
 * 用于对分类进行增删改查操作
 */
import request from '@/utils/request' // 导入请求工具函数


/**
 * 获取分类列表的API请求函数
 * 该函数通过GET请求方式调用后端接口获取所有分类信息
 * @returns {Promise} 返回一个Promise对象，包含API请求的结果
 */
export const getCategoryList = () => 
  request.get('/admin/api/v1/categories') // 调用后端获取分类列表的接口

/**
 * 创建分类的函数
 * @param data - 包含分类信息的对象
 * @returns 返回一个Promise，解析为服务器的响应
 */
export const createCategory = (data: any) => 
  request.post('/admin/api/v1/categories', data) // 发送POST请求到分类创建接口

/**
 * 
 * @param id 
 * @param data 
 * @returns 
 */
export const updateCategory = (id: number, data: any) => 
  request.patch(`/admin/api/v1/categories/${id}`, data)

/**
 * 删除分类的函数
 * @param id - 要删除的分类的ID
 * @returns 返回一个请求对象，表示删除分类的API请求
 */
export const deleteCategory = (id: number) => 
  request.delete(`/admin/api/v1/categories/${id}`) // 发送DELETE请求到指定分类ID的API端点