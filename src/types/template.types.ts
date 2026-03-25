export interface Template {
  id: string
  user_id: string | null
  name: string
  description: string | null
  cover_image_url: string | null
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
}

export interface TemplateWithCategories extends Template {
  categories: Array<{ id: string; name: string; slug: string }>
}

export interface TemplateWithItemsAndCategories extends TemplateWithItems {
  categories: Array<{ id: string; name: string; slug: string }>
}

export interface TemplateTier {
  id: string
  template_id: string
  tier_name: string
  tier_order: number
  color: string | null
  created_at: string
}

export interface CreateTemplateInput {
  name: string
  description?: string
  category_id: string
  cover_image_url?: string
  is_public?: boolean
  items: Omit<TemplateItem, 'id' | 'template_id' | 'created_at'>[]
  tiers?: Array<{ tier_name: string; tier_order: number; color: string | null }>
}

export interface TemplateWithTiers extends TemplateWithItems {
  tiers?: TemplateTier[]
}

/** Payload item for POST /api/templates/clone */
export interface CloneTemplateItemPayload {
  name: string
  order: number
  source: 'cloned' | 'new'
  image_url: string
}

export interface CloneTemplateRequestBody {
  source_template_id: string
  name: string
  description?: string
  category_id: string
  is_public?: boolean
  cover_image: null | { source: 'cloned' | 'new'; image_url: string }
  items: CloneTemplateItemPayload[]
  tiers?: Array<{ tier_name: string; tier_order: number; color: string | null }>
}


