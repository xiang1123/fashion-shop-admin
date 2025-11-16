/**
 * Banner 信息
 */
export interface BannerInfo {
  id: number
  image_url: string
  link_url: string
  sort_order: number
  is_active: number
}

/**
 * Banner 表单数据
 */
export interface BannerFormData {
  image_url: string
  link_url: string
  sort_order: number
  is_active: number
}