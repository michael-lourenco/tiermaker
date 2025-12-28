'use client'

import { TemplateCard } from './TemplateCard'
import type { TemplateWithCategories } from '@/types/template.types'
import { AdSpace } from '@/components/ads/AdSpace'

interface TemplateGridProps {
  templates: TemplateWithCategories[]
}

export function TemplateGrid({ templates }: TemplateGridProps) {
  if (templates.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No templates found</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {templates.map((template, index) => (
        <div key={template.id}>
          <TemplateCard template={template} />
          {/* Ad Space - In Feed (a cada 6 cards) */}
          {(index + 1) % 6 === 0 && <AdSpace position="in-feed" className="mt-4" />}
        </div>
      ))}
    </div>
  )
}


