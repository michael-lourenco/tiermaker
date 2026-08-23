/**
 * Request password reset email via Resend + Supabase recovery generateLink.
 * Always returns ok for valid emails to avoid account enumeration (except rate/config errors).
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { getPublicAppUrl } from '@/lib/constants/site'
import {
  buildPasswordResetEmail,
  getResendClient,
  getResendFromAddress,
} from '@/lib/email/resend'

function withForcedRedirect(actionLink: string, redirectTo: string): string {
  try {
    const url = new URL(actionLink)
    url.searchParams.set('redirect_to', redirectTo)
    return url.toString()
  } catch {
    return actionLink
  }
}

function resolveResetRedirect(request: NextRequest): string {
  const originHeader = request.headers.get('origin')
  const origin = originHeader || request.nextUrl.origin
  try {
    const host = new URL(origin).hostname
    if (host === 'localhost' || host === '127.0.0.1') {
      return `${origin.replace(/\/$/, '')}/reset-password`
    }
  } catch {
    /* use public URL */
  }
  return `${getPublicAppUrl()}/reset-password`
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const email =
      typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Invalid email', code: 'INVALID_EMAIL' }, { status: 400 })
    }

    const resend = getResendClient()
    if (!resend) {
      return NextResponse.json(
        { error: 'Email service not configured', code: 'RESEND_NOT_CONFIGURED' },
        { status: 503 }
      )
    }

    const supabase = createServiceRoleClient()
    const redirectTo = resolveResetRedirect(request)

    const { data, error: linkError } = await supabase.auth.admin.generateLink({
      type: 'recovery',
      email,
      options: { redirectTo },
    })

    if (linkError) {
      console.warn('forgot-password generateLink:', linkError.message)
      return NextResponse.json({ ok: true })
    }

    const rawLink = data.properties?.action_link
    if (!rawLink) {
      return NextResponse.json({ ok: true })
    }

    const actionLink = withForcedRedirect(rawLink, redirectTo)

    const { subject, html, text } = buildPasswordResetEmail({
      resetUrl: actionLink,
      email,
    })

    const { error: sendError } = await resend.emails.send({
      from: getResendFromAddress(),
      to: email,
      subject,
      html,
      text,
    })

    if (sendError) {
      console.error('forgot-password Resend error:', sendError)
      return NextResponse.json(
        { error: sendError.message, code: 'RESEND_SEND_FAILED' },
        { status: 502 }
      )
    }

    return NextResponse.json({ ok: true })
  } catch (error: unknown) {
    console.error('forgot-password error:', error)
    const message = error instanceof Error ? error.message : 'Failed to send reset email'
    return NextResponse.json({ error: message, code: 'UNEXPECTED' }, { status: 500 })
  }
}
