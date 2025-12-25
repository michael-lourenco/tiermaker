'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useTranslation } from '@/hooks/useTranslation'
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
                <Card key={template.id} className="hover:shadow-lg transition-shadow overflow-hidden">
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
                    <CardTitle>{template.name}</CardTitle>
                    <CardDescription>{template.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                      {template.categories && template.categories.length > 0 && (
                        <div className="flex gap-1 flex-wrap">
                          {template.categories.map((cat) => (
                            <span key={cat.id} className="px-2 py-1 bg-secondary text-secondary-foreground rounded text-xs">
                              {cat.name}
                            </span>
                          ))}
                        </div>
                      )}
                      <span className="ml-auto">{template.views_count} {t('templates.views')}</span>
                    </div>
                  </CardContent>
                  <div className="p-6 pt-0">
                    <Link href={`/templates/${template.id}`}>
                      <Button variant="outline" className="w-full">
                        {t('templates.viewTemplate')}
                      </Button>
                    </Link>
                  </div>
                </Card>
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

