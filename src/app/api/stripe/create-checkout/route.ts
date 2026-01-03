/**
 * Create Checkout Session Route
 * Cria sessão de checkout do Stripe
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { StripeService } from '@/services/stripe.service'
import type { SubscriptionInterval } from '@/types/subscription.types'

const stripeService = new StripeService()

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user || !user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { interval } = body as { interval: SubscriptionInterval }

    if (!interval || (interval !== 'month' && interval !== 'year')) {
      return NextResponse.json({ error: 'Invalid interval' }, { status: 400 })
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const successUrl = `${baseUrl}/account/subscription?success=true`
    const cancelUrl = `${baseUrl}/pricing?canceled=true`

    const session = await stripeService.createCheckoutSession(
      user.id,
      user.email,
      interval,
      successUrl,
      cancelUrl
    )

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    console.error('Create checkout error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
