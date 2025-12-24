import Image from 'next/image'
import type { TierListWithData } from '@/types/tierList.types'
import { TIER_COLORS } from '@/lib/constants/tiers'

interface TierListViewProps {
  tierList: TierListWithData
}

export function TierListView({ tierList }: TierListViewProps) {
  const getItemsForTier = (tierName: string) => {
    return tierList.items
      .filter((item) => item.tier_name === tierName)
      .sort((a, b) => a.order - b.order)
  }

  return (
    <div className="space-y-4">
      {tierList.tiers
        .sort((a, b) => a.tier_order - b.tier_order)
        .map((tier) => {
          const items = getItemsForTier(tier.tier_name)
          return (
            <div
              key={tier.id}
              className="border-2 rounded-lg p-4 min-h-[150px]"
              style={{
                backgroundColor: tier.color ? `${tier.color}20` : undefined,
                borderColor: tier.color || undefined,
              }}
            >
              <h3
                className="text-xl font-bold mb-4 text-center"
                style={{ color: tier.color || undefined }}
              >
                {tier.tier_name}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="relative aspect-square rounded-lg overflow-hidden border"
                  >
                    <Image
                      src={item.template_item.image_url}
                      alt={item.template_item.name}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white p-2 text-xs text-center">
                      {item.template_item.name}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
    </div>
  )
}

