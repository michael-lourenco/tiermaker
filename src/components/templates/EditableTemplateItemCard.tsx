'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Input } from '@/components/ui/input'
import { X } from 'lucide-react'

interface EditableTemplateItemCardProps {
  item: {
    id: string
    name: string
    preview: string
  }
  onRemove: (id: string) => void
  onNameChange: (id: string, name: string) => void
}

const FIXED_HEIGHT = 150 // Altura fixa em pixels (mesma da página de template)

export function EditableTemplateItemCard({ item, onRemove, onNameChange }: EditableTemplateItemCardProps) {
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
    img.src = item.preview
  }, [item.preview])

  return (
    <div className="relative group">
      <div
        className="relative rounded-lg overflow-hidden border"
        style={{
          width: `${containerWidth}px`,
          height: `${FIXED_HEIGHT}px`,
        }}
      >
        <Image
          src={item.preview}
          alt={item.name}
          width={containerWidth}
          height={FIXED_HEIGHT}
          className="object-contain w-full h-full"
        />
        <button
          type="button"
          onClick={() => onRemove(item.id)}
          className="absolute top-2 right-2 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <Input
        value={item.name}
        onChange={(e) => onNameChange(item.id, e.target.value)}
        className="mt-2 text-sm"
        placeholder="Item name"
      />
    </div>
  )
}


