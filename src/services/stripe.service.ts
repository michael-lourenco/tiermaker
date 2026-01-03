/**
 * Stripe Service
 * Serviço para integração com Stripe
 */

import { stripe } from '@/lib/stripe/client'
import { getStripePriceIds, getPriceIdByInterval } from '@/lib/stripe/prices'
import type { SubscriptionInterval } from '@/types/subscription.types'
import Stripe from 'stripe'

export class StripeService {
  /**
   * Criar sessão de checkout
   */
  async createCheckoutSession(
    userId: string,
    userEmail: string,
    interval: SubscriptionInterval,
    successUrl: string,
    cancelUrl: string
  ): Promise<Stripe.Checkout.Session> {
    const priceId = getPriceIdByInterval(interval)

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer_email: userEmail,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        user_id: userId,
      },
      subscription_data: {
        metadata: {
          user_id: userId,
        },
      },
    })

    return session
  }

  /**
   * Criar customer portal session (para gerenciar/cancelar assinatura)
   */
  async createPortalSession(
    customerId: string,
    returnUrl: string
  ): Promise<Stripe.BillingPortal.Session> {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    })

    return session
  }

  /**
   * Obter subscription do Stripe
   */
  async getSubscription(stripeSubscriptionId: string): Promise<Stripe.Subscription> {
    return stripe.subscriptions.retrieve(stripeSubscriptionId)
  }

  /**
   * Obter customer do Stripe
   */
  async getCustomer(stripeCustomerId: string): Promise<Stripe.Customer> {
    return stripe.customers.retrieve(stripeCustomerId) as Promise<Stripe.Customer>
  }

  /**
   * Cancelar subscription no Stripe
   */
  async cancelSubscription(
    stripeSubscriptionId: string,
    cancelAtPeriodEnd: boolean = true
  ): Promise<Stripe.Subscription> {
    if (cancelAtPeriodEnd) {
      return stripe.subscriptions.update(stripeSubscriptionId, {
        cancel_at_period_end: true,
      })
    } else {
      return stripe.subscriptions.cancel(stripeSubscriptionId)
    }
  }

  /**
   * Verificar assinatura de webhook
   */
  constructWebhookEvent(
    payload: string | Buffer,
    signature: string,
    webhookSecret: string
  ): Stripe.Event {
    return stripe.webhooks.constructEvent(payload, signature, webhookSecret)
  }
}
