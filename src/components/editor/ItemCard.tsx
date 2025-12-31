'use client'

import { useState, useEffect } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import Image from 'next/image'
import type { TemplateItem } from '@/types/template.types'

interface ItemCardProps {
  item: TemplateItem
  showItemName?: boolean
}

const FIXED_HEIGHT = 100 // Altura fixa em pixels

export function ItemCard({ item, showItemName = false }: ItemCardProps) {
  const [containerWidth, setContainerWidth] = useState<number>(FIXED_HEIGHT) // Default to square

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id })

  // Load image to get natural dimensions
  useEffect(() => {
    const img = new window.Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const width = img.naturalWidth
      const height = img.naturalHeight
      
      // Calculate width based on fixed height and image aspect ratio
      const aspectRatio = width / height
      const calculatedWidth = FIXED_HEIGHT * aspectRatio
      setContainerWidth(calculatedWidth)
    }
    img.onerror = () => {
      // Fallback to square if image fails to load
      setContainerWidth(FIXED_HEIGHT)
    }
    img.src = item.image_url
  }, [item.image_url])

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    width: `${containerWidth}px`,
    height: `${FIXED_HEIGHT}px`,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="relative flex-shrink-0 rounded-lg overflow-hidden border cursor-grab active:cursor-grabbing hover:shadow-lg transition-shadow touch-manipulation"
    >
      <Image
        src={item.image_url}
        alt={item.name}
        width={containerWidth}
        height={FIXED_HEIGHT}
        className="object-contain w-full h-full"
      />
      {showItemName && (
        <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm text-white p-1 sm:p-2 text-[10px] sm:text-xs text-center line-clamp-1">
          {item.name}
        </div>
      )}
    </div>
  )
}

