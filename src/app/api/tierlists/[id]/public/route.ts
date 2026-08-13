/**
 * Update Tier List Public Status API Route
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { hasCoverImage } from '@/lib/utils/publicVisibility'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { is_public } = body

    if (typeof is_public !== 'boolean') {
      return NextResponse.json(
        { error: 'is_public must be a boolean' },
        { status: 400 }
      )
    }

    const { data: tierList, error: fetchError } = await supabase
      .from('tier_lists')
      .select('user_id, template_id, templates(cover_image_url)')
      .eq('id', id)
      .single() as {
      data: {
        user_id: string | null
        template_id: string
        templates: { cover_image_url: string | null } | { cover_image_url: string | null }[] | null
      } | null
      error: any
    }

    if (fetchError || !tierList) {
      return NextResponse.json(
        { error: 'Tier list not found' },
        { status: 404 }
      )
    }

    if (tierList.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    const templateRelation = Array.isArray(tierList.templates)
      ? tierList.templates[0]
      : tierList.templates
    const coverUrl = templateRelation?.cover_image_url

    if (is_public && !hasCoverImage(coverUrl)) {
      return NextResponse.json(
        {
          error:
            'Cover image required: the template must have a cover image to make this tier list public',
          code: 'COVER_REQUIRED_FOR_PUBLIC',
        },
        { status: 400 }
      )
    }

    const updateResult = await (supabase as any)
      .from('tier_lists')
      .update({ is_public })
      .eq('id', id)
      .select()
      .single()

    const { data, error } = updateResult

    if (error) {
      console.error('Error updating tier list:', error)
      return NextResponse.json(
        { error: error.message || 'Failed to update tier list' },
        { status: 500 }
      )
    }

    return NextResponse.json({ data })
  } catch (error: any) {
    console.error('Error updating tier list:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update tier list' },
      { status: 500 }
    )
  }
}
