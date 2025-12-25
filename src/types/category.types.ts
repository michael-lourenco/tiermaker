export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  icon: string | null
  created_at: string
  updated_at: string
}

export interface TemplateCategory {
  id: string
  template_id: string
  category_id: string
  created_at: string
}

export interface CategoryWithCount extends Category {
  templates_count?: number
}

