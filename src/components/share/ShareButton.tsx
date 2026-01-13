'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { ShareDialog } from './ShareDialog'
import { getShareMetadata } from '@/lib/share/share.utils'
import type { ShareContentType } from '@/lib/share/share.types'
import { Share2 } from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'
import { useTierListImage } from '@/hooks/useTierListImage'
import { useSubscription } from '@/hooks/useSubscription'

interface ShareButtonProps {
  type: ShareContentType
  data: any
  variant?: 'default' | 'outline' | 'ghost' | 'secondary'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  className?: string
  showDownload?: boolean
  onDownload?: () => void
  tierListElementRef?: React.RefObject<HTMLElement | null>
}

export function ShareButton({
  type,
  data,
  variant = 'outline',
  size = 'sm',
  className,
  showDownload = false,
  onDownload,
  tierListElementRef,
}: ShareButtonProps) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const { isPremium } = useSubscription()
  const { generateImage, isGenerating } = useTierListImage({
    isPremium: isPremium,
    quality: isPremium ? '4k' : 'standard',
    onSuccess: () => {
      // Image downloaded successfully
    },
    onError: (error) => {
      // Erro ao gerar imagem - silencioso
    },
  })

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

  const handleDownload = async () => {
    if (onDownload) {
      onDownload()
      return
    }

    // For tier lists, generate image from element
    if (type === 'tier_list' && tierListElementRef?.current) {
      // Create a clean filename from the tier list title
      const cleanTitle = (data.title || 'tier-list')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .substring(0, 50) // Limit length
      const filename = `${cleanTitle || 'tier-list'}.png`
      await generateImage(tierListElementRef.current, filename)
    }
  }

  // Show download button for tier lists
  const shouldShowDownload = showDownload || type === 'tier_list'

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
        showDownload={shouldShowDownload}
        onDownload={handleDownload}
        isGenerating={isGenerating}
      />
    </>
  )
}

