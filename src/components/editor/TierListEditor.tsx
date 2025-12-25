'use client'

import { useState, useEffect } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { TierColumn } from './TierColumn'
import { ItemCard } from './ItemCard'
import { UnassignedDropZone } from './UnassignedDropZone'
import { DEFAULT_TIERS, TIER_COLORS } from '@/lib/constants/tiers'
import type { TemplateItem } from '@/types/template.types'
import type { TierListTier, TierListItem } from '@/types/tierList.types'

interface TierListEditorProps {
  templateItems: TemplateItem[]
  initialTiers?: TierListTier[]
  initialItems?: (TierListItem & { template_item: TemplateItem })[]
  onSave?: (data: {
    tiers: Array<{ tier_name: string; tier_order: number; color: string | null }>
    items: Array<{ template_item_id: string; tier_name: string; order: number }>
  }) => void
}

export function TierListEditor({
  templateItems,
  initialTiers,
  initialItems,
  onSave,
}: TierListEditorProps) {
  const [tiers, setTiers] = useState<TierListTier[]>(
    initialTiers ||
      DEFAULT_TIERS.map((name, index) => ({
        id: `tier-${name}`,
        tier_list_id: '',
        tier_name: name,
        tier_order: index,
        color: TIER_COLORS[name] || null,
        created_at: '',
      }))
  )

  const [items, setItems] = useState<
    Map<string, { template_item: TemplateItem; tier_name: string; order: number }>
  >(new Map())

  const [activeId, setActiveId] = useState<string | null>(null)

  // Initialize items from initialItems or templateItems
  useEffect(() => {
    if (initialItems && initialItems.length > 0) {
      const itemsMap = new Map<
        string,
        { template_item: TemplateItem; tier_name: string; order: number }
      >()
      initialItems.forEach((item) => {
        itemsMap.set(item.template_item_id, {
          template_item: item.template_item,
          tier_name: item.tier_name,
          order: item.order,
        })
      })
      setItems(itemsMap)
    } else {
      // Initialize with all template items in "unassigned"
      const itemsMap = new Map<
        string,
        { template_item: TemplateItem; tier_name: string; order: number }
      >()
      templateItems.forEach((item, index) => {
        itemsMap.set(item.id, {
          template_item: item,
          tier_name: '',
          order: index,
        })
      })
      setItems(itemsMap)
    }
  }, [templateItems, initialItems])

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event

    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    // If dragging over a tier
    if (overId.startsWith('tier-')) {
      const tierName = overId.replace('tier-', '')
      const item = items.get(activeId)
      if (item && item.tier_name !== tierName) {
        // Update item's tier preview (visual feedback only)
        const newItems = new Map(items)
        newItems.set(activeId, {
          ...item,
          tier_name: tierName, // Update tier_name for preview
          order: getNextOrderForTier(tierName),
        })
        setItems(newItems)
      }
    } else if (overId === 'unassigned') {
      const item = items.get(activeId)
      if (item && item.tier_name !== '') {
        // Preview moving back to unassigned
        const newItems = new Map(items)
        newItems.set(activeId, {
          ...item,
          tier_name: '', // Clear tier_name for preview
          order: getUnassignedItems().length,
        })
        setItems(newItems)
      }
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (!over) {
      setActiveId(null)
      return
    }

    const activeId = active.id as string
    const overId = over.id as string

    // If dropping on a tier
    if (overId.startsWith('tier-')) {
      const tierName = overId.replace('tier-', '')
      const item = items.get(activeId)

      if (item) {
        const newItems = new Map(items)
        newItems.set(activeId, {
          ...item,
          tier_name: tierName, // Update tier_name when dropping
          order: getNextOrderForTier(tierName),
        })
        setItems(newItems)
      }
    } else if (overId === 'unassigned') {
      // If dropping back to unassigned
      const item = items.get(activeId)
      if (item) {
        const newItems = new Map(items)
        newItems.set(activeId, {
          ...item,
          tier_name: '', // Clear tier_name
          order: getUnassignedItems().length,
        })
        setItems(newItems)
      }
    }

    setActiveId(null)
  }

  const getNextOrderForTier = (tierName: string): number => {
    const tierItems = Array.from(items.values()).filter(
      (item) => item.tier_name === tierName
    )
    return tierItems.length
  }

  const getItemsForTier = (tierName: string): TemplateItem[] => {
    return Array.from(items.entries())
      .filter(([_, item]) => item.tier_name === tierName)
      .sort(([_, a], [__, b]) => a.order - b.order)
      .map(([id]) => items.get(id)!.template_item)
  }

  const getUnassignedItems = (): TemplateItem[] => {
    return Array.from(items.entries())
      .filter(([_, item]) => !item.tier_name || item.tier_name === '')
      .sort(([_, a], [__, b]) => a.order - b.order)
      .map(([id]) => items.get(id)!.template_item)
  }

  const handleSave = () => {
    if (onSave) {
      // Only send the data needed to create tiers (no id, tier_list_id, created_at)
      const tierData = tiers.map((tier) => ({
        tier_name: tier.tier_name,
        tier_order: tier.tier_order,
        color: tier.color || null,
      }))

      const itemData = Array.from(items.entries())
        .filter(([_, item]) => item.tier_name && item.tier_name !== '')
        .map(([template_item_id, item]) => ({
          template_item_id,
          tier_name: item.tier_name,
          order: item.order,
        }))

      onSave({
        tiers: tierData,
        items: itemData,
      })
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="space-y-4">
        {tiers.map((tier) => {
          const tierItems = getItemsForTier(tier.tier_name)
          return (
            <TierColumn
              key={tier.id}
              tier={tier}
              items={tierItems}
              activeId={activeId}
            />
          )
        })}

        {/* Unassigned items */}
        <UnassignedDropZone items={getUnassignedItems()} />

        {onSave && (
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Save Tier List
            </button>
          </div>
        )}
      </div>
    </DndContext>
  )
}

