'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { ShareButton } from '@/components/share/ShareButton'
import { TemplateItemCard } from './TemplateItemCard'
import { useTranslation } from '@/hooks/useTranslation'
import { useViewTracking } from '@/hooks/useViewTracking'
import { AdSpace } from '@/components/ads/AdSpace'
import { PageWithSidebar } from '@/components/layout/PageWithSidebar'
import type { TemplateWithItemsAndCategories } from '@/types/template.types'

interface TemplatePageClientProps {
  template: TemplateWithItemsAndCategories
}

export function TemplatePageClient({ template }: TemplatePageClientProps) {
  const { t } = useTranslation()
  
  // Track view with 30-minute minimum interval validation
  useViewTracking('template', template.id)

  return (
    <main className="min-h-screen p-4 sm:p-6 md:p-8">
      <PageWithSidebar showRightSidebar={true}>
        <div className="mb-6 md:mb-8">
          <div className="flex items-center justify-between mb-4">
            <Link href="/templates">
              <Button variant="ghost" size="sm">{t('template.backToTemplates')}</Button>
            </Link>
            <ShareButton type="template" data={template} />
          </div>
        </div>

        {/* Ad Space - Content Top */}
        <AdSpace position="content-top" />

        {template.cover_image_url && (
          <div className="relative w-full h-48 sm:h-64 md:h-96 rounded-lg overflow-hidden mb-6 md:mb-8">
            <Image
              src={template.cover_image_url}
              alt={template.name}
              fill
              sizes="(max-width: 768px) 100vw, 80vw"
              className="object-cover"
            />
          </div>
        )}

        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">{template.name}</h1>
          {template.description && (
            <p className="text-sm sm:text-base md:text-lg text-muted-foreground">{template.description}</p>
          )}
          <div className="flex items-center gap-2 sm:gap-4 mt-3 md:mt-4">
            {template.categories && template.categories.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {template.categories.map((cat) => (
                  <span
                    key={cat.id}
                    className="px-2 py-1 bg-secondary text-secondary-foreground rounded text-xs sm:text-sm"
                  >
                    {cat.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Ad Space - Content Middle */}
        <AdSpace position="content-middle" />

        <div className="flex flex-wrap gap-3 sm:gap-4 mb-6 md:mb-8">
          {template.items.map((item) => (
            <TemplateItemCard key={item.id} item={item} />
          ))}
        </div>

        <div className="flex justify-center px-4 mb-6 md:mb-8">
          <Link href={`/editor/${template.id}`} className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto">{t('template.createTierList')}</Button>
          </Link>
        </div>

        {/* Ad Space - Content Bottom */}
        <AdSpace position="content-bottom" />
      </PageWithSidebar>
    </main>
  )
}

