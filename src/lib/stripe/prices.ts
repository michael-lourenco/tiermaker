export type DonationInterval = 'month' | 'year'

export function getDonationPriceIds() {
  const monthly = process.env.NEXT_PUBLIC_STRIPE_PRICE_PREMIUM_MONTHLY
  const yearly = process.env.NEXT_PUBLIC_STRIPE_PRICE_PREMIUM_YEARLY

  if (!monthly || !yearly) {
    throw new Error(
      'NEXT_PUBLIC_STRIPE_PRICE_PREMIUM_MONTHLY and NEXT_PUBLIC_STRIPE_PRICE_PREMIUM_YEARLY must be configured'
    )
  }

  return { monthly, yearly }
}

export function getDonationPriceId(interval: DonationInterval): string {
  const ids = getDonationPriceIds()
  return interval === 'month' ? ids.monthly : ids.yearly
}

/** Valores de exibição em centavos (BRL) */
export const DONATION_DISPLAY_VALUES = {
  monthly: 990,
  yearly: 7900,
} as const

export function formatDonationPrice(cents: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(cents / 100)
}
