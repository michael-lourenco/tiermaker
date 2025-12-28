import { createClient } from '@/lib/supabase/client'
import type { SupabaseClient } from '@supabase/supabase-js'
import type {
  AdSpace,
  CreateAdSpaceInput,
  UpdateAdSpaceInput,
  AdSpaceDeviceType,
} from '@/types/adSpace.types'

export class AdSpaceService {
  private supabase: any

  constructor(supabase?: any) {
    this.supabase = supabase || createClient()
  }

  /**
   * Get ad space by position and device type
   */
  async getAdSpaceByPosition(
    position: string,
    deviceType: AdSpaceDeviceType = 'all'
  ): Promise<AdSpace | null> {
    // First try to get space for specific device type
    let { data, error } = await this.supabase
      .from('ad_spaces')
      .select('*')
      .eq('position', position)
      .eq('is_active', true)
      .eq('device_type', deviceType)
      .order('priority', { ascending: false })
      .limit(1)
      .maybeSingle()

    // If not found and deviceType is not 'all', try to get 'all' device type
    if (!data && deviceType !== 'all') {
      const { data: allData, error: allError } = await this.supabase
        .from('ad_spaces')
        .select('*')
        .eq('position', position)
        .eq('is_active', true)
        .eq('device_type', 'all')
        .order('priority', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (allError) {
        return null
      }

      data = allData
    }

    if (error || !data) {
      return null
    }

    return data as AdSpace
  }

  /**
   * Get all ad spaces
   */
  async getAllAdSpaces(): Promise<AdSpace[]> {
    const { data, error } = await this.supabase
      .from('ad_spaces')
      .select('*')
      .order('position', { ascending: true })
      .order('priority', { ascending: false })

    if (error) {
      // If table doesn't exist, return empty array
      if (error.code === '42P01') {
        return []
      }
      throw error
    }

    return (data || []) as AdSpace[]
  }

  /**
   * Get ad space by ID
   */
  async getAdSpaceById(id: string): Promise<AdSpace | null> {
    const { data, error } = await this.supabase
      .from('ad_spaces')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      throw error
    }

    return data as AdSpace
  }

  /**
   * Create a new ad space
   */
  async createAdSpace(input: CreateAdSpaceInput): Promise<AdSpace> {
    const { data, error } = await this.supabase
      .from('ad_spaces')
      .insert({
        name: input.name,
        position: input.position,
        device_type: input.device_type || 'all',
        ad_type: input.ad_type,
        manual_image_url: input.manual_image_url ?? null,
        manual_link_url: input.manual_link_url ?? null,
        manual_alt_text: input.manual_alt_text ?? null,
        google_ad_client: input.google_ad_client ?? null,
        google_ad_slot: input.google_ad_slot ?? null,
        google_ad_format: input.google_ad_format ?? null,
        is_active: input.is_active ?? true,
        priority: input.priority ?? 0,
      } as any)
      .select()
      .single()

    if (error) {
      throw error
    }

    return data as AdSpace
  }

  /**
   * Update an ad space
   */
  async updateAdSpace(id: string, input: UpdateAdSpaceInput): Promise<AdSpace> {
    const updateData: any = {}

    if (input.name !== undefined) updateData.name = input.name
    if (input.position !== undefined) updateData.position = input.position
    if (input.device_type !== undefined) updateData.device_type = input.device_type
    if (input.ad_type !== undefined) updateData.ad_type = input.ad_type
    if (input.manual_image_url !== undefined) updateData.manual_image_url = input.manual_image_url
    if (input.manual_link_url !== undefined) updateData.manual_link_url = input.manual_link_url
    if (input.manual_alt_text !== undefined) updateData.manual_alt_text = input.manual_alt_text
    if (input.google_ad_client !== undefined) updateData.google_ad_client = input.google_ad_client
    if (input.google_ad_slot !== undefined) updateData.google_ad_slot = input.google_ad_slot
    if (input.google_ad_format !== undefined) updateData.google_ad_format = input.google_ad_format
    if (input.is_active !== undefined) updateData.is_active = input.is_active
    if (input.priority !== undefined) updateData.priority = input.priority

    const { data, error } = await this.supabase
      .from('ad_spaces')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw error
    }

    return data as AdSpace
  }

  /**
   * Delete an ad space
   */
  async deleteAdSpace(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('ad_spaces')
      .delete()
      .eq('id', id)

    if (error) {
      throw error
    }
  }

  /**
   * Toggle ad space active status
   */
  async toggleAdSpaceActive(id: string): Promise<AdSpace> {
    const space = await this.getAdSpaceById(id)
    if (!space) {
      throw new Error('Ad space not found')
    }

    return this.updateAdSpace(id, { is_active: !space.is_active })
  }
}


