import { createClient } from '@/lib/supabase/client'
import type { Template, TemplateItem, TemplateWithItems, CreateTemplateInput } from '@/types/template.types'

export class TemplateService {
  private supabase = createClient()

  /**
   * Get all public templates with optional filters
   */
  async getPublicTemplates(filters?: {
    category?: string
    search?: string
    limit?: number
    offset?: number
  }): Promise<Template[]> {
    let query = this.supabase
      .from('templates')
      .select('*')
      .eq('is_public', true)
      .order('created_at', { ascending: false })

    if (filters?.category) {
      query = query.eq('category', filters.category)
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
    return data || []
  }

  /**
   * Get template by ID with items
   */
  async getTemplateById(id: string): Promise<TemplateWithItems | null> {
    const { data: template, error: templateError } = await this.supabase
      .from('templates')
      .select('*')
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

    return {
      ...(template as Template),
      items: items || [],
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
   * Create a new template
   */
  async createTemplate(input: CreateTemplateInput, userId: string): Promise<TemplateWithItems> {
    // Create template
    const result = (await this.supabase
      .from('templates')
      .insert({
        user_id: userId,
        name: input.name,
        description: input.description ?? null,
        category: input.category,
        tags: input.tags ?? null,
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

