import { NextRequest, NextResponse } from 'next/server'
import { StripeService } from '@/services/stripe.service'
import type Stripe from 'stripe'

const stripeService = new StripeService()

export async function POST(request: NextRequest) {
  const signature = request.headers.get('stripe-signature')
  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
  }

  try {
    const payload = await request.text()
    const event = stripeService.constructWebhookEvent(payload, signature)

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        if (session.metadata?.type === 'donation') {
          console.info('Donation checkout completed:', session.id)
        }
        break
      }
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        if (subscription.metadata?.type === 'donation') {
          console.info(`Donation subscription ${event.type}:`, subscription.id)
        }
        break
      }
      default:
        break
    }

    return NextResponse.json({ received: true })
  } catch (error: unknown) {
    console.error('Stripe webhook error:', error)
    const message = error instanceof Error ? error.message : 'Webhook error'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
