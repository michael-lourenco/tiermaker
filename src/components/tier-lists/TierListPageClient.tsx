'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { TierListView } from './TierListView'
import { useViewTracking } from '@/hooks/useViewTracking'
import type { TierListWithData } from '@/types/tierList.types'

interface TierListPageClientProps {
  tierList: TierListWithData
}

export function TierListPageClient({ tierList }: TierListPageClientProps) {
  // Track view with 30-minute minimum interval validation
  useViewTracking('tier_list', tierList.id)

  return (
    <main className="min-h-screen p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 md:mb-8">
          <Link href="/templates">
            <Button variant="ghost" size="sm">← Back</Button>
          </Link>
        </div>

        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">{tierList.title}</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Created {new Date(tierList.created_at).toLocaleDateString()}
          </p>
        </div>

        <TierListView tierList={tierList} />
      </div>
    </main>
  )
}

