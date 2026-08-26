import {
  createPendingItemId,
  isPendingTemplateItemId,
} from '@/lib/editor/pendingItems'
import type { TemplateItem } from '@/types/template.types'

export type RankingItem = {
  template_item_id: string
  tier_name: string
  order: number
}

export type RankingTier = {
  tier_name: string
  tier_order: number
  color: string | null
}

type UploadedItem = { name: string; image_url: string }

async function uploadPendingItems(
  pendingOrdered: RankingItem[],
  pendingFiles: Map<string, File>,
  uploadImage: (file: File) => Promise<string>
): Promise<UploadedItem[]> {
  const uploaded: UploadedItem[] = []
  for (const item of pendingOrdered) {
    const file = pendingFiles.get(item.template_item_id)
    if (!file) {
      throw new Error(`Missing file for pending item ${item.template_item_id}`)
    }
    const image_url = await uploadImage(file)
    const name = file.name.replace(/\.[^/.]+$/, '').trim() || 'Item'
    uploaded.push({ name, image_url })
  }
  return uploaded
}

/**
 * Persist pending local images into a template (append if owner, fork otherwise)
 * and remap ranking item ids to real template_item ids.
 */
export async function resolveRankingWithPendingImages(params: {
  sourceTemplateId: string
  sourceTemplateName: string
  isOwner: boolean
  rankingItems: RankingItem[]
  rankingTiers: RankingTier[]
  pendingFiles: Map<string, File>
  uploadImage: (file: File) => Promise<string>
}): Promise<{
  templateId: string
  items: RankingItem[]
  createdNewTemplate: boolean
}> {
  const pendingOrdered = params.rankingItems.filter((item) =>
    isPendingTemplateItemId(item.template_item_id)
  )

  if (pendingOrdered.length === 0) {
    return {
      templateId: params.sourceTemplateId,
      items: params.rankingItems,
      createdNewTemplate: false,
    }
  }

  const uploaded = await uploadPendingItems(
    pendingOrdered,
    params.pendingFiles,
    params.uploadImage
  )

  if (params.isOwner) {
    const response = await fetch('/api/templates/append-items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        template_id: params.sourceTemplateId,
        items: uploaded,
      }),
    })
    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      throw new Error(err.error || 'Failed to append template items')
    }
    const data = (await response.json()) as { items: TemplateItem[] }
    const idMap = new Map<string, string>()
    pendingOrdered.forEach((item, index) => {
      const created = data.items[index]
      if (created) idMap.set(item.template_item_id, created.id)
    })

    return {
      templateId: params.sourceTemplateId,
      createdNewTemplate: false,
      items: params.rankingItems.map((item) => ({
        ...item,
        template_item_id: idMap.get(item.template_item_id) || item.template_item_id,
      })),
    }
  }

  const response = await fetch('/api/templates/fork-for-ranking', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      source_template_id: params.sourceTemplateId,
      new_items: uploaded,
      name: params.sourceTemplateName,
      is_public: false,
      tiers: params.rankingTiers,
    }),
  })
  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err.error || 'Failed to fork template')
  }

  const data = (await response.json()) as {
    template: { id: string }
    itemIdMap: Record<string, string>
    newItemIds: string[]
  }

  const pendingIndex = new Map(
    pendingOrdered.map((item, index) => [item.template_item_id, index])
  )

  const remapped = params.rankingItems
    .map((item) => {
      if (isPendingTemplateItemId(item.template_item_id)) {
        const index = pendingIndex.get(item.template_item_id)
        if (index === undefined) return null
        const newId = data.newItemIds[index]
        if (!newId) return null
        return { ...item, template_item_id: newId }
      }
      const mapped = data.itemIdMap[item.template_item_id]
      if (!mapped) return null
      return { ...item, template_item_id: mapped }
    })
    .filter((item): item is RankingItem => Boolean(item))

  return {
    templateId: data.template.id,
    items: remapped,
    createdNewTemplate: true,
  }
}

export function buildPendingTemplateItem(params: {
  file: File
  templateId: string
  order: number
}): { item: TemplateItem; file: File; objectUrl: string } {
  const id = createPendingItemId()
  const objectUrl = URL.createObjectURL(params.file)
  return {
    file: params.file,
    objectUrl,
    item: {
      id,
      template_id: params.templateId,
      name: params.file.name.replace(/\.[^/.]+$/, '').trim() || 'Item',
      image_url: objectUrl,
      order: params.order,
      created_at: '',
    },
  }
}
