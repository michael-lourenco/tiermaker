export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      templates: {
        Row: {
          id: string
          user_id: string | null
          name: string
          description: string | null
          category: string
          tags: string[] | null
          is_public: boolean
          views_count: number
          likes_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          name: string
          description?: string | null
          category: string
          tags?: string[] | null
          is_public?: boolean
          views_count?: number
          likes_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          name?: string
          description?: string | null
          category?: string
          tags?: string[] | null
          is_public?: boolean
          views_count?: number
          likes_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      template_items: {
        Row: {
          id: string
          template_id: string
          name: string
          image_url: string
          order: number
          created_at: string
        }
        Insert: {
          id?: string
          template_id: string
          name: string
          image_url: string
          order: number
          created_at?: string
        }
        Update: {
          id?: string
          template_id?: string
          name?: string
          image_url?: string
          order?: number
          created_at?: string
        }
      }
      tier_lists: {
        Row: {
          id: string
          user_id: string | null
          template_id: string
          title: string
          is_public: boolean
          share_token: string | null
          views_count: number
          likes_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          template_id: string
          title: string
          is_public?: boolean
          share_token?: string | null
          views_count?: number
          likes_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          template_id?: string
          title?: string
          is_public?: boolean
          share_token?: string | null
          views_count?: number
          likes_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      tier_list_items: {
        Row: {
          id: string
          tier_list_id: string
          template_item_id: string
          tier_name: string
          order: number
          created_at: string
        }
        Insert: {
          id?: string
          tier_list_id: string
          template_item_id: string
          tier_name: string
          order: number
          created_at?: string
        }
        Update: {
          id?: string
          tier_list_id?: string
          template_item_id?: string
          tier_name?: string
          order?: number
          created_at?: string
        }
      }
      tier_list_tiers: {
        Row: {
          id: string
          tier_list_id: string
          tier_name: string
          tier_order: number
          color: string | null
          created_at: string
        }
        Insert: {
          id?: string
          tier_list_id: string
          tier_name: string
          tier_order: number
          color?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          tier_list_id?: string
          tier_name?: string
          tier_order?: number
          color?: string | null
          created_at?: string
        }
      }
      likes: {
        Row: {
          id: string
          user_id: string
          tier_list_id: string | null
          template_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          tier_list_id?: string | null
          template_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          tier_list_id?: string | null
          template_id?: string | null
          created_at?: string
        }
      }
      comments: {
        Row: {
          id: string
          user_id: string
          tier_list_id: string
          content: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          tier_list_id: string
          content: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          tier_list_id?: string
          content?: string
          created_at?: string
          updated_at?: string
        }
      }
      user_preferences: {
        Row: {
          user_id: string
          show_item_names: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          show_item_names?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          show_item_names?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}


