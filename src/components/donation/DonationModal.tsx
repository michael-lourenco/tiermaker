'use client'

import { useState } from 'react'
import { Heart, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useTranslation } from '@/hooks/useTranslation'
import {
  DONATION_DISPLAY_VALUES,
  formatDonationPrice,
  type DonationInterval,
} from '@/lib/stripe/prices'

interface DonationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DonationModal({ open, onOpenChange }: DonationModalProps) {
  const { t } = useTranslation()
  const [loading, setLoading] = useState<DonationInterval | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleDonate = async (interval: DonationInterval) => {
    setLoading(interval)
    setError(null)

    try {
      const response = await fetch('/api/stripe/create-donation-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ interval }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || t('donation.checkoutError'))
      }

      if (data.url) {
        window.location.href = data.url
        return
      }

      throw new Error(t('donation.checkoutError'))
    } catch (err) {
      setError(err instanceof Error ? err.message : t('donation.checkoutError'))
      setLoading(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-primary fill-primary" />
            {t('donation.title')}
          </DialogTitle>
          <DialogDescription className="text-left pt-2 space-y-3">
            <p>{t('donation.description')}</p>
            <p className="text-xs">{t('donation.note')}</p>
          </DialogDescription>
        </DialogHeader>

        {error && (
          <p className="text-sm text-destructive bg-destructive/10 rounded-md p-3">{error}</p>
        )}

        <DialogFooter className="flex-col sm:flex-col gap-2 pt-2">
          <Button
            className="w-full"
            disabled={loading !== null}
            onClick={() => handleDonate('month')}
          >
            {loading === 'month' ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Heart className="h-4 w-4 mr-2" />
            )}
            {t('donation.monthly', {
              price: formatDonationPrice(DONATION_DISPLAY_VALUES.monthly),
            })}
          </Button>
          <Button
            variant="outline"
            className="w-full"
            disabled={loading !== null}
            onClick={() => handleDonate('year')}
          >
            {loading === 'year' ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : null}
            {t('donation.yearly', {
              price: formatDonationPrice(DONATION_DISPLAY_VALUES.yearly),
            })}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

interface DonationButtonProps {
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'lg'
  className?: string
  showLabel?: boolean
  onMobileClick?: () => void
}

export function DonationButton({
  variant = 'outline',
  size = 'sm',
  className,
  showLabel = true,
  onMobileClick,
}: DonationButtonProps) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)

  const handleOpen = () => {
    setOpen(true)
    onMobileClick?.()
  }

  return (
    <>
      <Button
        variant={variant}
        size={size}
        className={className}
        onClick={handleOpen}
        aria-label={t('donation.button')}
      >
        <Heart className="h-4 w-4 text-primary fill-primary" />
        {showLabel && <span className="ml-1.5 hidden lg:inline">{t('donation.button')}</span>}
      </Button>
      <DonationModal open={open} onOpenChange={setOpen} />
    </>
  )
}
