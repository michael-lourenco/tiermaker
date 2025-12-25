import { createClient } from '@/lib/supabase/client'
import type { Template, TemplateItem, TemplateWithItems, CreateTemplateInput } from '@/types/template.types'
import type { Category } from '@/types/category.types'

export class TemplateService {
  private supabase = createClient()

  /**
   * Get all public templates with optional filters
   */
  async getPublicTemplates(filters?: {
    category_id?: string
    category_slug?: string
    search?: string
    limit?: number
    offset?: number
  }): Promise<Template[]> {
    let query = this.supabase
      .from('templates')
      .select(`
        *,
        template_categories!inner(category_id, categories(*))
      `)
      .eq('is_public', true)
      .order('created_at', { ascending: false })

    // Filter by category
    if (filters?.category_id) {
      query = query.eq('template_categories.category_id', filters.category_id)
    } else if (filters?.category_slug) {
      query = query.eq('template_categories.categories.slug', filters.category_slug)
    }

    if (filters?.search) {
      query = query.ilike('name', `%${filters.search}%`)
    }

    if (filters?.limit) {
      query = query.limit(filters.limit)
    }

    if (filters?.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1)
    }

    const { data, error } = await query

    if (error) throw error
    
    // Flatten the response to remove nested structure
    return (data || []).map((item: any) => {
      const { template_categories, ...template } = item
      return template as Template
    })
  }

  /**
   * Get template by ID with items and categories
   */
  async getTemplateById(id: string): Promise<TemplateWithItems | null> {
    const { data: template, error: templateError } = await this.supabase
      .from('templates')
      .select('*')
      .eq('id', id)
      .single()

    if (templateError) throw templateError
    if (!template) return null

    // Get items
    const { data: items, error: itemsError } = await this.supabase
      .from('template_items')
      .select('*')
      .eq('template_id', id)
      .order('order', { ascending: true })

    if (itemsError) throw itemsError

    // Get categories
    const { data: templateCategories, error: categoriesError } = await this.supabase
      .from('template_categories')
      .select(`
        category_id,
        categories(*)
      `)
      .eq('template_id', id)

    if (categoriesError) throw categoriesError

    const categories = (templateCategories || []).map((tc: any) => tc.categories).filter(Boolean) as Category[]

    return {
      ...(template as Template),
      items: items || [],
      categories,
    }
  }

  /**
   * Get user's templates
   */
  async getUserTemplates(userId: string): Promise<Template[]> {
    const { data, error } = await this.supabase
      .from('templates')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  /**
   * Create a new template with categories
   */
  async createTemplate(input: CreateTemplateInput, userId: string): Promise<TemplateWithItems> {
    // Create template
    const result = (await this.supabase
      .from('templates')
      .insert({
        user_id: userId,
        name: input.name,
        description: input.description ?? null,
        is_public: input.is_public ?? true,
      } as any)
      .select()
      .single()) as { data: Template | null; error: any }

    if (result.error) throw result.error
    if (!result.data) throw new Error('Failed to create template')
    
    const template = result.data

    // Create template items
    const itemsToInsert = input.items.map((item, index) => ({
      template_id: template.id,
      name: item.name,
      image_url: item.image_url,
      order: item.order ?? index,
    }))

    const { data: items, error: itemsError } = await this.supabase
      .from('template_items')
      .insert(itemsToInsert as any)
      .select()

    if (itemsError) throw itemsError

    // Create template-category associations
    if (input.category_ids && input.category_ids.length > 0) {
      const categoryAssociations = input.category_ids.map((categoryId) => ({
        template_id: template.id,
        category_id: categoryId,
      }))

      const { error: categoriesError } = await this.supabase
        .from('template_categories')
        .insert(categoryAssociations as any)

      if (categoriesError) throw categoriesError
    }

    // Get categories for return
    const { data: templateCategories } = await this.supabase
      .from('template_categories')
      .select(`
        category_id,
        categories(*)
      `)
      .eq('template_id', template.id)

    const categories = (templateCategories || []).map((tc: any) => tc.categories).filter(Boolean) as Category[]

    return {
      ...template,
      items: items || [],
      categories,
    }
  }

  /**
   * Update template
   */
  async updateTemplate(
    templateId: string,
    updates: Partial<Omit<Template, 'id' | 'created_at' | 'user_id'>>,
    userId: string,
    categoryIds?: string[]
  ): Promise<Template> {
    const supabase = this.supabase as any
    
    // Update template fields
    const result = await supabase
      .from('templates')
      .update(updates)
      .eq('id', templateId)
      .eq('user_id', userId)
      .select()
      .single() as { data: Template | null; error: any }

    const { data, error } = result

    if (error) throw error
    if (!data) throw new Error('Template not found or unauthorized')

    // Update categories if provided
    if (categoryIds !== undefined) {
      // Delete existing associations
      await this.supabase
        .from('template_categories')
        .delete()
        .eq('template_id', templateId)

      // Create new associations
      if (categoryIds.length > 0) {
        const categoryAssociations = categoryIds.map((categoryId) => ({
          template_id: templateId,
          category_id: categoryId,
        }))

        const { error: categoriesError } = await this.supabase
          .from('template_categories')
          .insert(categoryAssociations as any)

        if (categoriesError) throw categoriesError
      }
    }

    return data
  }

  /**
   * Delete template
   */
  async deleteTemplate(templateId: string, userId: string): Promise<void> {
    const { error } = await this.supabase
      .from('templates')
      .delete()
      .eq('id', templateId)
      .eq('user_id', userId)

    if (error) throw error
  }

  /**
   * Increment views count
   */
  async incrementViews(templateId: string): Promise<void> {
    const supabase = this.supabase as any
    const { error } = await supabase.rpc('increment_template_views', {
      template_id: templateId,
    })

    // If RPC doesn't exist, do it manually
    if (error) {
      const supabase = this.supabase as any
      const { data } = await supabase
        .from('templates')
        .select('views_count')
        .eq('id', templateId)
        .single()

      if (data) {
        await supabase
          .from('templates')
          .update({ views_count: data.views_count + 1 })
          .eq('id', templateId)
      }
    }
  }
}
