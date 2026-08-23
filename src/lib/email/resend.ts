import { Resend } from 'resend'
import { getPublicAppUrl } from '@/lib/constants/site'

export function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY?.trim()
  if (!apiKey) return null
  return new Resend(apiKey)
}

export function getResendFromAddress(): string {
  return (
    process.env.RESEND_FROM_EMAIL?.trim() ||
    'SuperTierMaker <noreply@supertiermaker.com>'
  )
}

export function buildAuthCallbackUrl(nextPath?: string): string {
  const base = `${getPublicAppUrl()}/api/auth/callback`
  if (!nextPath) return base
  const safe = nextPath.startsWith('/') && !nextPath.startsWith('//') ? nextPath : '/'
  return `${base}?next=${encodeURIComponent(safe)}`
}

export function buildSignupConfirmationEmail(params: {
  confirmUrl: string
  email: string
}): { subject: string; html: string; text: string } {
  const { confirmUrl, email } = params
  const subject = 'Confirme seu email — SuperTierMaker'
  const text = [
    `Olá!`,
    ``,
    `Confirme sua conta no SuperTierMaker clicando no link abaixo:`,
    confirmUrl,
    ``,
    `Se você não criou esta conta (${email}), ignore este email.`,
    ``,
    `— SuperTierMaker`,
  ].join('\n')

  const html = `
<!DOCTYPE html>
<html>
  <body style="font-family: system-ui, sans-serif; line-height: 1.5; color: #111;">
    <p>Olá!</p>
    <p>Confirme sua conta no <strong>SuperTierMaker</strong> clicando no botão abaixo:</p>
    <p style="margin: 24px 0;">
      <a href="${confirmUrl}"
         style="display:inline-block;padding:12px 20px;background:#111;color:#fff;text-decoration:none;border-radius:8px;">
        Confirmar email
      </a>
    </p>
    <p style="font-size: 14px; color: #555;">
      Ou copie e cole este link no navegador:<br />
      <a href="${confirmUrl}">${confirmUrl}</a>
    </p>
    <p style="font-size: 13px; color: #777;">
      Se você não criou esta conta (${email}), ignore este email.
    </p>
  </body>
</html>`.trim()

  return { subject, html, text }
}

export function buildPasswordResetEmail(params: {
  resetUrl: string
  email: string
}): { subject: string; html: string; text: string } {
  const { resetUrl, email } = params
  const subject = 'Redefinir senha — SuperTierMaker'
  const text = [
    `Olá!`,
    ``,
    `Recebemos um pedido para redefinir a senha da conta ${email}.`,
    `Clique no link abaixo (válido por tempo limitado):`,
    resetUrl,
    ``,
    `Se você não solicitou isso, ignore este email.`,
    ``,
    `— SuperTierMaker`,
  ].join('\n')

  const html = `
<!DOCTYPE html>
<html>
  <body style="font-family: system-ui, sans-serif; line-height: 1.5; color: #111;">
    <p>Olá!</p>
    <p>Recebemos um pedido para redefinir a senha da conta <strong>${email}</strong>.</p>
    <p style="margin: 24px 0;">
      <a href="${resetUrl}"
         style="display:inline-block;padding:12px 20px;background:#111;color:#fff;text-decoration:none;border-radius:8px;">
        Redefinir senha
      </a>
    </p>
    <p style="font-size: 14px; color: #555;">
      Ou copie e cole este link no navegador:<br />
      <a href="${resetUrl}">${resetUrl}</a>
    </p>
    <p style="font-size: 13px; color: #777;">
      Se você não solicitou isso, ignore este email.
    </p>
  </body>
</html>`.trim()

  return { subject, html, text }
}
