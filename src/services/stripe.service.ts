import { getStripeClient } from '@/lib/stripe/client'
import type { DonationInterval } from '@/lib/stripe/prices'
import { getDonationPriceId } from '@/lib/stripe/prices'

export class StripeService {
  async createDonationCheckoutSession(options: {
    interval: DonationInterval
    successUrl: string
    cancelUrl: string
    customerEmail?: string
    userId?: string
  }) {
    const stripe = getStripeClient()
    const priceId = getDonationPriceId(options.interval)

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: options.successUrl,
      cancel_url: options.cancelUrl,
      customer_email: options.customerEmail,
      metadata: {
        type: 'donation',
        interval: options.interval,
        ...(options.userId ? { user_id: options.userId } : {}),
      },
      subscription_data: {
        metadata: {
          type: 'donation',
          interval: options.interval,
          ...(options.userId ? { user_id: options.userId } : {}),
        },
      },
    })

    if (!session.url) {
      throw new Error('Failed to create Stripe checkout session')
    }

    return session
  }

  constructWebhookEvent(payload: string | Buffer, signature: string) {
    const stripe = getStripeClient()
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
    if (!webhookSecret) {
      throw new Error('STRIPE_WEBHOOK_SECRET is not configured')
    }
    return stripe.webhooks.constructEvent(payload, signature, webhookSecret)
  }
}
