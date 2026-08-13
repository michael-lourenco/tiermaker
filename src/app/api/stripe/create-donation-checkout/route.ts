import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { StripeService } from '@/services/stripe.service'
import type { DonationInterval } from '@/lib/stripe/prices'
import { getPublicAppUrl } from '@/lib/constants/site'

const stripeService = new StripeService()
const VALID_INTERVALS: DonationInterval[] = ['once', 'month', 'year']

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const interval = body.interval as DonationInterval

    if (!VALID_INTERVALS.includes(interval)) {
      return NextResponse.json({ error: 'Invalid interval' }, { status: 400 })
    }

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    const baseUrl = getPublicAppUrl()

    const session = await stripeService.createDonationCheckoutSession({
      interval,
      successUrl: `${baseUrl}/?donation=success`,
      cancelUrl: `${baseUrl}/?donation=canceled`,
      customerEmail: user?.email ?? undefined,
      userId: user?.id,
    })

    return NextResponse.json({ url: session.url })
  } catch (error: unknown) {
    console.error('Create donation checkout error:', error)
    const message = error instanceof Error ? error.message : 'Failed to create checkout'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
