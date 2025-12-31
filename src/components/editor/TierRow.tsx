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

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    ...(isDragging && { cursor: 'grabbing' }),
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group ${isDragging ? 'cursor-grabbing' : ''}`}
    >
      <div className="flex items-center gap-0">
        {/* Drag Handle */}
        <div
          {...attributes}
          {...listeners}
          className={`flex-shrink-0 w-6 h-full flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors opacity-0 group-hover:opacity-100 ${
            isDragging ? 'cursor-grabbing' : 'cursor-grab active:cursor-grabbing'
          }`}
          title="Arraste para reordenar"
        >
          <GripVertical className="h-5 w-5" />
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

