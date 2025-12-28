import { createClient } from '@/lib/supabase/client'
import type { SupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/lib/supabase/types'

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
  private supabase: any

  constructor(supabase?: any) {
    this.supabase = supabase || createClient()
  }

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
   * Get categories with image that have at least one tier list
   * Returns categories that have image_url and at least one tier list created from a template in that category
   */
  async getCategoriesWithImageAndTierLists(): Promise<Category[]> {
    // First, get all categories with image_url
    const { data: categories, error: categoriesError } = await this.supabase
      .from('categories')
      .select('*')
      .not('image_url', 'is', null)
      .order('name', { ascending: true })

    if (categoriesError) {
      // If table doesn't exist, return empty array
      if (categoriesError.code === '42P01') {
        return []
      }
      throw categoriesError
    }

    if (!categories || categories.length === 0) {
      return []
    }

    // For each category, check if it has templates with tier lists
    const categoriesWithTierLists: Category[] = []

    for (const category of categories as Category[]) {
      // Get template IDs in this category that are public and not deleted
      const { data: templateCategories, error: tcError } = await this.supabase
        .from('template_categories')
        .select('template_id')
        .eq('category_id', category.id)

      if (tcError) {
        continue
      }
      
      if (!templateCategories || templateCategories.length === 0) {
        continue
      }

      const templateIds = templateCategories.map((tc: any) => tc.template_id).filter(Boolean)

      if (templateIds.length === 0) {
        continue
      }

      // Get active public templates
      const { data: activeTemplates, error: templatesError } = await this.supabase
        .from('templates')
        .select('id, name, is_public, deleted_at')
        .in('id', templateIds)
        .eq('is_public', true)
        .is('deleted_at', null)

      if (templatesError) {
        continue
      }

      if (!activeTemplates || activeTemplates.length === 0) {
        continue
      }

      const activeTemplateIds = activeTemplates.map((t: any) => t.id).filter(Boolean)

      if (activeTemplateIds.length === 0) {
        continue
      }

      // Check if any template has tier lists (count all, not just public)
      // This is for determining if a category should appear on homepage
      // We count all tier lists because we're using service role client to bypass RLS
      const { count, error: tierListsError } = await this.supabase
        .from('tier_lists')
        .select('*', { count: 'exact', head: true })
        .in('template_id', activeTemplateIds)

      if (tierListsError) {
        continue
      }

      // If count > 0, this category has tier lists
      if (count && count > 0) {
        categoriesWithTierLists.push(category)
      }
    }
    
    return categoriesWithTierLists
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
