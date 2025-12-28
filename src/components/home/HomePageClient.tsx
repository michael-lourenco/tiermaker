'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useTranslation } from '@/hooks/useTranslation'
import { TemplateCard } from '@/components/templates/TemplateCard'
import type { TemplateWithCategories } from '@/types/template.types'
import type { Category } from '@/services/category.service'
import { AdSpace } from '@/components/ads/AdSpace'

interface HomePageClientProps {
  templates: TemplateWithCategories[]
  categories: Category[]
}

export function HomePageClient({ templates, categories }: HomePageClientProps) {
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

      {/* Ad Space - Header Top */}
      <AdSpace position="header-top" />

      {/* Categories with Tier Lists */}
      {categories.length > 0 && (
        <section className="py-8 px-4 md:py-16 md:px-8 bg-muted/50">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 md:mb-8 px-2">{t('home.popularCategories')}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {categories.map((category) => (
                <Link 
                  key={category.id} 
                  href={`/templates?category_id=${encodeURIComponent(category.id)}`}
                >
                  <Card className="group relative overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border-2 hover:border-primary">
                    <div className="relative w-full aspect-video">
                      {category.image_url ? (
                        <Image
                          src={category.image_url}
                          alt={category.name}
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
                      
                      {/* Title - Bottom */}
                      <div className="absolute bottom-0 left-0 right-0 z-10 p-3">
                        <h3 className="text-white font-semibold text-sm line-clamp-2 drop-shadow-lg">
                          {category.name}
                        </h3>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Ad Space - Content Middle */}
      <AdSpace position="content-middle" />

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

