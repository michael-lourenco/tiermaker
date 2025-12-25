'use client'

import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { ItemCard } from './ItemCard'
import type { TemplateItem } from '@/types/template.types'

interface UnassignedDropZoneProps {
  items: TemplateItem[]
}

export function UnassignedDropZone({ items }: UnassignedDropZoneProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: 'unassigned',
  })

  return (
    <div
      ref={setNodeRef}
      className={`sticky bottom-0 z-10 border-2 border-dashed rounded-lg p-4 transition-colors bg-background shadow-lg ${
        isOver ? 'border-primary bg-primary/20 border-4' : 'border-border'
      }`}
      style={{ 
        maxHeight: '40vh',
        minHeight: '180px' // Altura mínima para garantir que pelo menos uma linha fique visível
      }}
    >
      {items.length > 0 ? (
        <SortableContext
          items={items.map((item) => item.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 overflow-y-auto" style={{ maxHeight: 'calc(40vh - 2rem)' }}>
            {items.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        </SortableContext>
      ) : (
        <div className="flex items-center justify-center min-h-[180px] text-muted-foreground">
          <p className="text-sm">Arraste itens aqui para removê-los dos tiers</p>
        </div>
      )}
    </div>
  )
}


