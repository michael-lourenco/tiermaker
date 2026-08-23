'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTranslation } from '@/hooks/useTranslation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { AuthErrorMessage } from '@/components/ui/auth-error-message'
import { PasswordInput } from '@/components/auth/PasswordInput'
import { PasswordStrengthHint } from '@/components/auth/PasswordStrengthHint'
import { validatePassword, validatePasswordMatch } from '@/utils/validation'

async function establishSessionFromUrl(): Promise<boolean> {
  const supabase = createClient()

  if (typeof window !== 'undefined' && window.location.hash) {
    const params = new URLSearchParams(window.location.hash.replace(/^#/, ''))
    const access_token = params.get('access_token')
    const refresh_token = params.get('refresh_token')
    if (access_token && refresh_token) {
      const { error } = await supabase.auth.setSession({ access_token, refresh_token })
      window.history.replaceState(null, '', window.location.pathname + window.location.search)
      if (!error) return true
    }
  }

  const { data } = await supabase.auth.getSession()
  return Boolean(data.session)
}

export default function ResetPasswordPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [checkingSession, setCheckingSession] = useState(true)
  const [hasSession, setHasSession] = useState(false)
  const [success, setSuccess] = useState(false)

  const passwordCheck = validatePassword(password)

  useEffect(() => {
    const supabase = createClient()
    let cancelled = false

    const init = async () => {
      const ok = await establishSessionFromUrl()
      if (!cancelled) {
        setHasSession(ok)
        setCheckingSession(false)
      }
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') {
        setHasSession(Boolean(session))
        setCheckingSession(false)
      }
    })

    void init()
    return () => {
      cancelled = true
      subscription.unsubscribe()
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!passwordCheck.valid) {
      setError(t(passwordCheck.errorKey || 'auth.register.passwordRequirements'))
      return
    }

    const match = validatePasswordMatch(password, confirmPassword)
    if (!match.valid) {
      setError(t(match.errorKey || 'auth.register.passwordsNotMatch'))
      return
    }

    setLoading(true)
    try {
      const supabase = createClient()
      const { error: updateError } = await supabase.auth.updateUser({ password })
      if (updateError) {
        setError(updateError.message)
        return
      }
      setSuccess(true)
      setTimeout(() => {
        router.push('/login')
        router.refresh()
      }, 1500)
    } catch {
      setError(t('auth.errors.genericError'))
    } finally {
      setLoading(false)
    }
  }

  if (checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <p className="text-sm text-muted-foreground">{t('common.loading')}</p>
      </div>
    )
  }

  if (!hasSession) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>{t('auth.resetPassword.title')}</CardTitle>
            <CardDescription>{t('auth.resetPassword.invalidSession')}</CardDescription>
          </CardHeader>
          <CardFooter>
            <Link href="/forgot-password" className="text-primary hover:underline text-sm w-full text-center">
              {t('auth.forgotPassword.submit')}
            </Link>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{t('auth.resetPassword.title')}</CardTitle>
          <CardDescription>{t('auth.resetPassword.description')}</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && <AuthErrorMessage message={error} />}
            {success && (
              <div className="p-3 text-sm rounded-md border border-green-500/50 bg-green-500/10 text-green-700 dark:text-green-400">
                {t('auth.resetPassword.success')}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="password">{t('auth.resetPassword.newPassword')}</Label>
              <PasswordInput
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
                disabled={success}
              />
              <PasswordStrengthHint password={password} result={passwordCheck} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">{t('auth.register.confirmPassword')}</Label>
              <PasswordInput
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
                disabled={success}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={loading || success}>
              {loading ? t('auth.resetPassword.saving') : t('auth.resetPassword.submit')}
            </Button>
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
