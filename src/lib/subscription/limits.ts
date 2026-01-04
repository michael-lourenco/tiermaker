/**
 * Subscription Limits Constants
 * Constantes para limites de assinatura
 */

import type { SubscriptionLimitType, PlanType } from '@/types/subscription.types'

/**
 * Limites do plano básico (gratuito)
 */
export const BASIC_PLAN_LIMITS: Record<SubscriptionLimitType, number> = {
  tier_lists_count: 5, // 5 tier lists salvas
  private_tier_lists_count: 0, // 0 tier lists privadas (apenas premium)
  templates_count: 3, // 3 templates criados
}

/**
 * Limites do plano premium (ilimitado = -1)
 */
export const PREMIUM_PLAN_LIMITS: Record<SubscriptionLimitType, number> = {
  tier_lists_count: -1, // Ilimitado
  private_tier_lists_count: -1, // Ilimitado
  templates_count: -1, // Ilimitado
}

/**
 * Obter limites baseado no tipo de plano
 */
export function getLimitsForPlan(planType: PlanType): Record<SubscriptionLimitType, number> {
  return planType === 'premium' ? PREMIUM_PLAN_LIMITS : BASIC_PLAN_LIMITS
}

/**
 * Verificar se um valor está dentro do limite
 * -1 significa ilimitado
 */
export function isWithinLimit(current: number, limit: number): boolean {
  if (limit === -1) return true // Ilimitado
  return current < limit
}

/**
 * Verificar se um valor atingiu o limite
 */
export function hasReachedLimit(current: number, limit: number): boolean {
  if (limit === -1) return false // Ilimitado nunca atinge limite
  return current >= limit
}
