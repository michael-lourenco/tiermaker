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

// Altura fixa: menor no mobile, maior no desktop
const FIXED_HEIGHT_MOBILE = 70
const FIXED_HEIGHT_DESKTOP = 100

export function ItemCard({ item, showItemName = false }: ItemCardProps) {
  const [containerWidth, setContainerWidth] = useState<number>(FIXED_HEIGHT_DESKTOP) // Default to desktop
  const [fixedHeight, setFixedHeight] = useState<number>(FIXED_HEIGHT_DESKTOP)

  // Detectar se é mobile
  useEffect(() => {
    const updateHeight = () => {
      const isMobile = window.innerWidth < 640 // sm breakpoint
      const height = isMobile ? FIXED_HEIGHT_MOBILE : FIXED_HEIGHT_DESKTOP
      setFixedHeight(height)
    }
    
    updateHeight()
    window.addEventListener('resize', updateHeight)
    return () => window.removeEventListener('resize', updateHeight)
  }, [])

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
      const calculatedWidth = fixedHeight * aspectRatio
      setContainerWidth(calculatedWidth)
    }
    img.onerror = () => {
      // Fallback to square if image fails to load
      setContainerWidth(fixedHeight)
    }
    img.src = item.image_url
  }, [item.image_url, fixedHeight])

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    width: `${containerWidth}px`,
    height: `${fixedHeight}px`,
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
        height={fixedHeight}
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

