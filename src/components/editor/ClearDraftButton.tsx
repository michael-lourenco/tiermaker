'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { RotateCcw } from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'

interface ClearDraftButtonProps {
  onClear: () => void
  lastModified?: number
}

export function ClearDraftButton({ onClear, lastModified }: ClearDraftButtonProps) {
  const { t } = useTranslation()
  const [showDialog, setShowDialog] = useState(false)

  const formatLastModified = (timestamp: number) => {
    const now = Date.now()
    const diff = now - timestamp
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) {
      return `${days} ${days === 1 ? t('editor.timeAgo.daysSingular') : t('editor.timeAgo.days')} ${t('editor.timeAgo.ago')}`
    }
    if (hours > 0) {
      return `${hours} ${hours === 1 ? t('editor.timeAgo.hoursSingular') : t('editor.timeAgo.hours')} ${t('editor.timeAgo.ago')}`
    }
    if (minutes > 0) {
      return `${minutes} ${minutes === 1 ? t('editor.timeAgo.minutesSingular') : t('editor.timeAgo.minutes')} ${t('editor.timeAgo.ago')}`
    }
    return t('editor.timeAgo.now')
  }

  const handleConfirm = () => {
    onClear()
    setShowDialog(false)
  }

  const tooltipText = lastModified
    ? t('editor.restartTooltipWithTime', { time: formatLastModified(lastModified) })
    : t('editor.restartTooltip')

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            onClick={() => setShowDialog(true)}
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
            size="sm"
          >
            <RotateCcw className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
            {t('editor.restart')}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltipText}</p>
        </TooltipContent>
      </Tooltip>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('editor.clearDraftTitle')}</DialogTitle>
            <DialogDescription>
              {t('editor.clearDraftDescription')}
              <br />
              <br />
              {t('editor.clearDraftWarning')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              {t('common.cancel')}
            </Button>
            <Button variant="destructive" onClick={handleConfirm}>
              {t('editor.clearDraftConfirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
