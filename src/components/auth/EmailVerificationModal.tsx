'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Mail, CheckCircle2, AlertCircle } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useTranslation } from '@/hooks/useTranslation'

interface EmailVerificationModalProps {
  open: boolean
  email: string
  onClose: () => void
}

export function EmailVerificationModal({ open, email, onClose }: EmailVerificationModalProps) {
  const { t } = useTranslation()
  const router = useRouter()
  const [resending, setResending] = useState(false)
  const [resendStatus, setResendStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [resendErrorKey, setResendErrorKey] = useState<
    'resendError' | 'resendAlreadyConfirmed' | 'resendNotConfigured'
  >('resendError')

  const handleResendEmail = async () => {
    setResending(true)
    setResendStatus('idle')
    setResendErrorKey('resendError')

    try {
      const response = await fetch('/api/auth/resend-confirmation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const payload = await response.json().catch(() => ({}))

      if (!response.ok) {
        if (payload.code === 'ALREADY_CONFIRMED') {
          setResendErrorKey('resendAlreadyConfirmed')
        } else if (payload.code === 'RESEND_NOT_CONFIGURED') {
          setResendErrorKey('resendNotConfigured')
        } else {
          setResendErrorKey('resendError')
        }
        setResendStatus('error')
        return
      }

      setResendStatus('success')
    } catch {
      setResendErrorKey('resendError')
      setResendStatus('error')
    } finally {
      setResending(false)
    }
  }

  const handleBackToLogin = () => {
    router.push('/login')
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="rounded-full bg-primary/10 p-3">
              <Mail className="h-6 w-6 text-primary" />
            </div>
          </div>
          <DialogTitle className="text-center">{t('auth.emailVerification.title')}</DialogTitle>
          <DialogDescription className="text-center">
            {t('auth.emailVerification.message', { email })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <p className="text-sm text-muted-foreground text-center">
            {t('auth.emailVerification.instructions')}
          </p>

          <div className="bg-muted/50 rounded-md p-3 text-center">
            <p className="text-xs text-muted-foreground">
              {t('auth.emailVerification.checkSpam')}
            </p>
          </div>

          {resendStatus === 'success' && (
            <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/50 rounded-md text-sm text-green-600 dark:text-green-400">
              <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
              {t('auth.emailVerification.resendSuccess')}
            </div>
          )}

          {resendStatus === 'error' && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/50 rounded-md text-sm text-destructive">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {t(`auth.emailVerification.${resendErrorKey}`)}
            </div>
          )}

          <div className="flex flex-col gap-2">
            <Button
              onClick={handleResendEmail}
              disabled={resending}
              variant="outline"
              className="w-full"
            >
              {resending ? t('auth.emailVerification.resending') : t('auth.emailVerification.resendEmail')}
            </Button>
            <Button
              onClick={handleBackToLogin}
              className="w-full"
            >
              {t('auth.emailVerification.backToLogin')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
