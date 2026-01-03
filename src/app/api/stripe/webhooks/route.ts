/**
 * Stripe Webhook Route
 * Processa webhooks do Stripe para sincronizar assinaturas
 */

import { NextRequest, NextResponse } from 'next/server'
import { StripeService } from '@/services/stripe.service'
import { SubscriptionService } from '@/services/subscription.service'
import { SubscriptionLimitService } from '@/services/subscriptionLimit.service'
import { headers } from 'next/headers'
import Stripe from 'stripe'

const stripeService = new StripeService()
const subscriptionService = new SubscriptionService()
const limitService = new SubscriptionLimitService()

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const headersList = await headers()
    const signature = headersList.get('stripe-signature')

    if (!signature) {
      return NextResponse.json({ error: 'No signature' }, { status: 400 })
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
    if (!webhookSecret) {
      console.error('STRIPE_WEBHOOK_SECRET is not set')
      return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })
    }

    // Verificar assinatura do webhook
    let event: Stripe.Event
    try {
      event = stripeService.constructWebhookEvent(body, signature, webhookSecret)
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message)
      return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 })
    }

    // Processar evento
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        await handleCheckoutSessionCompleted(session)
        break
      }

      case 'customer.subscription.created': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionCreated(subscription)
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionUpdated(subscription)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionDeleted(subscription)
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        await handleInvoicePaymentSucceeded(invoice)
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        await handleInvoicePaymentFailed(invoice)
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

/**
 * Handler: Checkout session completed
 */
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.user_id
  if (!userId) {
    console.error('No user_id in checkout session metadata')
    return
  }

  // Buscar subscription do Stripe
  if (session.subscription && typeof session.subscription === 'string') {
    const subscription = await stripeService.getSubscription(session.subscription)
    await syncSubscriptionFromStripe(subscription)
  }
}

/**
 * Handler: Subscription created
 */
async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  await syncSubscriptionFromStripe(subscription)
}

/**
 * Handler: Subscription updated
 */
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  await syncSubscriptionFromStripe(subscription)
}

/**
 * Handler: Subscription deleted (canceled)
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const existing = await subscriptionService.getSubscriptionByStripeId(subscription.id)
  if (existing) {
    await subscriptionService.updateSubscription(existing.id, {
      status: 'canceled',
      cancel_at_period_end: false,
    })

    // Atualizar limites para básico
    await limitService.updateLimitsForSubscription(existing.user_id)
  }
}

/**
 * Handler: Invoice payment succeeded (renovação)
 */
async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  // invoice.subscription pode ser string (ID) ou null
  // Usar type assertion porque a propriedade existe na runtime mas não está na definição de tipo
  const subscriptionId = (invoice as any).subscription as string | null | undefined
  
  if (subscriptionId && typeof subscriptionId === 'string') {
    const subscription = await stripeService.getSubscription(subscriptionId)
    await syncSubscriptionFromStripe(subscription)
  }
}

/**
 * Handler: Invoice payment failed
 */
async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  // invoice.subscription pode ser string (ID) ou null
  // Usar type assertion porque a propriedade existe na runtime mas não está na definição de tipo
  const subscriptionId = (invoice as any).subscription as string | null | undefined
  
  if (subscriptionId && typeof subscriptionId === 'string') {
    const subscription = await stripeService.getSubscription(subscriptionId)
    const existing = await subscriptionService.getSubscriptionByStripeId(subscription.id)
    
    if (existing) {
      await subscriptionService.updateSubscription(existing.id, {
        status: 'past_due',
      })
    }
  }
}

/**
 * Sincronizar subscription do Stripe para o banco
 */
async function syncSubscriptionFromStripe(stripeSubscription: Stripe.Subscription) {
  const userId = stripeSubscription.metadata?.user_id
  if (!userId) {
    console.error('No user_id in subscription metadata')
    return
  }

  const customerId = typeof stripeSubscription.customer === 'string'
    ? stripeSubscription.customer
    : stripeSubscription.customer.id

  const priceId = stripeSubscription.items.data[0]?.price.id
  if (!priceId) {
    console.error('No price ID in subscription')
    return
  }

  // Obter informações do preço
  const price = stripeSubscription.items.data[0]?.price
  const amount = price?.unit_amount || 0
  const currency = price?.currency?.toUpperCase() || 'BRL'
  const interval = price?.recurring?.interval === 'year' ? 'year' : 'month'

  // Mapear status do Stripe
  const status = mapStripeStatusToOurStatus(stripeSubscription.status)

  // Determinar tipo de plano (sempre premium para assinaturas pagas)
  const planType: 'premium' = 'premium'

  const subscriptionData = {
    user_id: userId,
    stripe_subscription_id: stripeSubscription.id,
    stripe_customer_id: customerId,
    status,
    plan_type: planType,
    currency,
    amount,
    interval: interval as 'month' | 'year',
    current_period_start: new Date((stripeSubscription as any).current_period_start * 1000),
    current_period_end: new Date((stripeSubscription as any).current_period_end * 1000),
    cancel_at_period_end: (stripeSubscription as any).cancel_at_period_end || false,
  }

  // Verificar se subscription já existe
  const existing = await subscriptionService.getSubscriptionByStripeId(stripeSubscription.id)

  if (existing) {
    // Atualizar subscription existente
    await subscriptionService.updateSubscription(existing.id, {
      status: subscriptionData.status,
      plan_type: subscriptionData.plan_type,
      currency: subscriptionData.currency,
      amount: subscriptionData.amount,
      interval: subscriptionData.interval,
      current_period_start: subscriptionData.current_period_start,
      current_period_end: subscriptionData.current_period_end,
      cancel_at_period_end: subscriptionData.cancel_at_period_end,
    })
  } else {
    // Criar nova subscription
    await subscriptionService.createSubscription(subscriptionData)
  }

  // Atualizar limites do usuário
  await limitService.updateLimitsForSubscription(userId)
}

/**
 * Mapear status do Stripe para nosso status
 */
function mapStripeStatusToOurStatus(stripeStatus: Stripe.Subscription.Status): 'active' | 'canceled' | 'past_due' | 'incomplete' | 'trialing' {
  switch (stripeStatus) {
    case 'active':
      return 'active'
    case 'canceled':
    case 'unpaid':
      return 'canceled'
    case 'past_due':
      return 'past_due'
    case 'incomplete':
    case 'incomplete_expired':
      return 'incomplete'
    case 'trialing':
      return 'trialing'
    default:
      return 'incomplete'
  }
}
