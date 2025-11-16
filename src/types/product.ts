/**
 * 商品状态
 */
export type ProductStatus = 'ON_SALE' | 'OFF_SALE' | 'SOLD_OUT'

/**
 * SKU 信息
 */
export interface SkuInfo {
  id?: number
  sku_code: string
  color: string
  size: string
  price: number
  stock: number
  image?: string
  bar_code?: string
  is_active?: number
}

/**
 * 商品信息
 */
export interface ProductInfo {
  id: number
  title: string
  subtitle: string
  description?: string
  status: ProductStatus
  category_id: number
  cover_image: string
  skus?: SkuInfo[]
}

/**
 * 商品表单数据
 */
export interface ProductFormData {
  title: string
  subtitle: string
  description?: string
  status: ProductStatus
  category_id: number
  cover_image: string
  skus: SkuInfo[]
}

/**
 * 更新库存参数
 */
export interface UpdateStockParams {
  stock: number
}