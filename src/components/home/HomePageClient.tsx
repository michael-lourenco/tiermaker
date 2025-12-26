'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useTranslation } from '@/hooks/useTranslation'
import { TemplateCard } from '@/components/templates/TemplateCard'
import type { TemplateWithCategories } from '@/types/template.types'

interface HomePageClientProps {
  templates: TemplateWithCategories[]
}

export function HomePageClient({ templates }: HomePageClientProps) {
  const { t } = useTranslation()

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="py-12 px-4 md:py-20 md:px-8 bg-gradient-to-b from-background to-muted">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 md:mb-4">{t('home.title')}</h1>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-6 md:mb-8 max-w-2xl mx-auto px-2">
            {t('home.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
            <Link href="/templates" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto">{t('home.browseTemplates')}</Button>
            </Link>
            <Link href="/create-template" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                {t('home.createYourOwn')}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Popular Templates */}
      <section className="py-8 px-4 md:py-16 md:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4 md:mb-8 px-2">{t('home.popularTemplates')}</h2>
          {templates.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {templates.map((template) => (
                <TemplateCard key={template.id} template={template} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 md:py-12 px-4">
              <p className="text-muted-foreground mb-4">
                {t('home.noTemplates')}
              </p>
              <Link href="/create-template">
                <Button>{t('home.createFirstTemplate')}</Button>
              </Link>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}

