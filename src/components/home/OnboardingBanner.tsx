'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useTranslation } from '@/hooks/useTranslation'
import { useAuth } from '@/hooks/useAuth'
import { X } from 'lucide-react'

const STORAGE_KEY = 'supertiermaker-onboarding-dismissed'

export function OnboardingBanner() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY) === '1') return
      setVisible(true)
    } catch {
      setVisible(true)
    }
  }, [])

  if (!visible) return null

  const dismiss = () => {
    try {
      localStorage.setItem(STORAGE_KEY, '1')
    } catch {
      /* ignore */
    }
    setVisible(false)
  }

  return (
    <div className="mb-6 rounded-lg border bg-muted/40 px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-3">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{t('home.onboardingTitle')}</p>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
          {t('home.onboardingDescription')}
        </p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <Link href={user ? '/templates' : '/login'}>
          <Button size="sm">{user ? t('home.onboardingCta') : t('home.onboardingLogin')}</Button>
        </Link>
        <Button size="sm" variant="ghost" onClick={dismiss} aria-label={t('common.close')}>
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
