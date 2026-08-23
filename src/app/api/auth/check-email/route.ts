/**
 * Check if an email is already registered (service role).
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'

async function emailExists(email: string): Promise<boolean> {
  const supabase = createServiceRoleClient()
  const normalized = email.toLowerCase()
  let page = 1
  const perPage = 200

  for (;;) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage })
    if (error) throw error
    const users = data.users || []
    if (users.some((u) => u.email?.toLowerCase() === normalized)) {
      return true
    }
    if (users.length < perPage) {
      return false
    }
    page += 1
    if (page > 50) {
      return false
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const email =
      typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Invalid email', code: 'INVALID_EMAIL' }, { status: 400 })
    }

    const exists = await emailExists(email)
    return NextResponse.json({ exists })
  } catch (error: unknown) {
    console.error('check-email error:', error)
    const message = error instanceof Error ? error.message : 'Failed to check email'
    return NextResponse.json({ error: message, code: 'UNEXPECTED' }, { status: 500 })
  }
}
