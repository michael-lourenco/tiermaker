import { createClient } from '@/lib/supabase/client'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/types'
import type {
  TierList,
  TierListWithData,
  CreateTierListInput,
} from '@/types/tierList.types'
import { v4 as uuidv4 } from 'uuid'
import { resolveIsPublic } from '@/lib/utils/publicVisibility'

export class TierListService {
  private supabase: any

  constructor(supabaseClient?: any) {
    this.supabase = supabaseClient || createClient()
  }

  /**
   * Get tier list by ID with all data
   */
  async getTierListById(id: string): Promise<TierListWithData | null> {
    const result = await this.supabase
      .from('tier_lists')
      .select('*')
      .eq('id', id)
      .single() as { data: TierList | null; error: any }

    if (result.error) {
      // If error is PGRST116 (no rows), return null
      if (result.error.code === 'PGRST116') {
        return null
      }
      throw result.error
    }
    
    if (!result.data) return null

    const tierList = result.data

    // Get tiers
    const { data: tiers, error: tiersError } = await this.supabase
      .from('tier_list_tiers')
      .select('*')
      .eq('tier_list_id', id)
      .order('tier_order', { ascending: true })

    if (tiersError) throw tiersError

    // Get items with template items
    const { data: items, error: itemsError } = await this.supabase
      .from('tier_list_items')
      .select(`
        *,
        template_item:template_items(*)
      `)
      .eq('tier_list_id', id)
      .order('order', { ascending: true })

    if (itemsError) throw itemsError

    return {
      ...tierList,
      tiers: tiers || [],
      items: (items || []).map((item: any) => ({
        ...item,
        template_item: item.template_item,
      })),
    }
  }

  /**
   * Get tier list by share token
   */
  async getTierListByShareToken(token: string): Promise<TierListWithData | null> {
    const result = await this.supabase
      .from('tier_lists')
      .select('*')
      .eq('share_token', token)
      .single() as { data: TierList | null; error: any }

    if (result.error) throw result.error
    if (!result.data) return null

    return this.getTierListById(result.data.id)
  }

  /**
   * Get user's tier lists
   */
  async getUserTierLists(userId: string): Promise<TierList[]> {
    const { data, error } = await this.supabase
      .from('tier_lists')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  /**
   * Get public tier lists
   */
  async getPublicTierLists(limit?: number): Promise<TierList[]> {
    let query = this.supabase
      .from('tier_lists')
      .select('*, templates!inner(cover_image_url, is_public, deleted_at)')
      .eq('is_public', true)
      .eq('templates.is_public', true)
      .is('templates.deleted_at', null)
      .not('templates.cover_image_url', 'is', null)
      .neq('templates.cover_image_url', '')
      .order('created_at', { ascending: false })

    if (limit) {
      query = query.limit(limit)
    }

    const { data, error } = await query

    if (error) throw error
    return (data || []).map(({ templates: _t, ...tierList }: any) => tierList)
  }

  /**
   * Create a new tier list
   * Requires userId to be provided - tier lists must be associated with a user
   */
  async createTierList(
    input: CreateTierListInput,
    userId: string
  ): Promise<TierListWithData> {
    // Validate userId is provided
    if (!userId) {
      throw new Error('User ID is required to create a tier list')
    }

    const { data: template, error: templateError } = await this.supabase
      .from('templates')
      .select('cover_image_url')
      .eq('id', input.template_id)
      .single()

    if (templateError) throw templateError

    const shareToken = uuidv4()

    // Create tier list
    const result = (await this.supabase
      .from('tier_lists')
      .insert({
        user_id: userId,
        template_id: input.template_id,
        title: input.title,
        is_public: resolveIsPublic(input.is_public ?? false, template?.cover_image_url),
        share_token: shareToken,
      } as any)
      .select()
      .single()) as { data: TierList | null; error: any }

    if (result.error) throw result.error
    if (!result.data) throw new Error('Failed to create tier list')
    
    const tierList = result.data

    // Create tiers (only if there are tiers to insert)
    if (input.tiers && input.tiers.length > 0) {
      const tiersToInsert = input.tiers.map((tier) => ({
        tier_list_id: tierList.id,
        tier_name: tier.tier_name,
        tier_order: tier.tier_order,
        color: tier.color,
      }))

      const { error: tiersError } = await this.supabase
        .from('tier_list_tiers')
        .insert(tiersToInsert as any)

      if (tiersError) throw tiersError
    }

    // Create items
    const itemsToInsert = input.items.map((item) => ({
      tier_list_id: tierList.id,
      template_item_id: item.template_item_id,
      tier_name: item.tier_name,
      order: item.order,
    }))

    const { error: itemsError } = await this.supabase
      .from('tier_list_items')
      .insert(itemsToInsert as any)

    if (itemsError) throw itemsError

    return this.getTierListById(tierList.id) as Promise<TierListWithData>
  }

  /**
   * Update tier list
   */
  async updateTierList(
    tierListId: string,
    updates: {
      title?: string
      is_public?: boolean
      tiers?: Array<{
        id?: string
        tier_name: string
        tier_order: number
        color?: string | null
      }>
      items?: Array<{
        id?: string
        template_item_id: string
        tier_name: string
        order: number
      }>
    },
    userId?: string
  ): Promise<TierListWithData> {
    // Update tier list metadata
    if (updates.title !== undefined || updates.is_public !== undefined) {
      let isPublic = updates.is_public
      if (updates.is_public !== undefined) {
        const { data: meta } = await this.supabase
          .from('tier_lists')
          .select('template_id, templates(cover_image_url)')
          .eq('id', tierListId)
          .single()
        const templatesRel = meta?.templates
        const cover = Array.isArray(templatesRel)
          ? templatesRel[0]?.cover_image_url
          : templatesRel?.cover_image_url
        isPublic = resolveIsPublic(updates.is_public, cover)
      }

      const supabase = this.supabase as any
      const { error } = await supabase
        .from('tier_lists')
        .update({
          ...(updates.title !== undefined ? { title: updates.title } : {}),
          ...(updates.is_public !== undefined ? { is_public: isPublic } : {}),
        })
        .eq('id', tierListId)
        .eq('user_id', userId || null)

      if (error) throw error
    }

    // Update tiers if provided
    if (updates.tiers) {
      // Delete existing tiers
      await this.supabase
        .from('tier_list_tiers')
        .delete()
        .eq('tier_list_id', tierListId)

      // Insert new tiers
      const tiersToInsert = updates.tiers.map((tier) => ({
        tier_list_id: tierListId,
        tier_name: tier.tier_name,
        tier_order: tier.tier_order,
        color: tier.color,
      }))

      const { error } = await this.supabase
        .from('tier_list_tiers')
        .insert(tiersToInsert as any)

      if (error) throw error
    }

    // Update items if provided
    if (updates.items) {
      // Delete existing items
      await this.supabase
        .from('tier_list_items')
        .delete()
        .eq('tier_list_id', tierListId)

      // Insert new items
      const itemsToInsert = updates.items.map((item) => ({
        tier_list_id: tierListId,
        template_item_id: item.template_item_id,
        tier_name: item.tier_name,
        order: item.order,
      }))

      const { error } = await this.supabase
        .from('tier_list_items')
        .insert(itemsToInsert as any)

      if (error) throw error
    }

    return this.getTierListById(tierListId) as Promise<TierListWithData>
  }

  /**
   * Delete tier list
   */
  async deleteTierList(tierListId: string, userId?: string): Promise<void> {
    const supabase = this.supabase as any
    let query = supabase
      .from('tier_lists')
      .delete()
      .eq('id', tierListId)
    
    if (userId !== undefined) {
      query = query.eq('user_id', userId)
    } else {
      query = query.is('user_id', null)
    }
    
    const { error } = await query

    if (error) throw error
  }

  /**
   * Increment views count
   * 
   * @deprecated Use the new views tracking system via useViewTracking hook instead.
   * This method is kept for backward compatibility but should not be used in new code.
   * The new system provides:
   * - 30-minute minimum interval between views
   * - Full audit trail
   * - Support for authenticated and anonymous users
   * 
   * New code should use: useViewTracking('tier_list', tierListId)
   */
  async incrementViews(tierListId: string): Promise<void> {
    const supabase = this.supabase as any
    const { data } = await supabase
      .from('tier_lists')
      .select('views_count')
      .eq('id', tierListId)
      .single()

    if (data) {
      await supabase
        .from('tier_lists')
        .update({ views_count: data.views_count + 1 })
        .eq('id', tierListId)
    }
  }
}

