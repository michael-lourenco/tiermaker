'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ShareDialog } from './ShareDialog'
import { getShareMetadata } from '@/lib/share/share.utils'
import type { ShareContentType } from '@/lib/share/share.types'
import { Share2 } from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'
import { useTierListImage } from '@/hooks/useTierListImage'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface ShareButtonProps {
  type: ShareContentType
  data: any
  variant?: 'default' | 'outline' | 'ghost' | 'secondary'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  className?: string
  showDownload?: boolean
  onDownload?: () => void
  tierListElementRef?: React.RefObject<HTMLElement | null>
  /** Só ícone + tooltip (útil em cards estreitos) */
  iconOnly?: boolean
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
  iconOnly = false,
}: ShareButtonProps) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const { generateImage, isGenerating } = useTierListImage({
    quality: '4k',
    onSuccess: () => {
      // Image downloaded successfully
    },
    onError: () => {
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

    if (type === 'tier_list' && tierListElementRef?.current) {
      const cleanTitle = (data.title || 'tier-list')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .substring(0, 50)
      const filename = `${cleanTitle || 'tier-list'}.png`
      await generateImage(tierListElementRef.current, filename)
    }
  }

  const shouldShowDownload = showDownload || type === 'tier_list'
  const label = t('share.title')

  const button = (
    <Button
      variant={variant}
      size={iconOnly ? 'icon' : size}
      onClick={() => setOpen(true)}
      className={className}
      aria-label={label}
    >
      <Share2 className={iconOnly ? 'h-4 w-4' : 'h-4 w-4 mr-2'} />
      {!iconOnly && <span className="hidden sm:inline">{label}</span>}
    </Button>
  )

  return (
    <>
      {iconOnly ? (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>{button}</TooltipTrigger>
            <TooltipContent>
              <p>{label}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : (
        button
      )}
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
