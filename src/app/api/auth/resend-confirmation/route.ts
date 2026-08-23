/**
 * Resend signup confirmation email via Resend + Supabase generateLink (magiclink).
 * `type: 'signup'` requires password in current Auth typings; magiclink confirms
 * email on click and works for existing unconfirmed users without a password.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import {
  buildAuthCallbackUrl,
  buildSignupConfirmationEmail,
  getResendClient,
  getResendFromAddress,
} from '@/lib/email/resend'

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
    const redirectTo = buildAuthCallbackUrl()

    const { data, error: linkError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email,
      options: { redirectTo },
    })

    if (linkError) {
      console.error('generateLink error:', linkError.message)
      const msg = linkError.message.toLowerCase()
      if (msg.includes('already') || msg.includes('confirmed') || msg.includes('registered')) {
        return NextResponse.json(
          { error: 'Email already confirmed', code: 'ALREADY_CONFIRMED' },
          { status: 400 }
        )
      }
      return NextResponse.json(
        { error: linkError.message, code: 'GENERATE_LINK_FAILED' },
        { status: 400 }
      )
    }

    const actionLink = data.properties?.action_link
    if (!actionLink) {
      return NextResponse.json(
        { error: 'No confirmation link generated', code: 'NO_LINK' },
        { status: 500 }
      )
    }

    const { subject, html, text } = buildSignupConfirmationEmail({
      confirmUrl: actionLink,
      email,
    })

    const { data: sent, error: sendError } = await resend.emails.send({
      from: getResendFromAddress(),
      to: email,
      subject,
      html,
      text,
    })

    if (sendError) {
      console.error('Resend send error:', sendError)
      return NextResponse.json(
        { error: sendError.message, code: 'RESEND_SEND_FAILED' },
        { status: 502 }
      )
    }

    return NextResponse.json({ ok: true, id: sent?.id ?? null })
  } catch (error: unknown) {
    console.error('resend-confirmation error:', error)
    const message = error instanceof Error ? error.message : 'Failed to resend confirmation'
    return NextResponse.json({ error: message, code: 'UNEXPECTED' }, { status: 500 })
  }
}
