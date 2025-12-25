'use client'

import Link from 'next/link'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useTranslation } from '@/hooks/useTranslation'
import type { TierList } from '@/types/tierList.types'

interface MyTierListsPageClientProps {
  tierLists: TierList[]
}

export function MyTierListsPageClient({ tierLists }: MyTierListsPageClientProps) {
  const { t } = useTranslation()

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">{t('myTierLists.title')}</h1>
          <p className="text-muted-foreground">
            {t('myTierLists.createFirst')}
          </p>
        </div>

        {tierLists.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">{t('myTierLists.noTierLists')}</p>
            <Link href="/templates">
              <Button>{t('home.browseTemplates')}</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tierLists.map((tierList) => (
              <Card key={tierList.id}>
                <CardHeader>
                  <CardTitle>{tierList.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {new Date(tierList.created_at).toLocaleDateString()}
                  </p>
                </CardContent>
                <CardFooter>
                  <Link href={`/tier-lists/${tierList.id}`} className="w-full">
                    <Button variant="outline" className="w-full">
                      {t('common.view') || 'View'}
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

