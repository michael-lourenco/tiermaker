'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { TemplateGrid } from '@/components/templates/TemplateGrid'
import { useTranslation } from '@/hooks/useTranslation'
import type { TemplateWithCategories } from '@/types/template.types'

interface TemplatesPageClientProps {
  templates: TemplateWithCategories[]
  categoryName?: string
}

export function TemplatesPageClient({ templates, categoryName }: TemplatesPageClientProps) {
  const { t } = useTranslation()

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">
                {categoryName 
                  ? `${t('templates.categoryFilter')} ${categoryName}` 
                  : t('templates.title')
                }
              </h1>
              <p className="text-muted-foreground">
                {categoryName 
                  ? `${t('templates.browseDescription')} - ${categoryName}`
                  : t('templates.browseDescription')
                }
              </p>
            </div>
            <Link href="/categories">
              <Button variant="outline">{t('templates.browseCategories')}</Button>
            </Link>
          </div>
          {categoryName && (
            <div className="mb-4">
              <Link href="/templates">
                <Button variant="ghost" size="sm">
                  ← {t('templates.clearFilter')}
                </Button>
              </Link>
            </div>
          )}
        </div>
        <TemplateGrid templates={templates} />
      </div>
    </main>
  )
}

