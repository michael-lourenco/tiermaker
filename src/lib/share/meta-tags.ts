/**
 * Generate dynamic metadata for sharing (Open Graph, Twitter Cards)
 */

import type { Metadata } from 'next'
import type { ShareContentType } from './share.types'
import { generateShareUrl, getShareMetadata } from './share.utils'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://superiermaker.com'
const APP_NAME = 'SuperTierMaker'

export function generateShareMetadata(
  type: ShareContentType,
  data: any
): Metadata {
  const metadata = getShareMetadata(type, data)
  const url = metadata.url

  const baseMetadata: Metadata = {
    metadataBase: new URL(APP_URL),
    title: metadata.title,
    description: metadata.description,
    openGraph: {
      type: 'website',
      siteName: APP_NAME,
      title: metadata.title,
      description: metadata.description,
      url: url,
      ...(metadata.image && {
        images: [
          {
            url: metadata.image,
            width: 1200,
            height: 630,
            alt: metadata.title,
          },
        ],
      }),
    },
    twitter: {
      card: 'summary_large_image',
      title: metadata.title,
      description: metadata.description,
      ...(metadata.image && {
        images: [metadata.image],
      }),
    },
  }

  return baseMetadata
}

