import { createClient } from '@/lib/supabase/client'
import type { Category, CategoryWithCount } from '@/types/category.types'

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

    if (error) throw error
    return data || []
  }

  /**
   * Get categories with template count
   */
  async getCategoriesWithCount(): Promise<CategoryWithCount[]> {
    const { data, error } = await this.supabase
      .from('categories')
      .select(`
        *,
        templates_count:template_categories(count)
      `)
      .order('name', { ascending: true })

    if (error) throw error
    
    // Transform the count data
    return (data || []).map((cat: any) => ({
      ...cat,
      templates_count: cat.templates_count?.[0]?.count || 0,
    }))
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
   * Create a new category
   */
  async createCategory(name: string, description?: string): Promise<Category> {
    const slug = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')

    const { data, error } = await this.supabase
      .from('categories')
      .insert({
        name,
        slug,
        description: description || null,
      } as any)
      .select()
      .single()

    if (error) {
      // If category already exists (unique constraint), return it
      if (error.code === '23505') {
        return await this.getCategoryBySlug(slug) as Category
      }
      throw error
    }

    if (!data) throw new Error('Failed to create category')
    return data
  }

  /**
   * Get or create category (useful for forms)
   */
  async getOrCreateCategory(name: string, description?: string): Promise<Category> {
    const slug = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')

    const existing = await this.getCategoryBySlug(slug)
    if (existing) return existing

    return await this.createCategory(name, description)
  }
}

