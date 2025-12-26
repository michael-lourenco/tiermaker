'use client'

import Image from 'next/image'
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
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-6 gap-1.5 sm:gap-2 min-h-[84px]">
          {items.length > 0 ? (
            items.map((item) => (
              <div
                key={item.id}
                className="relative aspect-square rounded-lg overflow-hidden border"
              >
                <Image
                  src={item.template_item.image_url}
                  alt={item.template_item.name}
                  fill
                  sizes="(max-width: 640px) 33vw, (max-width: 768px) 25vw, (max-width: 1200px) 16vw, 12vw"
                  className="object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white p-1 sm:p-2 text-[10px] sm:text-xs text-center line-clamp-1">
                  {item.template_item.name}
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center text-muted-foreground py-2 flex items-center justify-center">
              <span className="text-xs">Nenhum item neste tier</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

