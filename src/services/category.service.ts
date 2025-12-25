import { createClient } from '@/lib/supabase/client'

export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  icon: string | null
  created_at: string
  updated_at: string
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
   * Get or create category by name
   */
  async getOrCreateCategory(name: string): Promise<Category> {
    const slug = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')

    // Try to find existing category
    const existing = await this.getCategoryBySlug(slug)
    if (existing) return existing

    // Create new category
    const { data, error } = await this.supabase
      .from('categories')
      .insert({
        name,
        slug,
        description: null,
        icon: null,
      } as any)
      .select()
      .single()

    if (error) {
      // If unique constraint violation, try to get it again
      if (error.code === '23505') {
        const retry = await this.getCategoryBySlug(slug)
        if (retry) return retry
      }
      throw error
    }

    if (!data) throw new Error('Failed to create category')
    return data
  }
}
