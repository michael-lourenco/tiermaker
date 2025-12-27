import { createClient } from '@/lib/supabase/client'

export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  icon: string | null
  image_url: string | null
  created_at: string
  updated_at: string
}

export interface CreateCategoryInput {
  name: string
  description?: string | null
  icon?: string | null
  image_url?: string | null
}

export interface UpdateCategoryInput {
  name?: string
  description?: string | null
  icon?: string | null
  image_url?: string | null
}

export class CategoryService {
  private supabase = createClient()

  /**
   * Get all categories
   */
  async getAllCategories(): Promise<Category[]> {
    const { data, error } = await this.supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true })

    if (error) {
      // If table doesn't exist, return empty array
      if (error.code === '42P01') {
        return []
      }
      throw error
    }
    return data || []
  }

  /**
   * Get category by slug
   */
  async getCategoryBySlug(slug: string): Promise<Category | null> {
    const { data, error } = await this.supabase
      .from('categories')
      .select('*')
      .eq('slug', slug)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw error
    }
    return data
  }

  /**
   * Get category by ID
   */
  async getCategoryById(id: string): Promise<Category | null> {
    const { data, error } = await this.supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw error
    }
    return data
  }

  /**
   * Generate slug from name
   */
  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  /**
   * Create a new category
   */
  async createCategory(input: CreateCategoryInput): Promise<Category> {
    const slug = this.generateSlug(input.name)

    const { data, error } = await this.supabase
      .from('categories')
      .insert({
        name: input.name,
        slug,
        description: input.description ?? null,
        icon: input.icon ?? null,
        image_url: input.image_url ?? null,
      } as any)
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        throw new Error('Category with this name already exists')
      }
      throw error
    }

    if (!data) throw new Error('Failed to create category')
    return data
  }

  /**
   * Update a category
   */
  async updateCategory(id: string, input: UpdateCategoryInput): Promise<Category> {
    const updateData: {
      name?: string
      slug?: string
      description?: string | null
      icon?: string | null
      image_url?: string | null
    } = {}

    if (input.name !== undefined) {
      updateData.name = input.name
      updateData.slug = this.generateSlug(input.name)
    }
    if (input.description !== undefined) {
      updateData.description = input.description
    }
    if (input.icon !== undefined) {
      updateData.icon = input.icon
    }
    if (input.image_url !== undefined) {
      updateData.image_url = input.image_url
    }

    const supabase = this.supabase as any
    const result = await supabase
      .from('categories')
      .update(updateData)
      .eq('id', id)
      .select()
      .single() as { data: Category | null; error: any }

    const { data, error } = result

    if (error) {
      if (error.code === '23505') {
        throw new Error('Category with this name already exists')
      }
      throw error
    }

    if (!data) throw new Error('Failed to update category')
    return data
  }

  /**
   * Delete a category
   */
  async deleteCategory(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('categories')
      .delete()
      .eq('id', id)

    if (error) throw error
  }

  /**
   * Get or create category by name
   */
  async getOrCreateCategory(name: string): Promise<Category> {
    const slug = this.generateSlug(name)

    // Try to find existing category
    const existing = await this.getCategoryBySlug(slug)
    if (existing) return existing

    // Create new category
    return this.createCategory({ name })
  }
}
