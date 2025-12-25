import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import type { Language } from '@/lib/i18n/types'

export async function POST(request: NextRequest) {
  try {
    const { language } = await request.json()
    
    if (language !== 'en' && language !== 'pt') {
      return NextResponse.json(
        { error: 'Invalid language' },
        { status: 400 }
      )
    }

    const cookieStore = await cookies()
    cookieStore.set('supertiermaker-language', language, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365, // 1 year
      sameSite: 'lax',
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update language' },
      { status: 500 }
    )
  }
}

