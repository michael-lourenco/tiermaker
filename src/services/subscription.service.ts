/**
 * Subscription Service
 * Serviço para gerenciar assinaturas premium
 */

import { createServiceRoleClient } from '@/lib/supabase/server'
import type {
  Subscription,
  CreateSubscriptionInput,
  UpdateSubscriptionInput,
} from '@/types/subscription.types'

export class SubscriptionService {
  private supabase: any

  constructor(supabaseClient?: any) {
    // Usar service role client para bypass RLS (necessário para webhooks)
    this.supabase = supabaseClient || createServiceRoleClient()
  }

  /**
   * Criar nova assinatura
   */
  async createSubscription(input: CreateSubscriptionInput): Promise<Subscription> {
    const result = (await this.supabase
      .from('subscriptions')
      .insert({
        user_id: input.user_id,
        stripe_subscription_id: input.stripe_subscription_id,
        stripe_customer_id: input.stripe_customer_id,
        status: input.status,
        plan_type: input.plan_type,
        currency: input.currency,
        amount: input.amount,
        interval: input.interval,
        current_period_start: input.current_period_start.toISOString(),
        current_period_end: input.current_period_end.toISOString(),
        cancel_at_period_end: input.cancel_at_period_end ?? false,
      } as any)
      .select()
      .single()) as { data: Subscription | null; error: any }

    if (result.error) throw result.error
    if (!result.data) throw new Error('Failed to create subscription')

    return result.data
  }

  /**
   * Obter assinatura por ID
   */
  async getSubscriptionById(id: string): Promise<Subscription | null> {
    const result = (await this.supabase
      .from('subscriptions')
      .select('*')
      .eq('id', id)
      .single()) as { data: Subscription | null; error: any }

    if (result.error) {
      if (result.error.code === 'PGRST116') {
        return null
      }
      throw result.error
    }

    return result.data
  }

  /**
   * Obter assinatura por Stripe subscription ID
   */
  async getSubscriptionByStripeId(stripeSubscriptionId: string): Promise<Subscription | null> {
    const result = (await this.supabase
      .from('subscriptions')
      .select('*')
      .eq('stripe_subscription_id', stripeSubscriptionId)
      .single()) as { data: Subscription | null; error: any }

    if (result.error) {
      if (result.error.code === 'PGRST116') {
        return null
      }
      throw result.error
    }

    return result.data
  }

  /**
   * Obter assinatura ativa do usuário
   */
  async getActiveSubscriptionByUserId(userId: string): Promise<Subscription | null> {
    const result = (await this.supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()) as { data: Subscription | null; error: any }

    if (result.error) throw result.error
    return result.data
  }

  /**
   * Obter assinatura do usuário (ativa ou não)
   */
  async getSubscriptionByUserId(userId: string): Promise<Subscription | null> {
    const result = (await this.supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()) as { data: Subscription | null; error: any }

    if (result.error) throw result.error
    return result.data
  }

  /**
   * Atualizar assinatura
   */
  async updateSubscription(
    id: string,
    updates: UpdateSubscriptionInput
  ): Promise<Subscription> {
    const updateData: any = {}

    if (updates.status !== undefined) updateData.status = updates.status
    if (updates.plan_type !== undefined) updateData.plan_type = updates.plan_type
    if (updates.currency !== undefined) updateData.currency = updates.currency
    if (updates.amount !== undefined) updateData.amount = updates.amount
    if (updates.interval !== undefined) updateData.interval = updates.interval
    if (updates.current_period_start !== undefined)
      updateData.current_period_start = updates.current_period_start.toISOString()
    if (updates.current_period_end !== undefined)
      updateData.current_period_end = updates.current_period_end.toISOString()
    if (updates.cancel_at_period_end !== undefined)
      updateData.cancel_at_period_end = updates.cancel_at_period_end

    const result = (await this.supabase
      .from('subscriptions')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()) as { data: Subscription | null; error: any }

    if (result.error) throw result.error
    if (!result.data) throw new Error('Failed to update subscription')

    return result.data
  }

  /**
   * Atualizar assinatura por Stripe subscription ID
   */
  async updateSubscriptionByStripeId(
    stripeSubscriptionId: string,
    updates: UpdateSubscriptionInput
  ): Promise<Subscription> {
    const subscription = await this.getSubscriptionByStripeId(stripeSubscriptionId)
    if (!subscription) {
      throw new Error(`Subscription not found: ${stripeSubscriptionId}`)
    }

    return this.updateSubscription(subscription.id, updates)
  }

  /**
   * Cancelar assinatura
   */
  async cancelSubscription(id: string, cancelAtPeriodEnd: boolean = true): Promise<Subscription> {
    return this.updateSubscription(id, {
      status: 'canceled',
      cancel_at_period_end: cancelAtPeriodEnd,
    })
  }

  /**
   * Verificar se usuário tem assinatura premium ativa
   */
  async isUserPremium(userId: string): Promise<boolean> {
    const subscription = await this.getActiveSubscriptionByUserId(userId)
    return subscription?.plan_type === 'premium' && subscription?.status === 'active'
  }
}
