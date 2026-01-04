'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { ShareButton } from '@/components/share/ShareButton'
import { TierListView } from './TierListView'
import { useViewTracking } from '@/hooks/useViewTracking'
import { useTranslation } from '@/hooks/useTranslation'
import { useUserPreferences } from '@/hooks/useUserPreferences'
import { AdSpace } from '@/components/ads/AdSpace'
import { PageWithSidebar } from '@/components/layout/PageWithSidebar'
import type { TierListWithData } from '@/types/tierList.types'

interface TierListPageClientProps {
  tierList: TierListWithData
}

export function TierListPageClient({ tierList }: TierListPageClientProps) {
  const { t } = useTranslation()
  const tierListRef = useRef<HTMLDivElement>(null)
  const { showItemNames, setShowItemNames } = useUserPreferences()
  
  // Track view with 30-minute minimum interval validation
  useViewTracking('tier_list', tierList.id)

  return (
    <main className="min-h-screen p-4 sm:p-6 md:p-8">
      <PageWithSidebar showRightSidebar={true}>
        <div className="mb-6 md:mb-8">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <Link href="/templates">
              <Button variant="ghost" size="sm">← {t('common.back')}</Button>
            </Link>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Label htmlFor="show-item-names-view" className="text-sm cursor-pointer">
                  {t('editor.showItemNames')}
                </Label>
                <Switch
                  id="show-item-names-view"
                  checked={showItemNames}
                  onCheckedChange={setShowItemNames}
                />
              </div>
              <ShareButton 
                type="tier_list" 
                data={tierList} 
                tierListElementRef={tierListRef}
              />
            </div>
          </div>
        </div>

        {/* Ad Space - Content Top */}
        <AdSpace position="content-top" />

        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">{tierList.title}</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            {t('tierList.created')} {new Date(tierList.created_at).toLocaleDateString('pt-BR')}
          </p>
        </div>

        {/* Ad Space - Content Middle */}
        <AdSpace position="content-middle" />

        <div ref={tierListRef} className="w-full">
          <TierListView tierList={tierList} />
        </div>

        {/* Ad Space - Content Bottom */}
        <AdSpace position="content-bottom" />
      </PageWithSidebar>
    </main>
  )
}

