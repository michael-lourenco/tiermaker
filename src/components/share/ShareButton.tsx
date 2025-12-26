'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ShareDialog } from './ShareDialog'
import { getShareMetadata } from '@/lib/share/share.utils'
import type { ShareContentType } from '@/lib/share/share.types'
import { Share2 } from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'

interface ShareButtonProps {
  type: ShareContentType
  data: any
  variant?: 'default' | 'outline' | 'ghost' | 'secondary'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  className?: string
  showDownload?: boolean
  onDownload?: () => void
}

export function ShareButton({
  type,
  data,
  variant = 'outline',
  size = 'sm',
  className,
  showDownload = false,
  onDownload,
}: ShareButtonProps) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)

  const metadata = getShareMetadata(type, data)
  const shareData = {
    type,
    id: data.id,
    title: metadata.title,
    description: metadata.description,
    image: metadata.image,
    url: metadata.url,
    metadata: data,
  }

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={() => setOpen(true)}
        className={className}
        aria-label={t('share.title')}
      >
        <Share2 className="h-4 w-4 mr-2" />
        <span className="hidden sm:inline">{t('share.title')}</span>
      </Button>
      <ShareDialog
        open={open}
        onOpenChange={setOpen}
        data={shareData}
        showDownload={showDownload}
        onDownload={onDownload}
      />
    </>
  )
}

