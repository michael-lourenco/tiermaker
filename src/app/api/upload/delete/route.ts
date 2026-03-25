import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { extractS3KeyFromUrl, deleteS3Object } from '@/lib/aws/s3'

/**
 * Remove an upload from S3. Only keys under uploads/{userId}/ are allowed.
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const url = typeof body?.url === 'string' ? body.url.trim() : ''
    if (!url) {
      return NextResponse.json({ error: 'url is required' }, { status: 400 })
    }

    const key = extractS3KeyFromUrl(url)
    const prefix = `uploads/${user.id}/`
    if (!key || !key.startsWith(prefix)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await deleteS3Object(key)
    return NextResponse.json({ ok: true })
  } catch (error: any) {
    console.error('Upload delete error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete upload' },
      { status: 500 }
    )
  }
}
