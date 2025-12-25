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
      className={`border-2 border-dashed rounded-lg p-4 min-h-[200px] transition-colors ${
        isOver ? 'border-primary bg-primary/20 border-4' : 'border-border'
      }`}
    >
      <h3 className="text-lg font-semibold mb-4">Unassigned</h3>
      <SortableContext
        items={items.map((item) => item.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {items.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      </SortableContext>
    </div>
  )
}


