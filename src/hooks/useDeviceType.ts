'use client'

import { useState, useEffect } from 'react'

export type DeviceType = 'desktop' | 'mobile'

export function useDeviceType(): DeviceType {
  const [deviceType, setDeviceType] = useState<DeviceType>('desktop')

  useEffect(() => {
    const checkDeviceType = () => {
      if (typeof window !== 'undefined') {
        setDeviceType(window.innerWidth >= 768 ? 'desktop' : 'mobile')
      }
    }

    checkDeviceType()
    window.addEventListener('resize', checkDeviceType)

    return () => {
      window.removeEventListener('resize', checkDeviceType)
    }
  }, [])

  return deviceType
}

