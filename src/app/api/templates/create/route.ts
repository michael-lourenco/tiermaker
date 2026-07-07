/**
 * Create Template Route
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { TemplateService } from '@/services/template.service'
import type { CreateTemplateInput } from '@/types/template.types'

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
      tiers,
    } = body as CreateTemplateInput & { 
      items: Array<{ name: string; image_url: string; order: number }>
      tiers?: Array<{ tier_name: string; tier_order: number; color: string | null }>
    }

    if (!name || !category_id || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'Name, category_id, and items are required' },
        { status: 400 }
      )
    }

    const templateService = new TemplateService(supabase)
    const template = await templateService.createTemplate(
      {
        name,
        description,
        category_id,
        cover_image_url,
        is_public: is_public ?? true,
        items,
        tiers,
      },
      user.id
    )

    return NextResponse.json({ template }, { status: 201 })
  } catch (error: any) {
    console.error('Create template error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create template' },
      { status: 500 }
    )
  }
}
