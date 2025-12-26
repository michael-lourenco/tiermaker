'use client'

import { useDroppable } from '@dnd-kit/core'
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable'
import { ItemCard } from './ItemCard'
import type { TemplateItem } from '@/types/template.types'
import { useTranslation } from '@/hooks/useTranslation'

interface UnassignedDropZoneProps {
  items: TemplateItem[]
}

export function UnassignedDropZone({ items }: UnassignedDropZoneProps) {
  const { t } = useTranslation()
  const { setNodeRef, isOver } = useDroppable({
    id: 'unassigned',
  })

  return (
    <div
      ref={setNodeRef}
      className={`sticky bottom-0 z-10 border-2 border-dashed rounded-lg p-2 sm:p-4 transition-colors bg-background shadow-lg touch-manipulation ${
        isOver ? 'border-primary bg-primary/20 border-4' : 'border-border'
      }`}
      style={{ 
        maxHeight: '40vh',
        minHeight: '140px' // Altura mínima reduzida para mobile
      }}
    >
      {items.length > 0 ? (
        <SortableContext
          items={items.map((item) => item.id)}
          strategy={rectSortingStrategy}
        >
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-4 overflow-y-auto" style={{ maxHeight: 'calc(40vh - 2rem)' }}>
            {items.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        </SortableContext>
      ) : (
        <div className="flex items-center justify-center min-h-[140px] sm:min-h-[180px] text-muted-foreground px-4">
          <p className="text-xs sm:text-sm text-center">Arraste itens aqui para removê-los dos tiers</p>
        </div>
      )}
    </div>
  )
}


