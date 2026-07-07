/**
 * Clone template: copies S3 objects for cloned images into the current user's prefix,
 * reuses URLs for images already uploaded in this session (source: new).
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { TemplateService } from '@/services/template.service'
import {
  assertUserOwnsUploadUrl,
  buildAllowedCloneImageUrls,
  copyClonedImageToUserFolder,
} from '@/lib/server/cloneTemplateImages'

type CloneItem = {
  name: string
  order: number
  source: 'cloned' | 'new'
  image_url: string
}

type CoverPayload = null | { source: 'cloned' | 'new'; image_url: string }

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = user.id

    const body = await request.json()
    const {
      source_template_id,
      name,
      description,
      category_id,
      is_public,
      cover_image,
      items,
      tiers,
    } = body as {
      source_template_id: string
      name: string
      description?: string
      category_id: string
      is_public?: boolean
      cover_image: CoverPayload
      items: CloneItem[]
      tiers?: Array<{ tier_name: string; tier_order: number; color: string | null }>
    }

    if (!source_template_id || !name || !category_id || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'source_template_id, name, category_id, and items are required' },
        { status: 400 }
      )
    }

    const templateService = new TemplateService(supabase)
    const source = await templateService.getTemplateById(source_template_id, false)

    if (!source) {
      return NextResponse.json({ error: 'Source template not found' }, { status: 404 })
    }

    const isOwner = source.user_id === userId
    if (!source.is_public && !isOwner) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const allowedCloned = buildAllowedCloneImageUrls({
      cover_image_url: source.cover_image_url,
      items: source.items,
    })

    async function resolveUrl(entry: { source: 'cloned' | 'new'; image_url: string }): Promise<string> {
      if (entry.source === 'cloned') {
        return copyClonedImageToUserFolder(entry.image_url, allowedCloned, userId)
      }
      assertUserOwnsUploadUrl(entry.image_url, userId)
      return entry.image_url.trim()
    }

    let cover_image_url: string | undefined
    if (cover_image && cover_image.image_url) {
      cover_image_url = await resolveUrl(cover_image)
    }

    const resolvedItems = await Promise.all(
      items
        .slice()
        .sort((a, b) => a.order - b.order)
        .map(async (item) => ({
          name: item.name,
          image_url: await resolveUrl({ source: item.source, image_url: item.image_url }),
          order: item.order,
        }))
    )

    const template = await templateService.createTemplate(
      {
        name,
        description,
        category_id,
        cover_image_url,
        is_public: is_public ?? true,
        items: resolvedItems.map((row, index) => ({
          name: row.name,
          image_url: row.image_url,
          order: index,
        })),
        tiers,
      },
      userId
    )

    return NextResponse.json({ template }, { status: 201 })
  } catch (error: any) {
    console.error('Clone template error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to clone template' },
      { status: 500 }
    )
  }
}
