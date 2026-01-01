'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useTranslation } from '@/hooks/useTranslation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { AuthErrorMessage } from '@/components/ui/auth-error-message'
import { translateAuthError } from '@/utils/authErrors'
import { validateEmail } from '@/utils/validation'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()
  const router = useRouter()
  const { t } = useTranslation()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validação de email
    const emailValidation = validateEmail(email)
    if (!emailValidation.valid) {
      setError(t(emailValidation.errorKey || 'auth.errors.invalidEmail'))
      return
    }

    setLoading(true)

    const { error } = await signIn(email, password)

    if (error) {
      setError(translateAuthError(error, 'pt'))
      setLoading(false)
    } else {
      router.push('/')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{t('auth.login.title')}</CardTitle>
          <CardDescription>{t('auth.login.description')}</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && <AuthErrorMessage message={error} />}
            <div className="space-y-2">
              <Label htmlFor="email">{t('auth.login.email')}</Label>
              <Input
                id="email"
                type="email"
                placeholder={t('auth.login.emailPlaceholder')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t('auth.login.password')}</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? t('auth.login.signingIn') : t('auth.login.signIn')}
            </Button>
            <p className="text-sm text-center text-muted-foreground">
              {t('auth.login.noAccount')}{' '}
              <Link href="/register" className="text-primary hover:underline">
                {t('auth.login.signUp')}
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}


