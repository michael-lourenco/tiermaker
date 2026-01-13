'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ShareButton } from '@/components/share/ShareButton'
import { useTranslation } from '@/hooks/useTranslation'
import { PageWithSidebar } from '@/components/layout/PageWithSidebar'
import { AdSpace } from '@/components/ads/AdSpace'

interface CategoriesPageClientProps {
  categories: Array<{ category: string; count: number; category_id?: string; image_url?: string | null }>
}

export function CategoriesPageClient({ categories }: CategoriesPageClientProps) {
  const { t } = useTranslation()

  return (
    <main className="min-h-screen p-4 sm:p-6 md:p-8">
      <PageWithSidebar showLeftSidebar={true}>
        <div className="mb-6 md:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">{t('categories.title')}</h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                {t('categories.description')}
              </p>
            </div>
            <ShareButton type="category" data={{}} />
          </div>
        </div>

        {categories.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {categories.map(({ category, count, category_id, image_url }) => (
              <Link 
                key={category_id || category} 
                href={category_id 
                  ? `/templates?category_id=${encodeURIComponent(category_id)}`
                  : `/templates?category=${encodeURIComponent(category)}`
                }
              >
                <Card className="group relative overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border-2 hover:border-primary">
                  <div className="relative w-full aspect-video">
                    {image_url ? (
                      <Image
                        src={image_url}
                        alt={category}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
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
                    <div className="absolute bottom-0 left-0 right-0 z-10 p-3 bg-black/60 backdrop-blur-sm">
                      <h3 className="text-white font-semibold text-sm line-clamp-2 drop-shadow-lg">
                        {category}
                      </h3>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 md:py-12 px-4">
            <p className="text-muted-foreground mb-4">
              {t('categories.noCategories')}
            </p>
            <Link href="/create-template">
              <Button>{t('home.createFirstTemplate')}</Button>
            </Link>
          </div>
        )}

        {/* Ad Space - Content Bottom */}
        {/* BANNERS DESABILITADOS TEMPORARIAMENTE */}
        {/* <AdSpace position="content-bottom" /> */}
      </PageWithSidebar>
    </main>
  )
}

