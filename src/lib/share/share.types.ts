/**
 * Types for the sharing system
 */

export type ShareContentType = 'template' | 'tier_list' | 'category' | 'editor' | 'home'

export type SharePlatform =
  | 'twitter'
  | 'facebook'
  | 'whatsapp'
  | 'linkedin'
  | 'reddit'
  | 'email'
  | 'copy'
  | 'download'
  | 'web'

export interface ShareData {
  type: ShareContentType
  id?: string
  title: string
  description: string
  image?: string
  url: string
  metadata?: Record<string, any>
}

export interface SharePlatformConfig {
  id: SharePlatform
  name: string
  icon: string
  color?: string
  generateUrl: (data: ShareData) => string
  available?: () => boolean
}

export interface ShareMetadata {
  title: string
  description: string
  image?: string
  url: string
}

