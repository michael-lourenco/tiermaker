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
import { TierRow } from './TierRow'
import { UnassignedDropZone } from './UnassignedDropZone'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { DEFAULT_TIERS, TIER_COLORS } from '@/lib/constants/tiers'
import type { TemplateItem } from '@/types/template.types'
import type { TierListTier, TierListItem } from '@/types/tierList.types'
import { v4 as uuidv4 } from 'uuid'

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
        id: `tier-${name}-${uuidv4()}`,
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
  const [draggingTierId, setDraggingTierId] = useState<string | null>(null)

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
    
    // Check if we're dragging a tier
    const tier = tiers.find((t) => t.id === event.active.id)
    if (tier) {
      setDraggingTierId(tier.id)
    }
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event

    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    // If dragging a tier over another tier, handle reordering
    const activeTier = tiers.find((t) => t.id === activeId)
    const overTier = tiers.find((t) => t.id === overId)
    
    if (activeTier && overTier && activeId !== overId) {
      const oldIndex = tiers.findIndex((t) => t.id === activeId)
      const newIndex = tiers.findIndex((t) => t.id === overId)
      
      if (oldIndex !== -1 && newIndex !== -1) {
        const newTiers = arrayMove(tiers, oldIndex, newIndex)
        // Update tier_order for all tiers
        const updatedTiers = newTiers.map((tier, index) => ({
          ...tier,
          tier_order: index,
        }))
        setTiers(updatedTiers)
      }
      return
    }

    // If dragging over a tier (item drop)
    // Check if overId is a tier ID or a droppable ID
    if (!activeTier) {
      // First, check if overId is a tier row ID (for tier reordering)
      const overTier = tiers.find((t) => t.id === overId)
      if (overTier) {
        // It's a tier row, so we want to drop the item on that tier
        const tierName = overTier.tier_name
        const item = items.get(activeId)
        if (item && item.tier_name !== tierName) {
          // Update item's tier preview (visual feedback only)
          const newItems = new Map(items)
          newItems.set(activeId, {
            ...item,
            tier_name: tierName,
            order: getNextOrderForTier(tierName),
          })
          setItems(newItems)
        }
        return
      }

      // Check if overId is a droppable ID (tier.id)
      // This is already handled above when checking for overTier, so this check is redundant
      // But we keep it for backward compatibility with old droppable IDs
      const tierFromDroppable = tiers.find((t) => t.id === overId || `tier-${t.tier_name}` === overId)
      if (tierFromDroppable) {
        const tierName = tierFromDroppable.tier_name
        const item = items.get(activeId)
        if (item && item.tier_name !== tierName) {
          // Update item's tier preview (visual feedback only)
          const newItems = new Map(items)
          newItems.set(activeId, {
            ...item,
            tier_name: tierName,
            order: getNextOrderForTier(tierName),
          })
          setItems(newItems)
        }
        return
      }
    }

    if (overId === 'unassigned' && !activeTier) {
      const item = items.get(activeId)
      if (item && item.tier_name !== '') {
        // Preview moving back to unassigned
        const newItems = new Map(items)
        newItems.set(activeId, {
          ...item,
          tier_name: '',
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
      setDraggingTierId(null)
      return
    }

    const activeId = active.id as string
    const overId = over.id as string

    // Check if we're dragging a tier
    const activeTier = tiers.find((t) => t.id === activeId)
    const overTier = tiers.find((t) => t.id === overId)

    if (activeTier && overTier && activeId !== overId) {
      // Tier reordering is already handled in handleDragOver
      setActiveId(null)
      setDraggingTierId(null)
      return
    }

    // If dropping on a tier (item drop)
    if (!activeTier) {
      // First, check if overId is a tier row ID (for tier reordering)
      const overTier = tiers.find((t) => t.id === overId)
      if (overTier) {
        // It's a tier row, so we want to drop the item on that tier
        const tierName = overTier.tier_name
        const item = items.get(activeId)

        if (item) {
          const newItems = new Map(items)
          newItems.set(activeId, {
            ...item,
            tier_name: tierName,
            order: getNextOrderForTier(tierName),
          })
          setItems(newItems)
        }
        setActiveId(null)
        setDraggingTierId(null)
        return
      }

      // Check if overId is a droppable ID (tier.id)
      // This is already handled above when checking for overTier, so this check is redundant
      // But we keep it for backward compatibility with old droppable IDs
      const tierFromDroppable = tiers.find((t) => t.id === overId || `tier-${t.tier_name}` === overId)
      if (tierFromDroppable) {
        const tierName = tierFromDroppable.tier_name
        const item = items.get(activeId)

        if (item) {
          const newItems = new Map(items)
          newItems.set(activeId, {
            ...item,
            tier_name: tierName,
            order: getNextOrderForTier(tierName),
          })
          setItems(newItems)
        }
        setActiveId(null)
        setDraggingTierId(null)
        return
      }
    }

    if (overId === 'unassigned' && !activeTier) {
      // If dropping back to unassigned
      const item = items.get(activeId)
      if (item) {
        const newItems = new Map(items)
        newItems.set(activeId, {
          ...item,
          tier_name: '',
          order: getUnassignedItems().length,
        })
        setItems(newItems)
      }
    }

    setActiveId(null)
    setDraggingTierId(null)
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

  const handleTierNameChange = (tierId: string, newName: string) => {
    // Find the tier to get the old name
    const tier = tiers.find((t) => t.id === tierId)
    if (!tier) return

    const oldName = tier.tier_name
    
    // Don't update if name hasn't changed
    if (oldName === newName) return

    // Update the tier name and items in a single batch to avoid multiple renders
    setTiers((prevTiers) =>
      prevTiers.map((t) =>
        t.id === tierId ? { ...t, tier_name: newName } : t
      )
    )

    // Update all items that belong to this tier to use the new tier name
    setItems((prevItems) => {
      const newItems = new Map(prevItems)
      let hasChanges = false
      Array.from(newItems.entries()).forEach(([itemId, item]) => {
        if (item.tier_name === oldName) {
          newItems.set(itemId, {
            ...item,
            tier_name: newName,
          })
          hasChanges = true
        }
      })
      return hasChanges ? newItems : prevItems
    })
  }

  const handleTierColorChange = (tierId: string, newColor: string) => {
    setTiers((prevTiers) =>
      prevTiers.map((tier) =>
        tier.id === tierId ? { ...tier, color: newColor } : tier
      )
    )
  }

  const handleTierDelete = (tierId: string) => {
    const tier = tiers.find((t) => t.id === tierId)
    if (!tier) return

    // Move all items from this tier back to unassigned
    const newItems = new Map(items)
    Array.from(items.entries()).forEach(([itemId, item]) => {
      if (item.tier_name === tier.tier_name) {
        newItems.set(itemId, {
          ...item,
          tier_name: '',
          order: getUnassignedItems().length,
        })
      }
    })
    setItems(newItems)

    // Remove the tier and reorder remaining tiers
    const filteredTiers = tiers.filter((t) => t.id !== tierId)
    const reorderedTiers = filteredTiers.map((tier, index) => ({
      ...tier,
      tier_order: index,
    }))
    setTiers(reorderedTiers)
  }

  const handleAddTier = () => {
    const newTier: TierListTier = {
      id: `tier-new-${uuidv4()}`,
      tier_list_id: '',
      tier_name: `Tier ${tiers.length + 1}`,
      tier_order: tiers.length,
      color: '#6B7280',
      created_at: '',
    }
    setTiers([...tiers, newTier])
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

  const tierIds = tiers.map((tier) => tier.id)

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="space-y-4">
        {/* Tiers - Sortable */}
        <SortableContext items={tierIds} strategy={verticalListSortingStrategy}>
          {tiers.map((tier) => {
            const tierItems = getItemsForTier(tier.tier_name)
            return (
              <TierRow
                key={tier.id}
                tier={tier}
                items={tierItems}
                activeId={activeId}
                onTierNameChange={handleTierNameChange}
                onTierColorChange={handleTierColorChange}
                onTierDelete={handleTierDelete}
              />
            )
          })}
        </SortableContext>

        {/* Add Tier Button */}
        <div className="flex justify-center">
          <Button
            onClick={handleAddTier}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Adicionar Tier
          </Button>
        </div>

        {/* Unassigned items */}
        <UnassignedDropZone items={getUnassignedItems()} />

        {onSave && (
          <div className="flex justify-end">
            <Button onClick={handleSave} className="px-6 py-2">
              Salvar Tier List
            </Button>
          </div>
        )}
      </div>
    </DndContext>
  )
}
