'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { Template, TemplateWithCategories } from '@/types/template.types'
import { Eye, Heart } from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'

interface TemplateCardProps {
  template: TemplateWithCategories
}

export function TemplateCard({ template }: TemplateCardProps) {
  const { t } = useTranslation()

  return (
    <Card className="hover:shadow-lg transition-shadow overflow-hidden">
      {template.cover_image_url && (
        <div className="relative w-full h-48">
          <Image
            src={template.cover_image_url}
            alt={template.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover"
          />
        </div>
      )}
      <CardHeader>
        <CardTitle className="line-clamp-2">{template.name}</CardTitle>
        {template.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {template.description}
          </p>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Eye className="h-4 w-4" />
            <span>{template.views_count}</span>
          </div>
          <div className="flex items-center gap-1">
            <Heart className="h-4 w-4" />
            <span>{template.likes_count}</span>
          </div>
          {template.categories && template.categories.length > 0 && (
            <div className="ml-auto flex gap-1 flex-wrap">
              {template.categories.map((cat) => (
                <span key={cat.id} className="px-2 py-1 bg-secondary text-secondary-foreground rounded text-xs">
                  {cat.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Link href={`/templates/${template.id}`} className="w-full">
          <Button variant="outline" className="w-full">
            {t('templates.viewTemplate')}
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
