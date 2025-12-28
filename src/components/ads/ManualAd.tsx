'use client'

import Link from 'next/link'
import Image from 'next/image'
import type { AdSpace } from '@/types/adSpace.types'

interface ManualAdProps {
  adSpace: AdSpace
  className?: string
}

export function ManualAd({ adSpace, className }: ManualAdProps) {
  if (!adSpace.manual_image_url) {
    return null
  }

  const content = (
    <div className={className}>
      <Image
        src={adSpace.manual_image_url}
        alt={adSpace.manual_alt_text || 'Advertisement'}
        width={728}
        height={90}
        className="w-full h-auto object-contain rounded-lg"
        unoptimized
      />
    </div>
  )

  if (adSpace.manual_link_url) {
    return (
      <Link
        href={adSpace.manual_link_url}
        target="_blank"
        rel="noopener noreferrer"
        className="block hover:opacity-90 transition-opacity"
      >
        {content}
      </Link>
    )
  }

  return content
}

