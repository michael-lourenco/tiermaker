'use client'

import { TierListItemCard } from './TierListItemCard'
import type { TierListTier } from '@/types/tierList.types'
import type { TierListItem } from '@/types/tierList.types'
import type { TemplateItem } from '@/types/template.types'

interface TierListRowViewProps {
  tier: TierListTier
  items: (TierListItem & { template_item: TemplateItem })[]
}

export function TierListRowView({ tier, items }: TierListRowViewProps) {
  return (
    <div
      className="flex border-2 rounded-lg transition-all"
      style={{
        backgroundColor: tier.color ? `${tier.color}15` : undefined,
        borderColor: tier.color || undefined,
        minHeight: '90px',
      }}
    >
      {/* Tier Label Section - Left Side */}
      <div
        className="flex-shrink-0 w-24 sm:w-32 md:w-48 flex items-center justify-center px-2 sm:px-3 py-1 border-r-2"
        style={{
          borderColor: tier.color || undefined,
          backgroundColor: tier.color ? `${tier.color}30` : undefined,
        }}
      >
        {/* Tier Name - Read-only */}
        <div
          className="w-full font-bold text-sm sm:text-base md:text-xl lg:text-2xl text-center break-words"
          style={{ 
            color: tier.color || undefined,
            lineHeight: '1.2',
            wordWrap: 'break-word',
            overflowWrap: 'break-word',
          }}
        >
          {tier.tier_name}
        </div>
      </div>

      {/* Items Section - Middle */}
      <div className="flex-1 p-1.5 sm:p-2 min-h-[88px]">
        {items.length > 0 ? (
          <div className="flex flex-wrap gap-1.5 sm:gap-2 min-h-[84px]">
            {items.map((item) => (
              <TierListItemCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="w-full text-center text-muted-foreground py-2 flex items-center justify-center min-h-[84px]">
            <span className="text-xs">Nenhum item neste tier</span>
          </div>
        )}
      </div>
    </div>
  )
}

