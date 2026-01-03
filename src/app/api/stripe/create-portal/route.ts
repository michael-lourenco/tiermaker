/**
 * Create Customer Portal Session Route
 * Cria sessão do customer portal do Stripe para gerenciar assinatura
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { StripeService } from '@/services/stripe.service'
import { SubscriptionService } from '@/services/subscription.service'

const stripeService = new StripeService()
const subscriptionService = new SubscriptionService()

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Obter subscription do usuário
    const subscription = await subscriptionService.getSubscriptionByUserId(user.id)
    if (!subscription) {
      return NextResponse.json({ error: 'No subscription found' }, { status: 404 })
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const returnUrl = `${baseUrl}/account/subscription`

    const portalSession = await stripeService.createPortalSession(
      subscription.stripe_customer_id,
      returnUrl
    )

    return NextResponse.json({ url: portalSession.url })
  } catch (error: any) {
    console.error('Create portal error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
