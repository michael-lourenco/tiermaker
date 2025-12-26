'use client'

import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ShareButton } from '@/components/share/ShareButton'
import { useTranslation } from '@/hooks/useTranslation'

interface CategoriesPageClientProps {
  categories: Array<{ category: string; count: number; category_id?: string }>
}

export function CategoriesPageClient({ categories }: CategoriesPageClientProps) {
  const { t } = useTranslation()

  return (
    <main className="min-h-screen p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 md:mb-8">
          <div className="flex items-center justify-between mb-4">
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
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {categories.map(({ category, count, category_id }) => (
              <Link 
                key={category_id || category} 
                href={category_id 
                  ? `/templates?category_id=${encodeURIComponent(category_id)}`
                  : `/templates?category=${encodeURIComponent(category)}`
                }
              >
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full active:scale-95 transition-transform">
                  <div className="p-4 sm:p-5 md:p-6 text-center">
                    <h3 className="text-base sm:text-lg md:text-xl font-semibold mb-1 md:mb-2 line-clamp-2">{category}</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      {count} {count !== 1 ? t('categories.templates') : t('categories.template')}
                    </p>
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
      </div>
    </main>
  )
}

