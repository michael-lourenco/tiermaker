/**
 * Utility functions for sharing
 */

import type { ShareData, ShareContentType } from './share.types'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://tiermaker-seven.vercel.app'

/**
 * Generate share URL based on content type
 */
export function generateShareUrl(
  type: ShareContentType,
  id?: string,
  params?: Record<string, string>
): string {
  const baseUrl = APP_URL

  switch (type) {
    case 'template':
      return `${baseUrl}/templates/${id}`
    case 'tier_list':
      return `${baseUrl}/tier-lists/${id}`
    case 'category':
      if (id) {
        return `${baseUrl}/templates?category_id=${encodeURIComponent(id)}`
      }
      return `${baseUrl}/categories`
    case 'editor':
      return `${baseUrl}/editor/${id}`
    case 'home':
      return baseUrl
    default:
      return baseUrl
  }
}

/**
 * Generate Twitter/X share URL
 */
export function generateTwitterUrl(text: string, url: string): string {
  const encodedText = encodeURIComponent(text)
  const encodedUrl = encodeURIComponent(url)
  return `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`
}

/**
 * Generate Facebook share URL
 */
export function generateFacebookUrl(url: string): string {
  const encodedUrl = encodeURIComponent(url)
  return `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`
}

/**
 * Generate WhatsApp share URL
 */
export function generateWhatsAppUrl(text: string, url: string): string {
  const message = `${text} ${url}`
  const encodedMessage = encodeURIComponent(message)
  return `https://wa.me/?text=${encodedMessage}`
}

/**
 * Generate LinkedIn share URL
 */
export function generateLinkedInUrl(url: string): string {
  const encodedUrl = encodeURIComponent(url)
  return `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`
}

/**
 * Generate Reddit share URL
 */
export function generateRedditUrl(title: string, url: string): string {
  const encodedTitle = encodeURIComponent(title)
  const encodedUrl = encodeURIComponent(url)
  return `https://reddit.com/submit?title=${encodedTitle}&url=${encodedUrl}`
}

/**
 * Generate Email share URL
 */
export function generateEmailUrl(subject: string, body: string, url: string): string {
  const encodedSubject = encodeURIComponent(subject)
  const encodedBody = encodeURIComponent(`${body}\n\n${url}`)
  return `mailto:?subject=${encodedSubject}&body=${encodedBody}`
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text)
      return true
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = text
      textArea.style.position = 'fixed'
      textArea.style.left = '-999999px'
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      try {
        document.execCommand('copy')
        document.body.removeChild(textArea)
        return true
      } catch (err) {
        document.body.removeChild(textArea)
        return false
      }
    }
  } catch (error) {
    console.error('Failed to copy to clipboard:', error)
    return false
  }
}

/**
 * Check if Web Share API is available
 */
export function canUseWebShare(): boolean {
  return typeof navigator !== 'undefined' && 'share' in navigator
}

/**
 * Use Web Share API
 */
export async function webShare(data: ShareData): Promise<boolean> {
  if (!canUseWebShare()) {
    return false
  }

  try {
    await navigator.share({
      title: data.title,
      text: data.description,
      url: data.url,
    })
    return true
  } catch (error) {
    // User cancelled or error occurred
    if ((error as Error).name !== 'AbortError') {
      console.error('Error sharing:', error)
    }
    return false
  }
}

/**
 * Get share metadata for a content type
 */
export function getShareMetadata(
  type: ShareContentType,
  data: any
): { title: string; description: string; image?: string; url: string } {
  const url = generateShareUrl(type, data.id)

  switch (type) {
    case 'template':
      return {
        title: data.name || 'Template',
        description: data.description || `Create your tier list with ${data.name || 'this template'}!`,
        image: data.cover_image_url || data.items?.[0]?.image_url,
        url,
      }
    case 'tier_list':
      return {
        title: data.title || 'Tier List',
        description: `Check out my tier list: ${data.title || 'Tier List'}!`,
        image: undefined, // Will be generated via html2canvas
        url,
      }
    case 'category':
      return {
        title: data.name ? `${data.name} - Templates` : 'Categories',
        description: data.count
          ? `${data.count} templates available in ${data.name || 'this category'}`
          : 'Browse templates by category',
        image: undefined,
        url,
      }
    case 'editor':
      return {
        title: `Create your tier list with ${data.template?.name || 'this template'}`,
        description: 'Start creating your tier list right now!',
        image: data.template?.cover_image_url,
        url,
      }
    case 'home':
      return {
        title: 'SuperTierMaker - Create and Share Tier Lists',
        description: 'Create, rank, and share tier lists for any topic',
        image: undefined,
        url,
      }
    default:
      return {
        title: 'SuperTierMaker',
        description: 'Create and share tier lists',
        url,
      }
  }
}

