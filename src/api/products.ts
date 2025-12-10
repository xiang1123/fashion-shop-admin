import request from '@/utils/request'
import type { ProductInfo, ProductFormData, SkuInfo, UpdateStockParams } from '@/types/product'

// 定义分页返回结构 (与后端 PageResult 对应)
export interface PageResult<T> {
  total: number
  list: T[]
  page: number
  page_size: number
}

// 定义查询参数接口
export interface ProductQueryParams {
  page?: number
  page_size?: number
  q?: string
}

/**
 * 获取商品列表 (支持分页和搜索)
 * @param {ProductQueryParams} params 查询参数
 */
export const getProductList = (params?: ProductQueryParams) => {
  // 注意：这里必须把 params 传给 request.get
  return request.get<PageResult<ProductInfo>>('/admin/api/v1/products', { params })
}

/**
 * 创建商品
 */
export const createProduct = (data: ProductFormData) => {
  return request.post('/admin/api/v1/products', data)
}

/**
 * 更新商品
 */
export const updateProduct = (id: number, data: ProductFormData) => {
  return request.patch(`/admin/api/v1/products/${id}`, data)
}

/**
 * 删除商品
 */
export const deleteProduct = (id: number) => {
  return request.delete(`/admin/api/v1/products/${id}`)
}

/**
 * 获取商品SKU列表
 */
export const getProductSkus = (id: number) => {
  return request.get<SkuInfo[]>(`/admin/api/v1/products/${id}/skus`)
}

/**
 * 创建SKU
 */
export const createSku = (productId: number, data: SkuInfo) => {
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
 */
export const updateSku = (id: number, data: SkuInfo) => {
  const skuData = {
    sku_code: data.sku_code.trim(),
    color: data.color.trim(),
    size: data.size.trim(),
    price: Number(data.price),
    stock: Number(data.stock),
    image: data.image?.trim() || '',
    bar_code: data.bar_code?.trim() || '',
    is_active: data.is_active ?? 1
  }
  return request.patch(`/admin/api/v1/skus/${id}`, skuData)
}

/**
 * 删除SKU
 */
export const deleteSku = (id: number) => {
  return request.delete(`/admin/api/v1/skus/${id}`)
}

/**
 * 更新SKU库存
 */
export const updateSkuStock = (id: number, data: UpdateStockParams) => {
  return request.patch(`/admin/api/v1/skus/${id}/stock`, { 
    stock: Number(data.stock) 
  })
}