'use client'

import { useState, useEffect, useRef } from 'react'
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
import { useTranslation } from '@/hooks/useTranslation'

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
  const { t } = useTranslation()
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
  const lastDragOverRef = useRef<{ activeId: string; overId: string; tierName?: string; order?: number } | null>(null)

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
    lastDragOverRef.current = null // Reset drag over tracking
    
    // Check if we're dragging a tier
    const tier = tiers.find((t) => t.id === event.active.id)
    if (tier) {
      setDraggingTierId(tier.id)
    }
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event

    if (!over) {
      lastDragOverRef.current = null
      return
    }

    const activeId = active.id as string
    const overId = over.id as string

    // Check if this is the same drag operation to avoid unnecessary updates
    if (lastDragOverRef.current?.activeId === activeId && lastDragOverRef.current?.overId === overId) {
      return
    }

    // If dragging a tier over another tier, handle reordering
    const activeTier = tiers.find((t) => t.id === activeId)
    const overTier = tiers.find((t) => t.id === overId)
    
    if (activeTier && overTier && activeId !== overId) {
      const oldIndex = tiers.findIndex((t) => t.id === activeId)
      const newIndex = tiers.findIndex((t) => t.id === overId)
      
      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        const newTiers = arrayMove(tiers, oldIndex, newIndex)
        // Update tier_order for all tiers
        const updatedTiers = newTiers.map((tier, index) => ({
          ...tier,
          tier_order: index,
        }))
        setTiers(updatedTiers)
        lastDragOverRef.current = { activeId, overId }
      }
      return
    }

    // If dragging an item (not a tier)
    if (!activeTier) {
      const activeItem = items.get(activeId)
      if (!activeItem) return

      // Check if overId is another item (reordering within same tier or moving between tiers)
      const overItem = items.get(overId)
      if (overItem) {
        // Both are items - handle reordering
        const overItemTierName = overItem.tier_name
        const activeItemTierName = activeItem.tier_name

        // If moving within the same tier, reorder items
        if (activeItemTierName === overItemTierName && activeItemTierName !== '') {
          // Get all items in this tier, sorted by order
          const tierItemsEntries = Array.from(items.entries())
            .filter(([_, item]) => item.tier_name === activeItemTierName)
            .sort(([_, a], [__, b]) => a.order - b.order)

          const activeIndex = tierItemsEntries.findIndex(([id]) => id === activeId)
          const overIndex = tierItemsEntries.findIndex(([id]) => id === overId)

          if (activeIndex !== -1 && overIndex !== -1 && activeIndex !== overIndex) {
            // Check if order would actually change
            const currentItem = items.get(activeId)
            const targetOrder = tierItemsEntries[overIndex]?.[1]?.order
            if (currentItem && targetOrder !== undefined && currentItem.order !== targetOrder) {
              // Reorder using arrayMove
              const reorderedEntries = arrayMove(tierItemsEntries, activeIndex, overIndex)
              const newItems = new Map(items)
              
              // Update order for all items in this tier based on new positions
              reorderedEntries.forEach(([itemId], newOrder) => {
                const item = newItems.get(itemId)
                if (item && item.order !== newOrder) {
                  newItems.set(itemId, {
                    ...item,
                    order: newOrder,
                  })
                }
              })
              setItems(newItems)
              lastDragOverRef.current = { activeId, overId, order: targetOrder }
            }
          }
        } else if (activeItemTierName !== overItemTierName) {
          // Moving to a different tier - only update if tier actually changed
          if (activeItem.tier_name !== overItemTierName) {
            const newItems = new Map(items)
            
            // Get all items in the target tier, sorted by order
            const targetTierItemsEntries = Array.from(items.entries())
              .filter(([_, item]) => item.tier_name === overItemTierName)
              .sort(([_, a], [__, b]) => a.order - b.order)
            
            // Find the position of the over item in its tier
            const overItemIndex = targetTierItemsEntries.findIndex(([id]) => id === overId)
            
            // Update the active item to the new tier and position
            newItems.set(activeId, {
              ...activeItem,
              tier_name: overItemTierName,
              order: overItemIndex >= 0 ? overItemIndex : targetTierItemsEntries.length,
            })
            
            // Shift orders of items after the insertion point in the target tier
            targetTierItemsEntries.forEach(([itemId, item]) => {
              if (itemId !== activeId && item.order >= overItemIndex) {
                newItems.set(itemId, {
                  ...item,
                  order: item.order + 1,
                })
              }
            })
            
            setItems(newItems)
            lastDragOverRef.current = { activeId, overId, tierName: overItemTierName }
          }
        }
        return
      }

      // Check if overId is a tier row ID
      const overTier = tiers.find((t) => t.id === overId)
      if (overTier) {
        // It's a tier row, so we want to drop the item on that tier
        const tierName = overTier.tier_name
        if (activeItem.tier_name !== tierName) {
          // Only update if tier actually changed
          const newItems = new Map(items)
          newItems.set(activeId, {
            ...activeItem,
            tier_name: tierName,
            order: getNextOrderForTier(tierName),
          })
          setItems(newItems)
          lastDragOverRef.current = { activeId, overId, tierName }
        }
        return
      }

      // Check if overId is a droppable ID (tier.id)
      const tierFromDroppable = tiers.find((t) => t.id === overId || `tier-${t.tier_name}` === overId)
      if (tierFromDroppable) {
        const tierName = tierFromDroppable.tier_name
        if (activeItem.tier_name !== tierName) {
          // Only update if tier actually changed
          const newItems = new Map(items)
          newItems.set(activeId, {
            ...activeItem,
            tier_name: tierName,
            order: getNextOrderForTier(tierName),
          })
          setItems(newItems)
          lastDragOverRef.current = { activeId, overId, tierName }
        }
        return
      }
    }

    if (overId === 'unassigned' && !activeTier) {
      const item = items.get(activeId)
      if (item && item.tier_name !== '') {
        // Only update if actually moving to unassigned
        const newItems = new Map(items)
        newItems.set(activeId, {
          ...item,
          tier_name: '',
          order: getUnassignedItems().length,
        })
        setItems(newItems)
        lastDragOverRef.current = { activeId, overId }
      }
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    lastDragOverRef.current = null // Reset drag over tracking

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

    // If dropping an item (not a tier)
    if (!activeTier) {
      const activeItem = items.get(activeId)
      if (!activeItem) {
        setActiveId(null)
        setDraggingTierId(null)
        return
      }

      // Check if overId is another item (reordering within same tier or moving between tiers)
      const overItem = items.get(overId)
      if (overItem) {
        // Both are items - reordering is already handled in handleDragOver
        setActiveId(null)
        setDraggingTierId(null)
        return
      }

      // Check if overId is a tier row ID
      const overTier = tiers.find((t) => t.id === overId)
      if (overTier) {
        // It's a tier row, so we want to drop the item on that tier
        const tierName = overTier.tier_name
        const newItems = new Map(items)
        newItems.set(activeId, {
          ...activeItem,
          tier_name: tierName,
          order: getNextOrderForTier(tierName),
        })
        setItems(newItems)
        setActiveId(null)
        setDraggingTierId(null)
        return
      }

      // Check if overId is a droppable ID (tier.id)
      const tierFromDroppable = tiers.find((t) => t.id === overId || `tier-${t.tier_name}` === overId)
      if (tierFromDroppable) {
        const tierName = tierFromDroppable.tier_name
        const newItems = new Map(items)
        newItems.set(activeId, {
          ...activeItem,
          tier_name: tierName,
          order: getNextOrderForTier(tierName),
        })
        setItems(newItems)
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
      <div className="space-y-0">
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
        <div className="flex justify-center px-4">
            <Button
              onClick={handleAddTier}
              variant="outline"
              className="flex items-center gap-2 w-full sm:w-auto touch-manipulation"
            >
              <Plus className="h-4 w-4" />
              {t('editor.addTier')}
            </Button>
        </div>

        {/* Unassigned items - always show, even when empty */}
        <UnassignedDropZone items={getUnassignedItems()} />

            {onSave && (
              <div className="flex justify-end px-4 pb-4">
                <Button onClick={handleSave} className="px-6 py-2 w-full sm:w-auto touch-manipulation">
                  {t('editor.saveTierList')}
                </Button>
              </div>
            )}
      </div>
    </DndContext>
  )
}
