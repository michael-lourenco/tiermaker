/**
 * Append items to an owned template (used when ranking and adding images).
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { TemplateService } from '@/services/template.service'
import { assertUserOwnsUploadUrl } from '@/lib/server/cloneTemplateImages'

type NewItemInput = {
  name: string
  image_url: string
}

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
    const { template_id, items } = body as {
      template_id: string
      items: NewItemInput[]
    }

    if (!template_id || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'template_id and items are required' },
        { status: 400 }
      )
    }

    const normalized = items.map((item) => {
      assertUserOwnsUploadUrl(item.image_url, user.id)
      return {
        name: (item.name || 'Item').trim() || 'Item',
        image_url: item.image_url.trim(),
      }
    })

    const templateService = new TemplateService(supabase)
    const created = await templateService.appendTemplateItems(
      template_id,
      normalized,
      user.id
    )

    return NextResponse.json({ items: created }, { status: 201 })
  } catch (error: unknown) {
    console.error('Append template items error:', error)
    const message = error instanceof Error ? error.message : 'Failed to append items'
    const status = message === 'Forbidden' ? 403 : message === 'Template not found' ? 404 : 500
    return NextResponse.json({ error: message }, { status })
  }
}
