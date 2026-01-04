/**
 * Subscription Limit Service
 * Serviço para gerenciar limites de assinatura
 */

import { createServiceRoleClient } from '@/lib/supabase/server'
import { getLimitsForPlan, isWithinLimit, hasReachedLimit } from '@/lib/subscription/limits'
import type {
  SubscriptionLimit,
  SubscriptionLimitType,
  CreateSubscriptionLimitInput,
  UpdateSubscriptionLimitInput,
} from '@/types/subscription.types'
import { SubscriptionService } from './subscription.service'

export class SubscriptionLimitService {
  private supabase: any
  private subscriptionService: SubscriptionService

  constructor(supabaseClient?: any) {
    // Usar service role client para bypass RLS
    this.supabase = supabaseClient || createServiceRoleClient()
    this.subscriptionService = new SubscriptionService(this.supabase)
  }

  /**
   * Obter limite do usuário
   */
  async getLimit(
    userId: string,
    limitType: SubscriptionLimitType
  ): Promise<SubscriptionLimit | null> {
    const result = (await this.supabase
      .from('subscription_limits')
      .select('*')
      .eq('user_id', userId)
      .eq('limit_type', limitType)
      .single()) as { data: SubscriptionLimit | null; error: any }

    if (result.error) {
      if (result.error.code === 'PGRST116') {
        return null
      }
      throw result.error
    }

    return result.data
  }

  /**
   * Obter todos os limites do usuário
   */
  async getUserLimits(userId: string): Promise<SubscriptionLimit[]> {
    const result = (await this.supabase
      .from('subscription_limits')
      .select('*')
      .eq('user_id', userId)) as { data: SubscriptionLimit[] | null; error: any }

    if (result.error) throw result.error
    return result.data || []
  }

  /**
   * Inicializar limites do usuário baseado no plano
   */
  async initializeUserLimits(userId: string): Promise<void> {
    // Verificar se usuário tem assinatura premium
    const isPremium = await this.subscriptionService.isUserPremium(userId)
    const planType = isPremium ? 'premium' : 'basic'
    const limits = getLimitsForPlan(planType)

    // Criar ou atualizar limites
    for (const [limitType, maxCount] of Object.entries(limits)) {
      await this.upsertLimit(userId, limitType as SubscriptionLimitType, maxCount)
    }
  }

  /**
   * Criar ou atualizar limite
   */
  async upsertLimit(
    userId: string,
    limitType: SubscriptionLimitType,
    maxCount: number,
    currentCount?: number
  ): Promise<SubscriptionLimit> {
    const existing = await this.getLimit(userId, limitType)

    if (existing) {
      // Atualizar limite existente
      const updateData: any = { max_count: maxCount }
      if (currentCount !== undefined) updateData.current_count = currentCount

      const result = (await this.supabase
        .from('subscription_limits')
        .update(updateData)
        .eq('id', existing.id)
        .select()
        .single()) as { data: SubscriptionLimit | null; error: any }

      if (result.error) throw result.error
      if (!result.data) throw new Error('Failed to update subscription limit')

      return result.data
    } else {
      // Criar novo limite
      const result = (await this.supabase
        .from('subscription_limits')
        .insert({
          user_id: userId,
          limit_type: limitType,
          current_count: currentCount ?? 0,
          max_count: maxCount,
        } as any)
        .select()
        .single()) as { data: SubscriptionLimit | null; error: any }

      if (result.error) throw result.error
      if (!result.data) throw new Error('Failed to create subscription limit')

      return result.data
    }
  }

  /**
   * Incrementar contador de limite
   */
  async incrementLimit(userId: string, limitType: SubscriptionLimitType): Promise<void> {
    const limit = await this.getLimit(userId, limitType)
    if (!limit) {
      // Se limite não existe, inicializar primeiro
      await this.initializeUserLimits(userId)
      const newLimit = await this.getLimit(userId, limitType)
      if (!newLimit) throw new Error('Failed to initialize limit')
    }

    const currentLimit = await this.getLimit(userId, limitType)
    if (!currentLimit) throw new Error('Limit not found')

    // Verificar se está dentro do limite antes de incrementar
    if (!isWithinLimit(currentLimit.current_count, currentLimit.max_count)) {
      throw new Error(`Limit reached for ${limitType}`)
    }

    await this.upsertLimit(
      userId,
      limitType,
      currentLimit.max_count,
      currentLimit.current_count + 1
    )
  }

  /**
   * Decrementar contador de limite
   */
  async decrementLimit(userId: string, limitType: SubscriptionLimitType): Promise<void> {
    const limit = await this.getLimit(userId, limitType)
    if (!limit) return // Se não existe, não há nada para decrementar

    const newCount = Math.max(0, limit.current_count - 1)
    await this.upsertLimit(userId, limitType, limit.max_count, newCount)
  }

  /**
   * Verificar se usuário pode executar ação (dentro do limite)
   */
  async canPerformAction(userId: string, limitType: SubscriptionLimitType): Promise<boolean> {
    await this.ensureLimitsInitialized(userId)
    const limit = await this.getLimit(userId, limitType)
    if (!limit) return false

    return isWithinLimit(limit.current_count, limit.max_count)
  }

  /**
   * Verificar se usuário atingiu o limite
   */
  async hasReachedLimit(userId: string, limitType: SubscriptionLimitType): Promise<boolean> {
    await this.ensureLimitsInitialized(userId)
    const limit = await this.getLimit(userId, limitType)
    if (!limit) return true // Se não existe, considerar como limite atingido

    return hasReachedLimit(limit.current_count, limit.max_count)
  }

  /**
   * Garantir que limites estão inicializados
   */
  async ensureLimitsInitialized(userId: string): Promise<void> {
    const limits = await this.getUserLimits(userId)
    if (limits.length === 0) {
      await this.initializeUserLimits(userId)
    }
  }

  /**
   * Atualizar limites quando assinatura muda
   */
  async updateLimitsForSubscription(userId: string): Promise<void> {
    await this.initializeUserLimits(userId)
  }
}
