'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import Image from 'next/image'
import type { TemplateItem } from '@/types/template.types'

interface ItemCardProps {
  item: TemplateItem
}

export function ItemCard({ item }: ItemCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="relative aspect-square rounded-lg overflow-hidden border cursor-grab active:cursor-grabbing hover:shadow-lg transition-shadow touch-manipulation"
    >
      <Image
        src={item.image_url}
        alt={item.name}
        fill
        sizes="(max-width: 640px) 33vw, (max-width: 768px) 25vw, (max-width: 1200px) 16vw, 12vw"
        className="object-cover"
      />
      <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white p-1 sm:p-2 text-[10px] sm:text-xs text-center line-clamp-1">
        {item.name}
      </div>
    </div>
  )
}

