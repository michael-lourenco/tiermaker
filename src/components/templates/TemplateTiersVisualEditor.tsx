'use client'

import { useState } from 'react'
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
import { DEFAULT_TIERS, TIER_COLORS } from '@/lib/constants/tiers'
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
  onChange: (tiers: TemplateTier[]) => void
}

export function TemplateTiersVisualEditor({ tiers, onChange }: TemplateTiersVisualEditorProps) {
  const { t } = useTranslation()
  const [activeId, setActiveId] = useState<string | null>(null)
  const [draggingTierId, setDraggingTierId] = useState<string | null>(null)

  // Convert TemplateTier to TierListTier format for TierRow
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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)
    setDraggingTierId(null)
    document.body.classList.remove('dragging-tier')

    if (!over || active.id === over.id) {
      return
    }

    const oldIndex = tiers.findIndex((t) => t.id === active.id)
    const newIndex = tiers.findIndex((t) => t.id === over.id)

    if (oldIndex !== -1 && newIndex !== -1) {
      const newTiers = arrayMove(tiers, oldIndex, newIndex)
      const reorderedTiers = newTiers.map((tier, index) => ({
        ...tier,
        tier_order: index,
      }))
      onChange(reorderedTiers)
    }
  }

  const handleTierNameChange = (tierId: string, newName: string) => {
    onChange(
      tiers.map((tier) =>
        tier.id === tierId ? { ...tier, tier_name: newName } : tier
      )
    )
  }

  const handleTierColorChange = (tierId: string, newColor: string) => {
    onChange(
      tiers.map((tier) =>
        tier.id === tierId ? { ...tier, color: newColor } : tier
      )
    )
  }

  const handleTierDelete = (tierId: string) => {
    const filteredTiers = tiers.filter((t) => t.id !== tierId)
    const reorderedTiers = filteredTiers.map((tier, index) => ({
      ...tier,
      tier_order: index,
    }))
    onChange(reorderedTiers)
  }

  const handleAddTier = () => {
    const newTier: TemplateTier = {
      id: `tier-${uuidv4()}`,
      tier_name: `Tier ${tiers.length + 1}`,
      tier_order: tiers.length,
      color: '#6B7280',
    }
    onChange([...tiers, newTier])
  }

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
        {/* Tiers - Sortable */}
        <SortableContext items={tierIds} strategy={verticalListSortingStrategy}>
          {tiersAsTierListTiers.map((tier) => (
            <TierRow
              key={tier.id}
              tier={tier}
              items={[]} // No items in template tiers editor
              activeId={activeId}
              showItemName={false}
              isDragging={draggingTierId === tier.id}
              onTierNameChange={handleTierNameChange}
              onTierColorChange={handleTierColorChange}
              onTierDelete={handleTierDelete}
            />
          ))}
        </SortableContext>

        {/* Add Tier Button */}
        <div className="flex justify-center px-2 sm:px-4 pt-4">
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
