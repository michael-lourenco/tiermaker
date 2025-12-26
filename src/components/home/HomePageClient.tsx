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
      <section className="py-20 px-8 bg-gradient-to-b from-background to-muted">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-6xl font-bold mb-4">{t('home.title')}</h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            {t('home.subtitle')}
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/templates">
              <Button size="lg">{t('home.browseTemplates')}</Button>
            </Link>
            <Link href="/create-template">
              <Button size="lg" variant="outline">
                {t('home.createYourOwn')}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Popular Templates */}
      <section className="py-16 px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold mb-8">{t('home.popularTemplates')}</h2>
          {templates.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((template) => (
                <TemplateCard key={template.id} template={template} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
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

