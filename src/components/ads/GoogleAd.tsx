'use client'

import { useEffect, useRef } from 'react'
import Script from 'next/script'
import type { AdSpace } from '@/types/adSpace.types'

// Declare Google AdSense types
declare global {
  interface Window {
    adsbygoogle?: Array<Record<string, unknown>>
  }
}

interface GoogleAdProps {
  adSpace: AdSpace
  className?: string
}

export function GoogleAd({ adSpace, className }: GoogleAdProps) {
  const adRef = useRef<HTMLDivElement>(null)
  const adLoadedRef = useRef(false)

  useEffect(() => {
    if (
      !adSpace.google_ad_client ||
      !adSpace.google_ad_slot ||
      adLoadedRef.current ||
      !adRef.current
    ) {
      return
    }

    // Wait for adsbygoogle to be available
    const checkAndLoad = () => {
      try {
        // @ts-ignore - Google AdSense script
        if (window.adsbygoogle && !adLoadedRef.current) {
          // @ts-ignore
          window.adsbygoogle.push({})
          adLoadedRef.current = true
        } else if (!window.adsbygoogle) {
          // Retry after a short delay if adsbygoogle is not loaded yet
          setTimeout(checkAndLoad, 100)
        }
      } catch (error) {
        console.error('Error loading Google Ad:', error)
      }
    }

    checkAndLoad()
  }, [adSpace.google_ad_client, adSpace.google_ad_slot])

  if (!adSpace.google_ad_client || !adSpace.google_ad_slot) {
    return null
  }

  return (
    <>
      <Script
        async
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adSpace.google_ad_client}`}
        crossOrigin="anonymous"
        strategy="lazyOnload"
      />
      <div className={className} ref={adRef}>
        <ins
          className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-client={adSpace.google_ad_client}
          data-ad-slot={adSpace.google_ad_slot}
          data-ad-format={adSpace.google_ad_format || 'auto'}
          data-full-width-responsive="true"
        />
      </div>
    </>
  )
}

