'use client'

import { useCallback, useState } from 'react'
import Cropper, { type Area } from 'react-easy-crop'
import { Button } from '@/components/ui/button'
import { getCroppedImageBlob } from '@/lib/utils/cropImage'
import { COVER_ASPECT_RATIO } from '@/lib/utils/coverAspect'
import { useTranslation } from '@/hooks/useTranslation'

interface CoverImageCropDialogProps {
  imageSrc: string
  open: boolean
  onCancel: () => void
  onConfirm: (file: File) => void
}

export function CoverImageCropDialog({
  imageSrc,
  open,
  onCancel,
  onConfirm,
}: CoverImageCropDialogProps) {
  const { t } = useTranslation()
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
  const [busy, setBusy] = useState(false)

  const onCropComplete = useCallback((_area: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels)
  }, [])

  if (!open) return null

  const handleConfirm = async () => {
    if (!croppedAreaPixels) return
    setBusy(true)
    try {
      const blob = await getCroppedImageBlob(imageSrc, croppedAreaPixels)
      const file = new File([blob], `cover-${Date.now()}.jpg`, { type: 'image/jpeg' })
      onConfirm(file)
    } catch {
      onCancel()
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-2xl rounded-lg bg-background border shadow-lg overflow-hidden">
        <div className="px-4 py-3 border-b">
          <h2 className="text-base font-semibold">{t('createTemplate.coverCropTitle')}</h2>
          <p className="text-xs text-muted-foreground mt-1">{t('createTemplate.coverCropHint')}</p>
        </div>
        <div className="relative w-full h-64 sm:h-80 bg-muted">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={COVER_ASPECT_RATIO}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>
        <div className="px-4 py-3 space-y-3">
          <label className="flex items-center gap-3 text-sm">
            <span className="w-14 text-muted-foreground">{t('createTemplate.coverCropZoom')}</span>
            <input
              type="range"
              min={1}
              max={3}
              step={0.05}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="flex-1"
            />
          </label>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onCancel} disabled={busy}>
              {t('common.cancel')}
            </Button>
            <Button type="button" onClick={() => void handleConfirm()} disabled={busy || !croppedAreaPixels}>
              {busy ? t('common.loading') : t('createTemplate.coverCropConfirm')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
