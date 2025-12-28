'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import type { TemplateItem } from '@/types/template.types'

interface TemplateItemCardProps {
  item: TemplateItem
}

const FIXED_HEIGHT = 150 // Altura fixa em pixels (maior que no editor para melhor visualização)

export function TemplateItemCard({ item }: TemplateItemCardProps) {
  const [containerWidth, setContainerWidth] = useState<number>(FIXED_HEIGHT) // Default to square

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

  return (
    <div
      className="relative flex-shrink-0 rounded-lg overflow-hidden border"
      style={{
        width: `${containerWidth}px`,
        height: `${FIXED_HEIGHT}px`,
      }}
    >
      <Image
        src={item.image_url}
        alt={item.name}
        width={containerWidth}
        height={FIXED_HEIGHT}
        className="object-contain w-full h-full"
      />
      <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white p-1.5 sm:p-2 text-xs sm:text-sm text-center">
        {item.name}
      </div>
    </div>
  )
}


