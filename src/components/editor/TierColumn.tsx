'use client'

import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { ItemCard } from './ItemCard'
import type { TemplateItem } from '@/types/template.types'
import type { TierListTier } from '@/types/tierList.types'

interface TierColumnProps {
  tier: TierListTier
  items: TemplateItem[]
  activeId: string | null
}

export function TierColumn({ tier, items, activeId }: TierColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `tier-${tier.tier_name}`,
  })

  return (
    <div
      ref={setNodeRef}
      className={`border-2 rounded-lg p-4 min-h-[200px] transition-colors ${
        isOver ? 'border-primary bg-primary/20 border-4' : 'border-border'
      }`}
      style={{
        backgroundColor: tier.color ? `${tier.color}20` : undefined,
        borderColor: tier.color || undefined,
      }}
    >
      <h3
        className="text-xl font-bold mb-4 text-center"
        style={{ color: tier.color || undefined }}
      >
        {tier.tier_name}
      </h3>
      <SortableContext
        items={items.map((item) => item.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 min-h-[150px]">
          {items.length > 0 ? (
            items.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))
          ) : (
            <div className="col-span-full text-center text-muted-foreground py-8">
              Drop items here
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  )
}

