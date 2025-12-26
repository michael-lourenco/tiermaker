import { createClient } from '@/lib/supabase/client'
import type { Template, TemplateItem, TemplateWithItems, CreateTemplateInput } from '@/types/template.types'

export class TemplateService {
  private supabase = createClient()

  /**
   * Count how many tier lists are using a specific template
   */
  async countTierListsUsingTemplate(templateId: string): Promise<number> {
    const { count, error } = await this.supabase
      .from('tier_lists')
      .select('*', { count: 'exact', head: true })
      .eq('template_id', templateId)

    if (error) throw error
    return count || 0
  }

  /**
   * Get all public templates with optional filters
   * Filters out soft-deleted templates (deleted_at IS NULL)
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
    
    // Filter out soft-deleted templates
    query = (query as any).is('deleted_at', null)
    } else {
      // When not filtering, use regular join to get all templates with their categories
      query = this.supabase
        .from('templates')
        .select(`
          *,
          template_categories(category_id, categories(id, name, slug))
        `)
        .eq('is_public', true)
    
    // Filter out soft-deleted templates
    query = (query as any).is('deleted_at', null)
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
   * Returns template even if soft-deleted (for internal operations)
   */
  async getTemplateById(id: string, includeDeleted: boolean = false): Promise<(TemplateWithItems & { categories: Array<{ id: string; name: string; slug: string }> }) | null> {
    let query = this.supabase
      .from('templates')
      .select(`
        *,
        template_categories(category_id, categories(id, name, slug))
      `)
      .eq('id', id)
    
    // Only filter out deleted templates if includeDeleted is false
    if (!includeDeleted) {
      query = query.is('deleted_at', null)
    }
    
    const { data: template, error: templateError } = await query.single()

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
   * Get user's templates (including archived ones)
   * Returns both active and archived templates
   */
  async getUserTemplates(userId: string): Promise<Array<Template & { categories: Array<{ id: string; name: string; slug: string }>, deleted_at?: string | null }>> {
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
      return { ...template, categories } as Template & { categories: Array<{ id: string; name: string; slug: string }>, deleted_at?: string | null }
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
   * Delete template using soft delete + reference counting strategy
   * 
   * Strategy:
   * - If template has tier lists using it: Soft delete (mark as deleted, keep images)
   * - If template has no tier lists: Hard delete (delete images and record)
   * 
   * This ensures tier lists continue working even if template is deleted.
   */
  async deleteTemplate(templateId: string, userId: string): Promise<{ 
    deleted: boolean
    softDeleted: boolean
    tierListsCount: number
  }> {
    // First, fetch the template (including soft-deleted ones for validation)
    const template = await this.getTemplateById(templateId, true)
    
    if (!template) {
      throw new Error('Template not found')
    }

    // Verify ownership
    if (template.user_id !== userId) {
      throw new Error('Unauthorized: You can only delete your own templates')
    }

    // Check if template is already soft-deleted
    if ((template as any).deleted_at) {
      throw new Error('Template is already deleted')
    }

    // Count how many tier lists are using this template (Solution B: Reference Counting)
    const tierListsCount = await this.countTierListsUsingTemplate(templateId)

    // Solution A: Soft Delete if template is being used
    if (tierListsCount > 0) {
      // Soft delete: Mark as deleted but keep images and allow tier lists to continue working
      const supabase = this.supabase as any
      const { error } = await supabase
        .from('templates')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', templateId)
        .eq('user_id', userId)

      if (error) throw error

      return {
        deleted: true,
        softDeleted: true,
        tierListsCount,
      }
    }

    // Hard delete: No tier lists using it, safe to delete images and record
    const imageUrls: string[] = []

    // Add cover image if exists
    if (template.cover_image_url) {
      imageUrls.push(template.cover_image_url)
    }

    // Add all item images
    if (template.items && template.items.length > 0) {
      template.items.forEach((item) => {
        if (item.image_url) {
          imageUrls.push(item.image_url)
        }
      })
    }

    // Delete images from S3 via API route (server-side)
    if (imageUrls.length > 0) {
      try {
        const response = await fetch('/api/delete-images', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ imageUrls }),
        })

        if (response.ok) {
          const result = await response.json()
          if (result.failed && result.failed.length > 0) {
            console.warn('Some S3 objects failed to delete:', result.failed)
            // Log but don't throw - we still want to delete the template from DB
          }
          console.log(`Deleted ${result.deleted?.length || 0} image(s) from S3`)
        } else {
          const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
          console.error('Error deleting images from S3:', errorData.error)
          // Log but don't throw - we still want to delete the template from DB
        }
      } catch (error) {
        console.error('Error calling delete-images API:', error)
        // Log but don't throw - we still want to delete the template from DB
      }
    }

    // Hard delete: Remove template from database (this will cascade delete items)
    const { error } = await this.supabase
      .from('templates')
      .delete()
      .eq('id', templateId)
      .eq('user_id', userId)

    if (error) throw error

    return {
      deleted: true,
      softDeleted: false,
      tierListsCount: 0,
    }
  }

  /**
   * Restore a soft-deleted template
   */
  async restoreTemplate(templateId: string, userId: string): Promise<Template> {
    // Verify ownership and that template is soft-deleted
    const template = await this.getTemplateById(templateId, true)
    
    if (!template) {
      throw new Error('Template not found')
    }

    if (template.user_id !== userId) {
      throw new Error('Unauthorized: You can only restore your own templates')
    }

    if (!(template as any).deleted_at) {
      throw new Error('Template is not deleted')
    }

    // Restore by setting deleted_at to NULL
    const supabase = this.supabase as any
    const { data, error } = await supabase
      .from('templates')
      .update({ deleted_at: null })
      .eq('id', templateId)
      .eq('user_id', userId)
      .select()
      .single() as { data: Template | null; error: any }

    if (error) throw error
    if (!data) throw new Error('Failed to restore template')

    return data
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

