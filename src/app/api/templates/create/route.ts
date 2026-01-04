/**
 * Create Template Route
 * Cria um novo template com verificação de limites
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { TemplateService } from '@/services/template.service'
import { SubscriptionLimitService } from '@/services/subscriptionLimit.service'
import type { CreateTemplateInput } from '@/types/template.types'

const templateService = new TemplateService()
const limitService = new SubscriptionLimitService(createServiceRoleClient())

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
    const {
      name,
      description,
      category_id,
      cover_image_url,
      is_public,
      items,
    } = body as CreateTemplateInput & { items: Array<{ name: string; image_url: string; order: number }> }

    // Validar dados obrigatórios
    if (!name || !category_id || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'Name, category_id, and items are required' },
        { status: 400 }
      )
    }

    // Verificar limite de templates
    await limitService.ensureLimitsInitialized(user.id)
    const canCreate = await limitService.canPerformAction(user.id, 'templates_count')
    const hasReached = await limitService.hasReachedLimit(user.id, 'templates_count')

    if (!canCreate || hasReached) {
      const limit = await limitService.getLimit(user.id, 'templates_count')
      return NextResponse.json(
        {
          error: 'Template limit reached',
          limitReached: true,
          currentCount: limit?.current_count ?? 0,
          maxCount: limit?.max_count ?? 3,
        },
        { status: 403 }
      )
    }

    // Criar template
    const template = await templateService.createTemplate(
      {
        name,
        description,
        category_id,
        cover_image_url,
        is_public: is_public ?? true,
        items,
      },
      user.id
    )

    // O trigger no banco atualiza automaticamente o current_count
    // Não precisamos incrementar manualmente aqui

    return NextResponse.json({ template }, { status: 201 })
  } catch (error: any) {
    console.error('Create template error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create template' },
      { status: 500 }
    )
  }
}
