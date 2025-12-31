'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Card } from '@/components/ui/card'
import type { TemplateWithCategories } from '@/types/template.types'
import { Eye } from 'lucide-react'

interface TemplateCardProps {
  template: TemplateWithCategories
}

export function TemplateCard({ template }: TemplateCardProps) {
  return (
    <Link href={`/templates/${template.id}`}>
      <Card className="group relative overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border-2 hover:border-primary">
        <div className="relative w-full aspect-video">
          {template.cover_image_url ? (
            <Image
              src={template.cover_image_url}
              alt={template.name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover transition-transform duration-300 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <span className="text-muted-foreground text-sm">No image</span>
            </div>
          )}
          
          {/* Overlay gradient for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Category - Top Left */}
          {template.categories && template.categories.length > 0 && (
            <div className="absolute top-2 left-2 z-10">
              <span className="px-2 py-1 bg-primary/90 text-primary-foreground rounded text-xs font-medium backdrop-blur-sm">
                {template.categories[0].name}
              </span>
            </div>
          )}
          
          {/* Views - Top Right */}
          <div className="absolute top-2 right-2 z-10 flex items-center gap-1 px-2 py-1 bg-black/60 text-white rounded text-xs font-medium backdrop-blur-sm">
            <Eye className="h-3 w-3" />
            <span>{template.views_count}</span>
          </div>
          
          {/* Title - Bottom */}
          <div className="absolute bottom-0 left-0 right-0 z-10 p-3 bg-black/60 backdrop-blur-sm">
            <h3 className="text-white font-semibold text-sm line-clamp-2 drop-shadow-lg">
              {template.name}
            </h3>
          </div>
        </div>
      </Card>
    </Link>
  )
}
