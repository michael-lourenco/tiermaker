'use client'

import { useTranslation } from '@/hooks/useTranslation'
import { cn } from '@/lib/utils/cn'
import type { PasswordValidationResult } from '@/utils/validation'

interface PasswordStrengthHintProps {
  password: string
  result: PasswordValidationResult
}

export function PasswordStrengthHint({ password, result }: PasswordStrengthHintProps) {
  const { t } = useTranslation()
  if (!password) return null

  const strength = result.strength || 'weak'
  const barClass =
    strength === 'strong'
      ? 'bg-green-500 w-full'
      : strength === 'medium'
        ? 'bg-amber-500 w-2/3'
        : 'bg-destructive w-1/3'

  return (
    <div className="space-y-1.5">
      <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
        <div className={cn('h-full transition-all', barClass)} />
      </div>
      <p className="text-xs text-muted-foreground">
        {t(`auth.passwordStrength.${strength}`)}
        {' — '}
        {t('auth.register.passwordRequirements')}
      </p>
    </div>
  )
}
