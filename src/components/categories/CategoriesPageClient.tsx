'use client'

import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useTranslation } from '@/hooks/useTranslation'

interface CategoriesPageClientProps {
  categories: Array<{ category: string; count: number; category_id?: string }>
}

export function CategoriesPageClient({ categories }: CategoriesPageClientProps) {
  const { t } = useTranslation()

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">{t('categories.title')}</h1>
          <p className="text-muted-foreground">
            {t('categories.description')}
          </p>
        </div>

        {categories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {categories.map(({ category, count, category_id }) => (
              <Link 
                key={category_id || category} 
                href={category_id 
                  ? `/templates?category_id=${encodeURIComponent(category_id)}`
                  : `/templates?category=${encodeURIComponent(category)}`
                }
              >
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <div className="p-6 text-center">
                    <h3 className="text-xl font-semibold mb-2">{category}</h3>
                    <p className="text-sm text-muted-foreground">
                      {count} {count !== 1 ? t('categories.templates') : t('categories.template')}
                    </p>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
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

