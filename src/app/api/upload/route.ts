import { NextRequest, NextResponse } from 'next/server'
import { getPresignedUploadUrl } from '@/lib/aws/s3'
import { createClient } from '@/lib/supabase/server'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { filename, contentType } = await request.json()

    if (!filename || !contentType) {
      return NextResponse.json(
        { error: 'Filename and content type are required' },
        { status: 400 }
      )
    }

    // Validate content type
    if (!contentType.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Only image files are allowed' },
        { status: 400 }
      )
    }

    // Generate unique key for S3
    const fileExtension = filename.split('.').pop()
    const key = `uploads/${user.id}/${uuidv4()}.${fileExtension}`

    const presignedUrl = await getPresignedUploadUrl(key, contentType, 3600)

    return NextResponse.json({ presignedUrl, key })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Failed to generate upload URL' },
      { status: 500 }
    )
  }
}

