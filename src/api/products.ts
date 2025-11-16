import request from '@/utils/request'
import type { ProductInfo, ProductFormData, SkuInfo, UpdateStockParams } from '@/types/product'

/**
 * 获取商品列表
 * @returns {Promise<ProductInfo[]>} 商品列表数据
 */
export const getProductList = () => {
  return request.get<ProductInfo[]>('/admin/api/v1/products')
}

/**
 * 创建商品
 * @param {ProductFormData} data 商品数据
 * @returns {Promise} 创建结果
 */
export const createProduct = (data: ProductFormData) => {
  return request.post('/admin/api/v1/products', data)
}

/**
 * 更新商品
 * @param {number} id 商品ID
 * @param {ProductFormData} data 商品数据
 * @returns {Promise} 更新结果
 */
export const updateProduct = (id: number, data: ProductFormData) => {
  return request.patch(`/admin/api/v1/products/${id}`, data)
}

/**
 * 删除商品
 * @param {number} id 商品ID
 * @returns {Promise} 删除结果
 */
export const deleteProduct = (id: number) => {
  return request.delete(`/admin/api/v1/products/${id}`)
}

/**
 * 获取商品SKU列表
 * @param {number} id 商品ID
 * @returns {Promise<SkuInfo[]>} SKU列表数据
 */
export const getProductSkus = (id: number) => {
  return request.get<SkuInfo[]>(`/admin/api/v1/products/${id}/skus`)
}

/**
 * 创建SKU
 * @param {number} productId 商品ID
 * @param {SkuInfo} data SKU数据
 * @returns {Promise} 创建结果
 */
export const createSku = (productId: number, data: SkuInfo) => {
  // 按照接口文档要求构建请求数据
  const skuData = {
    product_id: productId,
    sku_code: data.sku_code.trim(),
    color: data.color.trim(),
    size: data.size.trim(),
    price: Number(data.price),
    stock: Number(data.stock),
    image: data.image?.trim() || '',
    bar_code: data.bar_code?.trim() || '',
    is_active: 1
  }

  return request.post(`/admin/api/v1/products/${productId}/skus`, skuData)
}

/**
 * 更新SKU
 * @param {number} id SKU ID
 * @param {SkuInfo} data SKU数据
 * @returns {Promise} 更新结果
 */
export const updateSku = (id: number, data: SkuInfo) => {
  // 按照接口文档要求构建请求数据
  const skuData = {
    sku_code: data.sku_code.trim(),
    color: data.color.trim(),
    size: data.size.trim(),
    price: Number(data.price),
    stock: Number(data.stock),
    image: data.image?.trim() || '',
    bar_code: data.bar_code?.trim() || '',
    is_active: data.is_active || 1
  }

  return request.patch(`/admin/api/v1/skus/${id}`, skuData)
}

/**
 * 删除SKU
 * @param {number} id SKU ID
 * @returns {Promise} 删除结果
 */
export const deleteSku = (id: number) => {
  return request.delete(`/admin/api/v1/skus/${id}`)
}

/**
 * 更新SKU库存
 * @param {number} id SKU ID
 * @param {UpdateStockParams} data 库存数据
 * @returns {Promise} 更新结果
 */
export const updateSkuStock = (id: number, data: UpdateStockParams) => {
  return request.patch(`/admin/api/v1/skus/${id}/stock`, { 
    stock: Number(data.stock) 
  })
}