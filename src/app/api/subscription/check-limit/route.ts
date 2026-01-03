/**
 * Check Subscription Limit Route
 * Verifica se usuário pode realizar uma ação (criar tier list, etc)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { SubscriptionLimitService } from '@/services/subscriptionLimit.service'
import type { SubscriptionLimitType } from '@/types/subscription.types'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { limitType } = body as { limitType: SubscriptionLimitType }

    if (!limitType) {
      return NextResponse.json({ error: 'limitType is required' }, { status: 400 })
    }

    // Criar service com service role client para bypass RLS
    const limitService = new SubscriptionLimitService(createServiceRoleClient())

    // Garantir que limites estão inicializados
    await limitService.initializeUserLimits(user.id)

    // Verificar se pode realizar ação
    const canPerform = await limitService.canPerformAction(user.id, limitType)
    const hasReached = await limitService.hasReachedLimit(user.id, limitType)
    const limit = await limitService.getLimit(user.id, limitType)

    return NextResponse.json({
      canPerform,
      hasReached,
      limit,
    })
  } catch (error: any) {
    console.error('Check limit error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
