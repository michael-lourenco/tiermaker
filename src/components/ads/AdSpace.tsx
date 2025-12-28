'use client'

import { useEffect, useState } from 'react'
import { AdSpaceService } from '@/services/adSpace.service'
import type { AdSpace as AdSpaceType, AdSpaceDeviceType } from '@/types/adSpace.types'
import { ManualAd } from './ManualAd'
import { GoogleAd } from './GoogleAd'
import { AdPlaceholder } from './AdPlaceholder'
import { useDeviceType } from '@/hooks/useDeviceType'
import { cn } from '@/lib/utils/cn'

interface AdSpaceProps {
  position: string
  className?: string
  wrapperClassName?: string
}

export function AdSpace({ position, className, wrapperClassName }: AdSpaceProps) {
  const [adSpace, setAdSpace] = useState<AdSpaceType | null>(null)
  const [loading, setLoading] = useState(true)
  const deviceType = useDeviceType()

  useEffect(() => {
    const loadAdSpace = async () => {
      try {
        const service = new AdSpaceService()
        const deviceTypeForQuery: AdSpaceDeviceType = deviceType === 'desktop' ? 'desktop' : 'mobile'
        const space = await service.getAdSpaceByPosition(position, deviceTypeForQuery)
        setAdSpace(space)
      } catch (error) {
        console.error('Error loading ad space:', error)
        setAdSpace(null)
      } finally {
        setLoading(false)
      }
    }

    loadAdSpace()
  }, [position, deviceType])

  if (loading) {
    return null
  }

  if (!adSpace || !adSpace.is_active) {
    return <AdPlaceholder className={className} />
  }

  const adContent =
    adSpace.ad_type === 'manual' ? (
      <ManualAd adSpace={adSpace} className={className} />
    ) : (
      <GoogleAd adSpace={adSpace} className={className} />
    )

  return (
    <div className={cn('flex justify-center items-center my-4', wrapperClassName)}>
      {adContent}
    </div>
  )
}


