import type { Category } from './category.types'

export interface Template {
  id: string
  user_id: string | null
  name: string
  description: string | null
  is_public: boolean
  views_count: number
  likes_count: number
  created_at: string
  updated_at: string
}

export interface TemplateItem {
  id: string
  template_id: string
  name: string
  image_url: string
  order: number
  created_at: string
}

export interface TemplateWithItems extends Template {
  items: TemplateItem[]
  categories?: Category[]
}

export interface CreateTemplateInput {
  name: string
  description?: string
  category_ids: string[]
  is_public?: boolean
  items: Omit<TemplateItem, 'id' | 'template_id' | 'created_at'>[]
}


