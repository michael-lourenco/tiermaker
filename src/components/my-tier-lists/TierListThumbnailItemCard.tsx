'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import type { TierListItem } from '@/types/tierList.types'
import type { TemplateItem } from '@/types/template.types'

interface TierListThumbnailItemCardProps {
  item: TierListItem & { template_item: TemplateItem }
}

const FIXED_HEIGHT = 48 // Altura fixa em pixels (mesma do thumbnail atual)

export function TierListThumbnailItemCard({ item }: TierListThumbnailItemCardProps) {
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
    img.src = item.template_item.image_url
  }, [item.template_item.image_url])

  return (
    <div
      className="relative flex-shrink-0 rounded overflow-hidden border"
      style={{
        width: `${containerWidth}px`,
        height: `${FIXED_HEIGHT}px`,
      }}
    >
      <Image
        src={item.template_item.image_url}
        alt={item.template_item.name}
        width={containerWidth}
        height={FIXED_HEIGHT}
        className="object-contain w-full h-full"
      />
    </div>
  )
}

