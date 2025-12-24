import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
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

