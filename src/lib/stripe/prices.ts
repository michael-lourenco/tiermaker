export type DonationInterval = 'once' | 'month' | 'year'

export function getDonationPriceIds() {
  const once = process.env.NEXT_PUBLIC_STRIPE_PRICE_DONATION_ONCE
  const monthly = process.env.NEXT_PUBLIC_STRIPE_PRICE_PREMIUM_MONTHLY
  const yearly = process.env.NEXT_PUBLIC_STRIPE_PRICE_PREMIUM_YEARLY

  if (!once || !monthly || !yearly) {
    throw new Error(
      'NEXT_PUBLIC_STRIPE_PRICE_DONATION_ONCE, NEXT_PUBLIC_STRIPE_PRICE_PREMIUM_MONTHLY and NEXT_PUBLIC_STRIPE_PRICE_PREMIUM_YEARLY must be configured'
    )
  }

  return { once, monthly, yearly }
}

export function getDonationPriceId(interval: DonationInterval): string {
  const ids = getDonationPriceIds()
  if (interval === 'once') return ids.once
  if (interval === 'month') return ids.monthly
  return ids.yearly
}

/** Valores de exibição em centavos (BRL) */
export const DONATION_DISPLAY_VALUES = {
  once: 100,
  monthly: 990,
  yearly: 7900,
} as const

export function formatDonationPrice(cents: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(cents / 100)
}
