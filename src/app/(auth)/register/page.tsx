'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useTranslation } from '@/hooks/useTranslation'
import { useLanguage } from '@/hooks/useLanguage'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { AuthErrorMessage } from '@/components/ui/auth-error-message'
import { EmailVerificationModal } from '@/components/auth/EmailVerificationModal'
import { PasswordInput } from '@/components/auth/PasswordInput'
import { PasswordStrengthHint } from '@/components/auth/PasswordStrengthHint'
import { translateAuthError } from '@/utils/authErrors'
import { validateEmail, validatePassword, validatePasswordMatch } from '@/utils/validation'
import Link from 'next/link'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showEmailModal, setShowEmailModal] = useState(false)
  const { signUp } = useAuth()
  const router = useRouter()
  const { t } = useTranslation()
  const { language } = useLanguage()

  const passwordCheck = useMemo(() => validatePassword(password), [password])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const emailValidation = validateEmail(email)
    if (!emailValidation.valid) {
      setError(t(emailValidation.errorKey || 'auth.register.invalidEmail'))
      return
    }

    if (!passwordCheck.valid) {
      setError(t(passwordCheck.errorKey || 'auth.register.passwordRequirements'))
      return
    }

    const passwordMatchValidation = validatePasswordMatch(password, confirmPassword)
    if (!passwordMatchValidation.valid) {
      setError(t(passwordMatchValidation.errorKey || 'auth.register.passwordsNotMatch'))
      return
    }

    setLoading(true)

    try {
      const checkRes = await fetch('/api/auth/check-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const checkData = await checkRes.json().catch(() => ({}))

      if (checkRes.ok && checkData.exists) {
        setError(t('auth.errors.userAlreadyRegistered'))
        setLoading(false)
        return
      }
    } catch {
      // Se a checagem falhar, segue o signUp e trata erro do Supabase
    }

    const { error, data } = await signUp(email, password)

    if (error) {
      setError(translateAuthError(error, language === 'en' ? 'en' : 'pt'))
      setLoading(false)
      return
    }

    // Supabase às vezes “aceita” email duplicado sem erro e retorna identities vazias
    if (!data?.user || (data.user.identities && data.user.identities.length === 0)) {
      setError(t('auth.errors.userAlreadyRegistered'))
      setLoading(false)
      return
    }

    setLoading(false)
    setShowEmailModal(true)
  }

  return (
    <>
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>{t('auth.register.title')}</CardTitle>
            <CardDescription>{t('auth.register.description')}</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && <AuthErrorMessage message={error} />}
              <div className="space-y-2">
                <Label htmlFor="email">{t('auth.register.email')}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t('auth.register.emailPlaceholder')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">{t('auth.register.password')}</Label>
                <PasswordInput
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
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
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? t('auth.register.creatingAccount') : t('auth.register.signUp')}
              </Button>
              <p className="text-sm text-center text-muted-foreground">
                <Link href="/forgot-password" className="text-primary hover:underline">
                  {t('auth.forgotPassword.link')}
                </Link>
              </p>
              <p className="text-sm text-center text-muted-foreground">
                {t('auth.register.hasAccount')}{' '}
                <Link href="/login" className="text-primary hover:underline">
                  {t('auth.register.signIn')}
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>

      <EmailVerificationModal
        open={showEmailModal}
        email={email}
        onClose={() => {
          setShowEmailModal(false)
          router.push('/login')
        }}
      />
    </>
  )
}
