'use client'

import { useMemo, memo, useCallback } from 'react'
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

// Componente memoizado para evitar re-renders desnecessários
export const TierRow = memo(function TierRow({
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
  const { setNodeRef: setDroppableRef } = useDroppable({
    id: tier.id, // Use tier.id as droppable ID so items can be dropped on the row
  })

  // Combine refs - memoizado para evitar recriar função
  const setNodeRef = useCallback((node: HTMLElement | null) => {
    setSortableRef(node)
    setDroppableRef(node)
  }, [setSortableRef, setDroppableRef])

  // Memoiza o cálculo de transition para evitar recalcular
  const transitionStyle = useMemo(() => {
    if (transition !== null && transition !== undefined) {
      return transition
    }
    if (activeId && activeId !== tier.id && !isDragging) {
      return 'transform 200ms cubic-bezier(0.2, 0, 0.2, 1)'
    }
    return undefined
  }, [transition, activeId, tier.id, isDragging])
  
  // Memoiza o style para evitar recriar objeto
  const style = useMemo(() => ({
    transform: CSS.Transform.toString(transform),
    ...(transitionStyle && { transition: transitionStyle }),
    ...(isDragging && { cursor: 'grabbing' }),
    // Removido touchAction: 'none' para permitir scroll durante drag
  }), [transform, transitionStyle, isDragging])

  // Memoiza as props de drag
  const dragProps = useMemo(() => ({
    ...attributes,
    ...listeners,
  }), [attributes, listeners])

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group ${isDragging ? 'cursor-grabbing' : ''}`}
      data-tier-id={tier.id}
    >
      <div className="flex items-center gap-0">
        {/* Drag Handle - Visível no mobile para facilitar uso */}
        <div
          {...dragProps}
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
}, (prevProps, nextProps) => {
  // Comparação customizada para memo
  // Re-renderiza apenas se props relevantes mudaram
  if (prevProps.tier.id !== nextProps.tier.id) return false
  if (prevProps.tier.tier_name !== nextProps.tier.tier_name) return false
  if (prevProps.tier.color !== nextProps.tier.color) return false
  if (prevProps.tier.tier_order !== nextProps.tier.tier_order) return false
  if (prevProps.activeId !== nextProps.activeId) return false
  if (prevProps.isDragging !== nextProps.isDragging) return false
  if (prevProps.showItemName !== nextProps.showItemName) return false
  if (prevProps.onTierNameChange !== nextProps.onTierNameChange) return false
  if (prevProps.onTierColorChange !== nextProps.onTierColorChange) return false
  if (prevProps.onTierDelete !== nextProps.onTierDelete) return false
  
  // Compara items por IDs (mais eficiente que comparar objetos inteiros)
  if (prevProps.items.length !== nextProps.items.length) return false
  const prevIds = prevProps.items.map(item => item.id).join(',')
  const nextIds = nextProps.items.map(item => item.id).join(',')
  if (prevIds !== nextIds) return false
  
  return true // Props são iguais, não precisa re-renderizar
})

