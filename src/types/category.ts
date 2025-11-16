/**
 * 分类信息
 */
export interface CategoryInfo {
  id: number
  parent_id: number | null
  name: string
  level: number
  sort_order: number
  is_visible: number
  children?: CategoryInfo[]
}

/**
 * 分类表单数据
 */
export interface CategoryFormData {
  parent_id: number | null
  name: string
  level: number
  sort_order: number
  is_visible: number
}