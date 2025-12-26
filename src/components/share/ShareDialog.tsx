'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { SharePlatformButton } from './SharePlatformButton'
import { useShare } from '@/hooks/useShare'
import { sharePlatforms } from '@/lib/share/platforms'
import type { ShareData, SharePlatform } from '@/lib/share/share.types'
import { useTranslation } from '@/hooks/useTranslation'
import { Copy, Check } from 'lucide-react'

interface ShareDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  data: ShareData
  showDownload?: boolean
  onDownload?: () => void
  isGenerating?: boolean
}

export function ShareDialog({ open, onOpenChange, data, showDownload = false, onDownload, isGenerating = false }: ShareDialogProps) {
  const { t } = useTranslation()
  const [linkCopied, setLinkCopied] = useState(false)
  const { shareToPlatform, canUseWebShare } = useShare(data, {
    onSuccess: () => {
      if (linkCopied) {
        setTimeout(() => setLinkCopied(false), 2000)
      }
    },
  })

  const handleCopyLink = async () => {
    await shareToPlatform('copy')
    setLinkCopied(true)
    setTimeout(() => setLinkCopied(false), 2000)
  }

  const handlePlatformClick = async (platform: SharePlatform) => {
    if (platform === 'copy') {
      await handleCopyLink()
      return
    }
    if (platform === 'web') {
      await shareToPlatform('web')
      return
    }
    await shareToPlatform(platform)
  }

  // Filter platforms - show web share on mobile if available
  let availablePlatforms = [...sharePlatforms]

  // Add web share if available (only on mobile)
  if (canUseWebShare && !availablePlatforms.find((p) => p.id === 'web')) {
    availablePlatforms = [
      {
        id: 'web',
        name: t('share.webShare'),
        icon: 'web',
        generateUrl: () => '',
      },
      ...availablePlatforms,
    ]
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('share.title')}</DialogTitle>
          <DialogDescription>{t('share.shareTo')}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Copy Link Section */}
          <div className="space-y-2">
            <label className="text-sm font-medium">{t('share.copyLink')}</label>
            <div className="flex gap-2">
              <Input
                value={data.url}
                readOnly
                className="flex-1 font-mono text-sm"
                onClick={(e) => (e.target as HTMLInputElement).select()}
              />
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopyLink}
                className="shrink-0"
                aria-label={t('share.copyLink')}
              >
                {linkCopied ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            {linkCopied && (
              <p className="text-xs text-green-600">{t('share.linkCopied')}</p>
            )}
          </div>

          {/* Platform Buttons */}
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {availablePlatforms.map((platform) => (
              <SharePlatformButton
                key={platform.id}
                platform={platform.id as SharePlatform}
                name={platform.name}
                onClick={() => handlePlatformClick(platform.id as SharePlatform)}
              />
            ))}
          </div>

          {/* Download Image Button (only for tier lists) */}
          {showDownload && onDownload && (
            <div className="pt-2 border-t">
              <Button
                variant="outline"
                className="w-full"
                onClick={onDownload}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    {t('share.generatingImage')}
                  </>
                ) : (
                  t('share.downloadImage')
                )}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

