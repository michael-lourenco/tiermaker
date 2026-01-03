/**
 * Subscription Types
 * Tipos TypeScript para o sistema de assinaturas premium
 */

export type SubscriptionStatus =
  | 'active'
  | 'canceled'
  | 'past_due'
  | 'incomplete'
  | 'trialing'

export type PlanType = 'basic' | 'premium'

export type SubscriptionInterval = 'month' | 'year'

export interface Subscription {
  id: string
  user_id: string
  stripe_subscription_id: string
  stripe_customer_id: string
  status: SubscriptionStatus
  plan_type: PlanType
  currency: string
  amount: number // em centavos
  interval: SubscriptionInterval
  current_period_start: string
  current_period_end: string
  cancel_at_period_end: boolean
  created_at: string
  updated_at: string
}

export interface SubscriptionLimit {
  id: string
  user_id: string
  limit_type: SubscriptionLimitType
  current_count: number
  max_count: number
  updated_at: string
}

export type SubscriptionLimitType =
  | 'tier_lists_count'
  | 'private_tier_lists_count'

export interface SubscriptionEvent {
  id: string
  stripe_event_id: string | null
  event_type: string
  subscription_id: string | null
  user_id: string | null
  payload: Record<string, any>
  processed: boolean
  created_at: string
}

export interface CreateSubscriptionInput {
  user_id: string
  stripe_subscription_id: string
  stripe_customer_id: string
  status: SubscriptionStatus
  plan_type: PlanType
  currency: string
  amount: number
  interval: SubscriptionInterval
  current_period_start: Date
  current_period_end: Date
  cancel_at_period_end?: boolean
}

export interface UpdateSubscriptionInput {
  status?: SubscriptionStatus
  plan_type?: PlanType
  currency?: string
  amount?: number
  interval?: SubscriptionInterval
  current_period_start?: Date
  current_period_end?: Date
  cancel_at_period_end?: boolean
}

export interface CreateSubscriptionLimitInput {
  user_id: string
  limit_type: SubscriptionLimitType
  current_count?: number
  max_count: number
}

export interface UpdateSubscriptionLimitInput {
  current_count?: number
  max_count?: number
}
