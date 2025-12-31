import { createClient } from '@/lib/supabase/client'
import type { SupabaseClient } from '@supabase/supabase-js'
import type {
  UserPreferences,
  CreateUserPreferencesInput,
  UpdateUserPreferencesInput,
} from '@/types/userPreferences.types'

export class UserPreferencesService {
  private supabase: any

  constructor(supabaseClient?: any) {
    this.supabase = supabaseClient || createClient()
  }

  /**
   * Get user preferences by user ID
   * Returns default preferences if not found
   */
  async getUserPreferences(userId: string): Promise<UserPreferences> {
    const { data, error } = await this.supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) {
      // If not found, return default preferences
      if (error.code === 'PGRST116') {
        return {
          user_id: userId,
          show_item_names: false, // Default: hide names
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      }
      throw error
    }

    return data
  }

  /**
   * Create or update user preferences
   * Uses upsert to create if not exists, update if exists
   */
  async upsertUserPreferences(
    userId: string,
    input: UpdateUserPreferencesInput
  ): Promise<UserPreferences> {
    const { data, error } = await this.supabase
      .from('user_preferences')
      .upsert(
        {
          user_id: userId,
          ...input,
        },
        {
          onConflict: 'user_id',
        }
      )
      .select()
      .single()

    if (error) throw error
    return data
  }

  /**
   * Update user preferences
   */
  async updateUserPreferences(
    userId: string,
    input: UpdateUserPreferencesInput
  ): Promise<UserPreferences> {
    const { data, error } = await this.supabase
      .from('user_preferences')
      .update(input)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      // If not found, create it
      if (error.code === 'PGRST116') {
        return this.upsertUserPreferences(userId, input)
      }
      throw error
    }

    return data
  }

  /**
   * Get show_item_names preference for a user
   * Returns false (hide names) by default if not found
   */
  async getShowItemNames(userId: string): Promise<boolean> {
    const preferences = await this.getUserPreferences(userId)
    return preferences.show_item_names ?? false
  }

  /**
   * Update show_item_names preference for a user
   */
  async setShowItemNames(userId: string, show: boolean): Promise<UserPreferences> {
    return this.updateUserPreferences(userId, { show_item_names: show })
  }
}
