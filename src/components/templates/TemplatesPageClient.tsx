'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { TemplateGrid } from '@/components/templates/TemplateGrid'
import { useTranslation } from '@/hooks/useTranslation'
import type { TemplateWithCategories } from '@/types/template.types'
import { AdSpace } from '@/components/ads/AdSpace'
import { PageWithSidebar } from '@/components/layout/PageWithSidebar'

interface TemplatesPageClientProps {
  templates: TemplateWithCategories[]
  categoryName?: string
}

export function TemplatesPageClient({ templates, categoryName }: TemplatesPageClientProps) {
  const { t } = useTranslation()

  return (
    <main className="min-h-screen p-4 sm:p-6 md:p-8">
      <PageWithSidebar showLeftSidebar={true}>
        <div className="mb-6 md:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">
                {categoryName 
                  ? `${t('templates.categoryFilter')} ${categoryName}` 
                  : t('templates.title')
                }
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                {categoryName 
                  ? `${t('templates.browseDescription')} - ${categoryName}`
                  : t('templates.browseDescription')
                }
              </p>
            </div>
            <Link href="/categories" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full sm:w-auto">{t('templates.browseCategories')}</Button>
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

        {/* Ad Space - Content Bottom */}
        {/* BANNERS DESABILITADOS TEMPORARIAMENTE */}
        {/* <AdSpace position="content-bottom" /> */}
      </PageWithSidebar>
    </main>
  )
}

