import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  CopyObjectCommand,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const AWS_REGION = process.env.AWS_REGION || 'us-east-1'
const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME!

const s3Client = new S3Client({
  region: AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

/**
 * Construct S3 bucket URL dynamically
 * Format: https://{bucket-name}.s3.{region}.amazonaws.com
 * For us-east-1: https://{bucket-name}.s3.amazonaws.com
 */
function getBucketUrl(): string {
  // If explicitly provided, use it
  if (process.env.AWS_S3_BUCKET_URL) {
    return process.env.AWS_S3_BUCKET_URL
  }

  // Otherwise, construct from bucket name and region
  if (AWS_REGION === 'us-east-1') {
    return `https://${BUCKET_NAME}.s3.amazonaws.com`
  }
  
  return `https://${BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com`
}

export interface UploadFileParams {
  key: string
  body: Buffer | Uint8Array | string
  contentType: string
}

/**
 * Upload a file to S3
 */
export async function uploadFile({ key, body, contentType }: UploadFileParams): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: body,
    ContentType: contentType,
  })

  await s3Client.send(command)

  return `${getBucketUrl()}/${key}`
}

/**
 * Public URL for an object key in the configured bucket
 */
export function publicUrlForS3Key(key: string): string {
  const base = getBucketUrl().replace(/\/$/, '')
  return `${base}/${key.replace(/^\//, '')}`
}

/**
 * Server-side copy within the same bucket (e.g. clone template images)
 */
export async function copyS3Object(sourceKey: string, destKey: string): Promise<void> {
  const encodedKey = sourceKey
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/')
  const copySource = `${BUCKET_NAME}/${encodedKey}`

  await s3Client.send(
    new CopyObjectCommand({
      Bucket: BUCKET_NAME,
      Key: destKey,
      CopySource: copySource,
    })
  )
}

/**
 * Generate a presigned URL for uploading
 */
export async function getPresignedUploadUrl(
  key: string,
  contentType: string,
  expiresIn: number = 3600
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    ContentType: contentType,
  })

  return await getSignedUrl(s3Client, command, { expiresIn })
}

/**
 * Generate a presigned URL for downloading
 */
export async function getPresignedDownloadUrl(
  key: string,
  expiresIn: number = 3600
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  })

  return await getSignedUrl(s3Client, command, { expiresIn })
}

/**
 * Extract S3 key from a full S3 URL
 * Example: https://bucket.s3.region.amazonaws.com/path/to/file.jpg -> path/to/file.jpg
 */
export function extractS3KeyFromUrl(url: string): string | null {
  if (!url) return null
  
  try {
    const bucketUrl = getBucketUrl()
    // Remove the bucket URL prefix to get the key
    if (url.startsWith(bucketUrl)) {
      return url.replace(bucketUrl + '/', '')
    }
    
    // Also handle cases where URL might have different format
    // Try to extract key from common S3 URL patterns
    const urlObj = new URL(url)
    const pathname = urlObj.pathname
    // Remove leading slash
    return pathname.startsWith('/') ? pathname.substring(1) : pathname
  } catch (error) {
    return null
  }
}

/**
 * Delete an object from S3
 */
export async function deleteS3Object(key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  })

  await s3Client.send(command)
}

/**
 * Delete multiple objects from S3
 * Returns array of successfully deleted keys and array of failed keys with errors
 */
export async function deleteS3Objects(keys: string[]): Promise<{
  deleted: string[]
  failed: Array<{ key: string; error: string }>
}> {
  const deleted: string[] = []
  const failed: Array<{ key: string; error: string }> = []

  // Delete objects in parallel, but track failures
  await Promise.allSettled(
    keys.map(async (key) => {
      try {
        await deleteS3Object(key)
        deleted.push(key)
      } catch (error: any) {
        failed.push({
          key,
          error: error.message || 'Unknown error',
        })
      }
    })
  )

  return { deleted, failed }
}

