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
import { EmailVerificationModal } from '@/components/auth/EmailVerificationModal'
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validação de email
    const emailValidation = validateEmail(email)
    if (!emailValidation.valid) {
      setError(t(emailValidation.errorKey || 'auth.register.invalidEmail'))
      return
    }

    // Validação de senha
    const passwordValidation = validatePassword(password)
    if (!passwordValidation.valid) {
      setError(t(passwordValidation.errorKey || 'auth.register.passwordMinLength'))
      return
    }

    // Validação de confirmação de senha
    const passwordMatchValidation = validatePasswordMatch(password, confirmPassword)
    if (!passwordMatchValidation.valid) {
      setError(t(passwordMatchValidation.errorKey || 'auth.register.passwordsNotMatch'))
      return
    }

    setLoading(true)

    const { error, data } = await signUp(email, password)

    if (error) {
      setError(translateAuthError(error, 'pt'))
      setLoading(false)
      return
    }

    // Verificar se o usuário foi criado
    // O Supabase pode retornar data.user como null em alguns casos
    // Se não há usuário e não há erro, pode ser que o email já exista
    // NOTA: Algumas configurações do Supabase podem permitir múltiplos cadastros
    // com o mesmo email, mas sem criar o usuário. Nesse caso, verificamos se
    // data.user existe para confirmar que o registro foi bem-sucedido
    if (!data?.user) {
      // Caso não tenha erro explícito mas também não tenha usuário criado
      // Pode ser que o email já exista mas o Supabase não retornou erro
      // ou que precise de confirmação de email (mas mesmo assim deveria ter user)
      setError(t('auth.errors.userAlreadyRegistered'))
      setLoading(false)
      return
    }

    // Se chegou aqui, o registro foi bem-sucedido
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
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">{t('auth.register.password')}</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
                <p className="text-xs text-muted-foreground">
                  {t('auth.register.passwordRequirements')}
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">{t('auth.register.confirmPassword')}</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? t('auth.register.creatingAccount') : t('auth.register.signUp')}
              </Button>
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


