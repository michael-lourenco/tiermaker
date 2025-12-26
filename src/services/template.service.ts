import { createClient } from '@/lib/supabase/client'
import type { Template, TemplateItem, TemplateWithItems, CreateTemplateInput } from '@/types/template.types'

export class TemplateService {
  private supabase = createClient()

  /**
   * Get all public templates with optional filters
   */
  async getPublicTemplates(filters?: {
    category?: string
    category_id?: string
    search?: string
    limit?: number
    offset?: number
  }): Promise<Array<Template & { categories: Array<{ id: string; name: string; slug: string }> }>> {
    // If filtering by category name, we need to find the category_id first
    let categoryId = filters?.category_id
    if (filters?.category && !categoryId) {
      // Try to find category by name
      const { data: categoryData } = await this.supabase
        .from('categories')
        .select('id')
        .ilike('name', filters.category)
        .single() as { data: { id: string } | null; error: any }
      
      if (categoryData) {
        categoryId = categoryData.id
      }
    }

    // Build query based on whether we're filtering by category
    let query
    if (categoryId) {
      // When filtering by category, use inner join to only get templates with that category
      query = this.supabase
        .from('templates')
        .select(`
          *,
          template_categories!inner(
            category_id,
            categories!inner(id, name, slug)
          )
        `)
        .eq('is_public', true)
        .eq('template_categories.category_id', categoryId)
    } else {
      // When not filtering, use regular join to get all templates with their categories
      query = this.supabase
        .from('templates')
        .select(`
          *,
          template_categories(category_id, categories(id, name, slug))
        `)
        .eq('is_public', true)
    }

    // Apply search filter
    if (filters?.search) {
      query = query.ilike('name', `%${filters.search}%`)
    }

    // Apply ordering
    query = query.order('created_at', { ascending: false })

    // Apply pagination
    if (filters?.limit) {
      query = query.limit(filters.limit)
    }

    if (filters?.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1)
    }

    const { data, error } = await query

    if (error) throw error
    
    // Flatten response and extract categories
    return (data || []).map((item: any) => {
      const { template_categories, ...template } = item
      const categories = (template_categories || [])
        .map((tc: any) => tc.categories)
        .filter(Boolean) as Array<{ id: string; name: string; slug: string }>
      return { ...template, categories } as Template & { categories: Array<{ id: string; name: string; slug: string }> }
    })
  }

  /**
   * Get template by ID with items and categories
   */
  async getTemplateById(id: string): Promise<(TemplateWithItems & { categories: Array<{ id: string; name: string; slug: string }> }) | null> {
    const { data: template, error: templateError } = await this.supabase
      .from('templates')
      .select(`
        *,
        template_categories(category_id, categories(id, name, slug))
      `)
      .eq('id', id)
      .single()

    if (templateError) throw templateError
    if (!template) return null

    const { data: items, error: itemsError } = await this.supabase
      .from('template_items')
      .select('*')
      .eq('template_id', id)
      .order('order', { ascending: true })

    if (itemsError) throw itemsError

    const { template_categories, ...templateData } = template as any
    const categories = (template_categories || [])
      .map((tc: any) => tc.categories)
      .filter(Boolean) as Array<{ id: string; name: string; slug: string }>

    return {
      ...(templateData as Template),
      items: items || [],
      categories,
    }
  }

  /**
   * Get user's templates
   */
  async getUserTemplates(userId: string): Promise<Array<Template & { categories: Array<{ id: string; name: string; slug: string }> }>> {
    const { data, error } = await this.supabase
      .from('templates')
      .select(`
        *,
        template_categories(category_id, categories(id, name, slug))
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    
    // Flatten response and extract categories
    return (data || []).map((item: any) => {
      const { template_categories, ...template } = item
      const categories = (template_categories || [])
        .map((tc: any) => tc.categories)
        .filter(Boolean) as Array<{ id: string; name: string; slug: string }>
      return { ...template, categories } as Template & { categories: Array<{ id: string; name: string; slug: string }> }
    })
  }

  /**
   * Create a new template
   */
  async createTemplate(input: CreateTemplateInput, userId: string): Promise<TemplateWithItems> {
    // Create template (without category and tags columns)
    const result = (await this.supabase
      .from('templates')
      .insert({
        user_id: userId,
        name: input.name,
        description: input.description ?? null,
        cover_image_url: input.cover_image_url ?? null,
        is_public: input.is_public ?? true,
      } as any)
      .select()
      .single()) as { data: Template | null; error: any }

    if (result.error) throw result.error
    if (!result.data) throw new Error('Failed to create template')
    
    const template = result.data

    // Create template-category relationship (required)
    if (input.category_id) {
      const { error: categoryError } = await this.supabase
        .from('template_categories')
        .insert({
          template_id: template.id,
          category_id: input.category_id,
        } as any)

      if (categoryError) {
        // If relationship fails, delete the template to maintain consistency
        await this.supabase
          .from('templates')
          .delete()
          .eq('id', template.id)
        throw new Error(`Failed to create template-category relationship: ${categoryError.message}`)
      }
    } else {
      throw new Error('Category ID is required')
    }

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

    return {
      ...template,
      items: items || [],
    }
  }

  /**
   * Update template
   */
  async updateTemplate(
    templateId: string,
    updates: Partial<Omit<Template, 'id' | 'created_at' | 'user_id'>>,
    userId: string
  ): Promise<Template> {
    const supabase = this.supabase as any
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

    return data
  }

  /**
   * Update template completely (including items and categories)
   */
  async updateTemplateComplete(
    templateId: string,
    input: {
      name: string
      description?: string
      category_id: string
      cover_image_url?: string
      is_public?: boolean
      items: Array<{
        name: string
        image_url: string
        order: number
        existingItemId?: string
      }>
    },
    userId: string
  ): Promise<TemplateWithItems> {
    // Update template basic info
    await this.updateTemplate(
      templateId,
      {
        name: input.name,
        description: input.description ?? null,
        cover_image_url: input.cover_image_url ?? null,
        is_public: input.is_public ?? true,
      },
      userId
    )

    // Update category relationship
    // Delete existing category relationships
    await this.supabase
      .from('template_categories')
      .delete()
      .eq('template_id', templateId)

    // Create new category relationship
    if (input.category_id) {
      const { error: categoryError } = await this.supabase
        .from('template_categories')
        .insert({
          template_id: templateId,
          category_id: input.category_id,
        } as any)

      if (categoryError) throw categoryError
    }

    // Update items - delete all and recreate
    // First, delete all existing items
    await this.supabase
      .from('template_items')
      .delete()
      .eq('template_id', templateId)

    // Then insert all items (both existing and new)
    if (input.items.length > 0) {
      const itemsToInsert = input.items.map((item) => ({
        template_id: templateId,
        name: item.name,
        image_url: item.image_url,
        order: item.order,
      }))

      const { error: itemsError } = await this.supabase
        .from('template_items')
        .insert(itemsToInsert as any)

      if (itemsError) throw itemsError
    }

    // Return updated template with items
    return await this.getTemplateById(templateId) as TemplateWithItems
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
   * Get all categories with template count
   */
  async getCategoriesWithCount(): Promise<Array<{ category: string; count: number; category_id?: string }>> {
    // Get categories with template count using template_categories
    const { data, error } = await this.supabase
      .from('categories')
      .select(`
        id,
        name,
        slug,
        template_categories(template_id)
      `)
      .order('name', { ascending: true })

    if (error) {
      // If categories table doesn't exist, return empty array
      if (error.code === '42P01') {
        return []
      }
      throw error
    }

    // Count templates per category
    return (data || []).map((cat: any) => {
      const templateCount = cat.template_categories?.length || 0
      // Only return categories that have at least one public template
      return {
        category: cat.name,
        category_id: cat.id,
        count: templateCount,
      }
    }).filter((cat) => cat.count > 0)
      .sort((a, b) => b.count - a.count)
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

