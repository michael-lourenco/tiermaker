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
    const isOneTime = options.interval === 'once'

    const metadata = {
      type: 'donation',
      interval: options.interval,
      ...(options.userId ? { user_id: options.userId } : {}),
    }

    const session = await stripe.checkout.sessions.create({
      mode: isOneTime ? 'payment' : 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: options.successUrl,
      cancel_url: options.cancelUrl,
      customer_email: options.customerEmail,
      metadata,
      ...(isOneTime
        ? {}
        : {
            subscription_data: { metadata },
          }),
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
