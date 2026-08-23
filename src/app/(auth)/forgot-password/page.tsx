'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useTranslation } from '@/hooks/useTranslation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { AuthErrorMessage } from '@/components/ui/auth-error-message'
import { validateEmail } from '@/utils/validation'

export default function ForgotPasswordPage() {
  const { t } = useTranslation()
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    const emailValidation = validateEmail(email)
    if (!emailValidation.valid) {
      setError(t(emailValidation.errorKey || 'auth.errors.invalidEmail'))
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const payload = await response.json().catch(() => ({}))

      if (!response.ok) {
        if (payload.code === 'RESEND_NOT_CONFIGURED') {
          setError(t('auth.emailVerification.resendNotConfigured'))
        } else {
          setError(t('auth.forgotPassword.sendError'))
        }
        return
      }

      setSuccess(true)
    } catch {
      setError(t('auth.forgotPassword.sendError'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{t('auth.forgotPassword.title')}</CardTitle>
          <CardDescription>{t('auth.forgotPassword.description')}</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && <AuthErrorMessage message={error} />}
            {success && (
              <div className="p-3 text-sm rounded-md border border-green-500/50 bg-green-500/10 text-green-700 dark:text-green-400">
                {t('auth.forgotPassword.success')}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">{t('auth.login.email')}</Label>
              <Input
                id="email"
                type="email"
                placeholder={t('auth.login.emailPlaceholder')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={success}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            {!success && (
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? t('auth.forgotPassword.sending') : t('auth.forgotPassword.submit')}
              </Button>
            )}
            <p className="text-sm text-center text-muted-foreground">
              <Link href="/login" className="text-primary hover:underline">
                {t('auth.forgotPassword.backToLogin')}
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
