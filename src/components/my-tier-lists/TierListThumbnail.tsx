'use client'

import { TierListThumbnailItemCard } from './TierListThumbnailItemCard'
import type { TierListWithData } from '@/types/tierList.types'

interface TierListThumbnailProps {
  tierList: TierListWithData
  className?: string
}

export function TierListThumbnail({ tierList, className = '' }: TierListThumbnailProps) {
  const getItemsForTier = (tierName: string) => {
    return tierList.items
      .filter((item) => item.tier_name === tierName)
      .sort((a, b) => a.order - b.order)
      .slice(0, 6) // Limit to 6 items per tier for thumbnail
  }

  // If no tiers, show placeholder
  if (!tierList.tiers || tierList.tiers.length === 0) {
    return (
      <div className={`w-full h-full bg-muted flex items-center justify-center ${className}`}>
        <p className="text-muted-foreground text-sm">No tiers</p>
      </div>
    )
  }

  const sortedTiers = tierList.tiers.sort((a, b) => a.tier_order - b.tier_order)

  return (
    <div className={`w-full h-full bg-background overflow-hidden ${className}`}>
      <div className="space-y-1 p-2">
        {sortedTiers.slice(0, 4).map((tier) => {
          const items = getItemsForTier(tier.tier_name)
          return (
            <div
              key={tier.id}
              className="flex items-center gap-1 rounded border"
              style={{
                backgroundColor: tier.color ? `${tier.color}15` : undefined,
                borderColor: tier.color || undefined,
                minHeight: '60px',
              }}
            >
              {/* Tier Label */}
              <div
                className="flex-shrink-0 w-20 px-2 py-1 text-center"
                style={{
                  backgroundColor: tier.color ? `${tier.color}30` : undefined,
                }}
              >
                <h4
                  className="text-xs font-bold truncate"
                  style={{ color: tier.color || undefined }}
                >
                  {tier.tier_name}
                </h4>
              </div>

              {/* Items Grid */}
              <div className="flex-1 flex gap-1 p-1 overflow-hidden">
                {items.length > 0 ? (
                  items.map((item) => (
                    <TierListThumbnailItemCard key={item.id} item={item} />
                  ))
                ) : (
                  <div className="flex-1 flex items-center justify-center">
                    <span className="text-xs text-muted-foreground">Empty</span>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}



