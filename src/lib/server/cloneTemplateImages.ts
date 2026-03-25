import { copyS3Object, extractS3KeyFromUrl, publicUrlForS3Key } from '@/lib/aws/s3'
import { randomUUID } from 'crypto'

export function buildAllowedCloneImageUrls(source: {
  cover_image_url: string | null
  items: { image_url: string }[]
}): Set<string> {
  const s = new Set<string>()
  if (source.cover_image_url) s.add(source.cover_image_url.trim())
  for (const it of source.items) {
    if (it.image_url) s.add(it.image_url.trim())
  }
  return s
}

export function assertUserOwnsUploadUrl(url: string, userId: string): void {
  const key = extractS3KeyFromUrl(url)
  if (!key || !key.startsWith(`uploads/${userId}/`)) {
    throw new Error('Invalid or unauthorized upload URL')
  }
}

export async function copyClonedImageToUserFolder(
  imageUrl: string,
  allowedUrls: Set<string>,
  userId: string
): Promise<string> {
  const normalized = imageUrl.trim()
  if (!allowedUrls.has(normalized)) {
    throw new Error('Cloned image URL does not belong to the source template')
  }
  const sourceKey = extractS3KeyFromUrl(normalized)
  if (!sourceKey) {
    throw new Error('Could not resolve S3 key for cloned image')
  }
  const ext = sourceKey.includes('.') ? sourceKey.split('.').pop() || 'jpg' : 'jpg'
  const destKey = `uploads/${userId}/${randomUUID()}.${ext}`
  await copyS3Object(sourceKey, destKey)
  return publicUrlForS3Key(destKey)
}
