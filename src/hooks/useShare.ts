/**
 * Hook for sharing functionality
 */

'use client'

import { useState, useCallback } from 'react'
import { copyToClipboard, webShare, canUseWebShare as checkWebShare } from '@/lib/share/share.utils'
import type { ShareData, SharePlatform } from '@/lib/share/share.types'
import { sharePlatforms } from '@/lib/share/platforms'

interface UseShareOptions {
  onSuccess?: () => void
  onError?: (error: Error) => void
}

export function useShare(data: ShareData, options?: UseShareOptions) {
  const [isSharing, setIsSharing] = useState(false)

  const shareToPlatform = useCallback(
    async (platform: SharePlatform) => {
      if (platform === 'copy') {
        setIsSharing(true)
        try {
          const success = await copyToClipboard(data.url)
          if (success) {
            options?.onSuccess?.()
          } else {
            throw new Error('Failed to copy to clipboard')
          }
        } catch (error) {
          options?.onError?.(error as Error)
        } finally {
          setIsSharing(false)
        }
        return
      }

      if (platform === 'web' && checkWebShare()) {
        setIsSharing(true)
        try {
          const success = await webShare(data)
          if (success) {
            options?.onSuccess?.()
          }
        } catch (error) {
          options?.onError?.(error as Error)
        } finally {
          setIsSharing(false)
        }
        return
      }

      // For other platforms, open URL in new window
      const platformConfig = sharePlatforms.find((p) => p.id === platform)
      if (platformConfig) {
        const url = platformConfig.generateUrl(data)
        window.open(url, '_blank', 'noopener,noreferrer')
        options?.onSuccess?.()
      }
    },
    [data, options]
  )

  const copyLink = useCallback(async () => {
    await shareToPlatform('copy')
  }, [shareToPlatform])

  const canUseWebShare = useCallback(() => {
    return checkWebShare()
  }, [])

  return {
    shareToPlatform,
    copyLink,
    canUseWebShare: canUseWebShare(),
    isSharing,
  }
}

