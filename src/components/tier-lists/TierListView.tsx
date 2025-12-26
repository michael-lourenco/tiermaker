'use client'

import type { TierListWithData } from '@/types/tierList.types'
import { TierListRowView } from './TierListRowView'

interface TierListViewProps {
  tierList: TierListWithData
}

export function TierListView({ tierList }: TierListViewProps) {
  const getItemsForTier = (tierName: string) => {
    return tierList.items
      .filter((item) => item.tier_name === tierName)
      .sort((a, b) => a.order - b.order)
  }

  // If no tiers, show a message
  if (!tierList.tiers || tierList.tiers.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>This tier list doesn't have any tiers yet.</p>
      </div>
    )
  }

  return (
    <div className="space-y-0">
      {tierList.tiers
        .sort((a, b) => a.tier_order - b.tier_order)
        .map((tier) => {
          const items = getItemsForTier(tier.tier_name)
          return (
            <TierListRowView
              key={tier.id}
              tier={tier}
              items={items}
            />
          )
        })}
    </div>
  )
}

