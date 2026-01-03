/**
 * Subscription Status Route
 * Retorna status da assinatura do usuário
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { SubscriptionService } from '@/services/subscription.service'
import { SubscriptionLimitService } from '@/services/subscriptionLimit.service'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Criar services com service role client para bypass RLS
    const subscriptionService = new SubscriptionService(createServiceRoleClient())
    const limitService = new SubscriptionLimitService(createServiceRoleClient())

    // Obter subscription
    const subscription = await subscriptionService.getSubscriptionByUserId(user.id)
    const isPremium = await subscriptionService.isUserPremium(user.id)

    // Obter limites
    const userLimits = await limitService.getUserLimits(user.id)
    if (userLimits.length === 0) {
      await limitService.initializeUserLimits(user.id)
    }
    const limits = await limitService.getUserLimits(user.id)

    return NextResponse.json({
      subscription,
      isPremium,
      limits,
    })
  } catch (error: any) {
    console.error('Get subscription status error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
