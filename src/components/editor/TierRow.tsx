'use client'

import { useSortable } from '@dnd-kit/sortable'
import { useDroppable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'
import { TierColumn } from './TierColumn'
import type { TemplateItem } from '@/types/template.types'
import type { TierListTier } from '@/types/tierList.types'

interface TierRowProps {
  tier: TierListTier
  items: TemplateItem[]
  activeId: string | null
  showItemName?: boolean
  isDragging?: boolean
  onTierNameChange: (tierId: string, newName: string) => void
  onTierColorChange: (tierId: string, newColor: string) => void
  onTierDelete: (tierId: string) => void
}

export function TierRow({
  tier,
  items,
  activeId,
  showItemName = false,
  isDragging: isDraggingProp = false,
  onTierNameChange,
  onTierColorChange,
  onTierDelete,
}: TierRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef: setSortableRef,
    transform,
    transition,
    isDragging: isDraggingInternal,
  } = useSortable({ id: tier.id })
  
  // Use prop if provided, otherwise use internal state
  const isDragging = isDraggingProp || isDraggingInternal

  // Also make the row droppable for items (when not dragging the tier itself)
  const { setNodeRef: setDroppableRef, isOver } = useDroppable({
    id: tier.id, // Use tier.id as droppable ID so items can be dropped on the row
  })

  // Combine refs
  const setNodeRef = (node: HTMLElement | null) => {
    setSortableRef(node)
    setDroppableRef(node)
  }

  // Ensure transition is applied for smooth animations
  // The @dnd-kit provides transition automatically via useSortable
  // When this tier is being dragged, transition is null (which is correct - no transition for dragging item)
  // When other tiers are being reordered, we need to ensure transition is applied
  // We apply a default transition when there's an active drag and this tier is not the one being dragged
  const isThisTierDragging = isDragging
  // Always apply transition when provided by @dnd-kit, or when another tier is being dragged
  const transitionStyle = transition !== null && transition !== undefined 
    ? transition 
    : (activeId && activeId !== tier.id && !isThisTierDragging ? 'transform 200ms cubic-bezier(0.2, 0, 0.2, 1)' : undefined)
  
  const style = {
    transform: CSS.Transform.toString(transform),
    ...(transitionStyle && { transition: transitionStyle }),
    ...(isDragging && { cursor: 'grabbing' }),
    touchAction: 'none' as const, // Previne scroll durante drag no mobile
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group ${isDragging ? 'cursor-grabbing' : ''}`}
    >
      <div className="flex items-center gap-0">
        {/* Drag Handle - Visível no mobile para facilitar uso */}
        <div
          {...attributes}
          {...listeners}
          className={`flex-shrink-0 w-5 sm:w-6 h-full flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors opacity-60 sm:opacity-0 sm:group-hover:opacity-100 ${
            isDragging ? 'cursor-grabbing' : 'cursor-grab active:cursor-grabbing'
          }`}
          title="Arraste para reordenar"
        >
          <GripVertical className="h-4 w-4 sm:h-5 sm:w-5" />
        </div>

        {/* Tier Column */}
        <div className="flex-1">
          <TierColumn
            tier={tier}
            items={items}
            activeId={activeId}
            showItemName={showItemName}
            onTierNameChange={onTierNameChange}
            onTierColorChange={onTierColorChange}
            onTierDelete={onTierDelete}
            isDragging={isDragging}
          />
        </div>
      </div>
    </div>
  )
}

