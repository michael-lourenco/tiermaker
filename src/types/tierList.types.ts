import { TemplateItem } from './template.types'

export interface TierList {
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

export interface TierListItem {
  id: string
  tier_list_id: string
  template_item_id: string
  tier_name: string
  order: number
  created_at: string
}

export interface TierListTier {
  id: string
  tier_list_id: string
  tier_name: string
  tier_order: number
  color: string | null
  created_at: string
}

export interface TierListWithData extends TierList {
  tiers: TierListTier[]
  items: (TierListItem & {
    template_item: TemplateItem
  })[]
}

export interface CreateTierListInput {
  template_id: string
  title: string
  is_public?: boolean
  tiers: Omit<TierListTier, 'id' | 'tier_list_id' | 'created_at'>[]
  items: Omit<TierListItem, 'id' | 'tier_list_id' | 'created_at'>[]
}


