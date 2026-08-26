/**
 * Fork template while ranking: clone source items + append newly uploaded images.
 * Returns new template and a map from source template_item ids → new ids.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { TemplateService } from '@/services/template.service'
import {
  assertUserOwnsUploadUrl,
  buildAllowedCloneImageUrls,
  copyClonedImageToUserFolder,
} from '@/lib/server/cloneTemplateImages'

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

    const userId = user.id
    const body = await request.json()
    const {
      source_template_id,
      new_items,
      name,
      is_public,
      tiers,
    } = body as {
      source_template_id: string
      new_items: NewItemInput[]
      name?: string
      is_public?: boolean
      tiers?: Array<{ tier_name: string; tier_order: number; color: string | null }>
    }

    if (!source_template_id || !Array.isArray(new_items) || new_items.length === 0) {
      return NextResponse.json(
        { error: 'source_template_id and new_items are required' },
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

    const categoryId = source.categories?.[0]?.id
    if (!categoryId) {
      return NextResponse.json(
        { error: 'Source template has no category' },
        { status: 400 }
      )
    }

    const allowedCloned = buildAllowedCloneImageUrls({
      cover_image_url: source.cover_image_url,
      items: source.items,
    })

    const sourceItems = [...(source.items || [])].sort((a, b) => a.order - b.order)

    const clonedRows = await Promise.all(
      sourceItems.map(async (item) => ({
        sourceId: item.id,
        name: item.name,
        image_url: await copyClonedImageToUserFolder(item.image_url, allowedCloned, userId),
      }))
    )

    const newRows = new_items.map((item) => {
      assertUserOwnsUploadUrl(item.image_url, userId)
      return {
        name: (item.name || 'Item').trim() || 'Item',
        image_url: item.image_url.trim(),
      }
    })

    let cover_image_url: string | undefined
    if (source.cover_image_url) {
      cover_image_url = await copyClonedImageToUserFolder(
        source.cover_image_url,
        allowedCloned,
        userId
      )
    }

    const tierPayload =
      tiers && tiers.length > 0
        ? tiers
        : (source.tiers || []).map((tier) => ({
            tier_name: tier.tier_name,
            tier_order: tier.tier_order,
            color: tier.color,
          }))

    const template = await templateService.createTemplate(
      {
        name: (name?.trim() || `${source.name}`).slice(0, 200),
        description: source.description ?? undefined,
        category_id: categoryId,
        cover_image_url,
        is_public: is_public ?? false,
        items: [
          ...clonedRows.map((row, index) => ({
            name: row.name,
            image_url: row.image_url,
            order: index,
          })),
          ...newRows.map((row, index) => ({
            name: row.name,
            image_url: row.image_url,
            order: clonedRows.length + index,
          })),
        ],
        tiers: tierPayload.length > 0 ? tierPayload : undefined,
      },
      userId
    )

    const itemIdMap: Record<string, string> = {}
    clonedRows.forEach((row, index) => {
      const created = template.items[index]
      if (created) {
        itemIdMap[row.sourceId] = created.id
      }
    })

    const newItemIds = template.items.slice(clonedRows.length).map((item) => item.id)

    const full = await templateService.getTemplateById(template.id, false)

    return NextResponse.json(
      {
        template: full || template,
        itemIdMap,
        newItemIds,
      },
      { status: 201 }
    )
  } catch (error: unknown) {
    console.error('Fork for ranking error:', error)
    const message = error instanceof Error ? error.message : 'Failed to fork template'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
