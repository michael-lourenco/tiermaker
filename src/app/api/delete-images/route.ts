import { NextRequest, NextResponse } from 'next/server'
import { deleteS3Objects, extractS3KeyFromUrl } from '@/lib/aws/s3'

export async function POST(request: NextRequest) {
  try {
    const { imageUrls } = await request.json()

    if (!Array.isArray(imageUrls)) {
      return NextResponse.json(
        { error: 'imageUrls must be an array' },
        { status: 400 }
      )
    }

    // Extract S3 keys from URLs
    const keys = imageUrls
      .map((url) => extractS3KeyFromUrl(url))
      .filter((key): key is string => key !== null)

    if (keys.length === 0) {
      return NextResponse.json({ deleted: [], failed: [] })
    }

    // Delete objects from S3
    const result = await deleteS3Objects(keys)

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Error deleting images from S3:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete images' },
      { status: 500 }
    )
  }
}




