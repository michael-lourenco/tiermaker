/**
 * Platform configurations for sharing
 */

import {
  generateTwitterUrl,
  generateFacebookUrl,
  generateWhatsAppUrl,
  generateLinkedInUrl,
  generateRedditUrl,
  generateEmailUrl,
  canUseWebShare,
} from './share.utils'
import type { SharePlatformConfig, ShareData } from './share.types'
import { Share2, Twitter, Facebook, MessageCircle, Linkedin, Mail, Copy, Download, Share, Circle } from 'lucide-react'

export const sharePlatforms: SharePlatformConfig[] = [
  {
    id: 'twitter',
    name: 'Twitter',
    icon: 'twitter',
    color: '#1DA1F2',
    generateUrl: (data: ShareData) => {
      const text = `${data.title} - ${data.description}`.substring(0, 200)
      return generateTwitterUrl(text, data.url)
    },
  },
  {
    id: 'facebook',
    name: 'Facebook',
    icon: 'facebook',
    color: '#1877F2',
    generateUrl: (data: ShareData) => generateFacebookUrl(data.url),
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    icon: 'whatsapp',
    color: '#25D366',
    generateUrl: (data: ShareData) => {
      const text = `${data.title} - ${data.description}`.substring(0, 200)
      return generateWhatsAppUrl(text, data.url)
    },
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    icon: 'linkedin',
    color: '#0077B5',
    generateUrl: (data: ShareData) => generateLinkedInUrl(data.url),
  },
  {
    id: 'reddit',
    name: 'Reddit',
    icon: 'reddit',
    color: '#FF4500',
    generateUrl: (data: ShareData) => generateRedditUrl(data.title, data.url),
  },
  {
    id: 'email',
    name: 'Email',
    icon: 'email',
    color: '#666',
    generateUrl: (data: ShareData) => {
      return generateEmailUrl(data.title, data.description, data.url)
    },
  },
  {
    id: 'copy',
    name: 'Copy Link',
    icon: 'copy',
    color: '#666',
    generateUrl: (data: ShareData) => data.url,
  },
]

/**
 * Get platform icon component name
 */
export function getPlatformIcon(platformId: string): string {
  return platformId
}

/**
 * Get icon component for platform
 */
export function getPlatformIconComponent(platformId: string) {
  const iconMap: Record<string, any> = {
    twitter: Twitter,
    facebook: Facebook,
    whatsapp: MessageCircle,
    linkedin: Linkedin,
    reddit: Circle, // Reddit icon not available in lucide-react, using Circle as placeholder
    email: Mail,
    copy: Copy,
    download: Download,
    web: Share,
  }
  return iconMap[platformId] || Share2
}

