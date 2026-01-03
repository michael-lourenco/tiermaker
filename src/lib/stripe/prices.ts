/**
 * Stripe Prices Configuration
 * IDs de preços do Stripe - devem ser configurados no Stripe Dashboard
 * 
 * NOTA: Os IDs reais devem ser obtidos após criar os produtos/preços no Stripe Dashboard
 * e armazenados em variáveis de ambiente para segurança.
 */

import type { SubscriptionInterval } from '@/types/subscription.types'

/**
 * IDs de preços do Stripe
 * Estes valores devem vir de variáveis de ambiente
 */
export interface StripePriceIds {
  premiumMonthly: string
  premiumYearly: string
}

/**
 * Obter IDs de preços do Stripe das variáveis de ambiente
 */
export function getStripePriceIds(): StripePriceIds {
  const premiumMonthly = process.env.NEXT_PUBLIC_STRIPE_PRICE_PREMIUM_MONTHLY
  const premiumYearly = process.env.NEXT_PUBLIC_STRIPE_PRICE_PREMIUM_YEARLY

  if (!premiumMonthly || !premiumYearly) {
    throw new Error(
      'Stripe price IDs not configured. Please set NEXT_PUBLIC_STRIPE_PRICE_PREMIUM_MONTHLY and NEXT_PUBLIC_STRIPE_PRICE_PREMIUM_YEARLY environment variables.'
    )
  }

  return {
    premiumMonthly,
    premiumYearly,
  }
}

/**
 * Obter ID de preço baseado no intervalo
 */
export function getPriceIdByInterval(interval: SubscriptionInterval): string {
  const priceIds = getStripePriceIds()
  return interval === 'month' ? priceIds.premiumMonthly : priceIds.premiumYearly
}

/**
 * Valores dos preços (para exibição)
 * Estes valores estão fixos, mas poderiam vir do Stripe API também
 */
export const PRICE_VALUES = {
  premiumMonthly: 990, // R$ 9,90 em centavos
  premiumYearly: 7900, // R$ 79,00 em centavos
} as const

/**
 * Converter centavos para valor formatado
 */
export function formatPrice(amountInCents: number, currency: string = 'BRL'): string {
  const value = amountInCents / 100
  const symbol = currency === 'BRL' ? 'R$' : '$'
  return `${symbol} ${value.toFixed(2).replace('.', ',')}`
}
