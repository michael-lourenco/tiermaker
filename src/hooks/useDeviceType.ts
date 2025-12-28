'use client'

import { useState, useEffect } from 'react'

export type DeviceType = 'desktop' | 'mobile'

export function useDeviceType(): DeviceType {
  // Initialize with desktop to avoid SSR mismatch and ensure sidebar ads work on first render
  const [deviceType, setDeviceType] = useState<DeviceType>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 768 ? 'desktop' : 'mobile'
    }
    return 'desktop' // Default to desktop for SSR
  })

  useEffect(() => {
    const checkDeviceType = () => {
      if (typeof window !== 'undefined') {
        setDeviceType(window.innerWidth >= 768 ? 'desktop' : 'mobile')
      }
    }

    // Check immediately on mount
    checkDeviceType()
    window.addEventListener('resize', checkDeviceType)

    return () => {
      window.removeEventListener('resize', checkDeviceType)
    }
  }, [])

  return deviceType
}


