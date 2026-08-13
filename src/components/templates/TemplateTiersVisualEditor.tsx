'use client'

import { useState, useCallback, type Dispatch, type SetStateAction } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { TierRow } from '@/components/editor/TierRow'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'
import { useTranslation } from '@/hooks/useTranslation'
import type { TierListTier } from '@/types/tierList.types'

export interface TemplateTier {
  id: string
  tier_name: string
  tier_order: number
  color: string | null
}

interface TemplateTiersVisualEditorProps {
  tiers: TemplateTier[]
  onChange: Dispatch<SetStateAction<TemplateTier[]>>
}

export function TemplateTiersVisualEditor({ tiers, onChange }: TemplateTiersVisualEditorProps) {
  const { t } = useTranslation()
  const [activeId, setActiveId] = useState<string | null>(null)
  const [draggingTierId, setDraggingTierId] = useState<string | null>(null)

  const tiersAsTierListTiers: TierListTier[] = tiers.map((tier) => ({
    id: tier.id,
    tier_list_id: '',
    tier_name: tier.tier_name,
    tier_order: tier.tier_order,
    color: tier.color,
    created_at: '',
  }))

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
    const tier = tiersAsTierListTiers.find((t) => t.id === event.active.id)
    if (tier) {
      setDraggingTierId(tier.id)
      document.body.classList.add('dragging-tier')
    }
  }

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event
      setActiveId(null)
      setDraggingTierId(null)
      document.body.classList.remove('dragging-tier')

      if (!over || active.id === over.id) {
        return
      }

      onChange((prev) => {
        const oldIndex = prev.findIndex((t) => t.id === active.id)
        const newIndex = prev.findIndex((t) => t.id === over.id)

        if (oldIndex === -1 || newIndex === -1) {
          return prev
        }

        return arrayMove(prev, oldIndex, newIndex).map((tier, index) => ({
          ...tier,
          tier_order: index,
        }))
      })
    },
    [onChange]
  )

  // Functional updates: TierRow/TierColumn are memoized and may keep stale handlers.
  const handleTierNameChange = useCallback(
    (tierId: string, newName: string) => {
      onChange((prev) =>
        prev.map((tier) => (tier.id === tierId ? { ...tier, tier_name: newName } : tier))
      )
    },
    [onChange]
  )

  const handleTierColorChange = useCallback(
    (tierId: string, newColor: string) => {
      onChange((prev) =>
        prev.map((tier) => (tier.id === tierId ? { ...tier, color: newColor } : tier))
      )
    },
    [onChange]
  )

  const handleTierDelete = useCallback(
    (tierId: string) => {
      onChange((prev) =>
        prev
          .filter((t) => t.id !== tierId)
          .map((tier, index) => ({
            ...tier,
            tier_order: index,
          }))
      )
    },
    [onChange]
  )

  const handleAddTier = useCallback(() => {
    onChange((prev) => [
      ...prev,
      {
        id: `tier-${uuidv4()}`,
        tier_name: `Tier ${prev.length + 1}`,
        tier_order: prev.length,
        color: '#6B7280',
      },
    ])
  }, [onChange])

  const tierIds = tiers.map((tier) => tier.id)
  const isDraggingTier = draggingTierId !== null

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className={`space-y-0 ${isDraggingTier ? 'cursor-grabbing' : ''}`}>
        <SortableContext items={tierIds} strategy={verticalListSortingStrategy}>
          {tiersAsTierListTiers.map((tier) => (
            <TierRow
              key={tier.id}
              tier={tier}
              items={[]}
              activeId={activeId}
              showItemName={false}
              isDragging={draggingTierId === tier.id}
              onTierNameChange={handleTierNameChange}
              onTierColorChange={handleTierColorChange}
              onTierDelete={handleTierDelete}
            />
          ))}
        </SortableContext>

        <div className="flex justify-center px-1 sm:px-2 pt-2">
          <Button
            type="button"
            onClick={handleAddTier}
            variant="outline"
            className="flex items-center gap-2 w-full sm:w-auto"
          >
            <Plus className="h-4 w-4" />
            {t('editor.addTier') || 'Adicionar Tier'}
          </Button>
        </div>
      </div>
    </DndContext>
  )
}
