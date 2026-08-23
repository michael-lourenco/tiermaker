/** Canonical public origin for share links, OG metadata, and production redirects */
export const SITE_URL = 'https://www.supertiermaker.com'

/**
 * Public app URL for links shown to users (share, Open Graph, etc.).
 * Legacy/preview Vercel hosts are replaced by the canonical domain.
 */
export function getPublicAppUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/$/, '')
  if (!fromEnv) {
    return SITE_URL
  }
  try {
    const host = new URL(fromEnv).hostname
    if (host.endsWith('.vercel.app') || host === 'localhost' || host === '127.0.0.1') {
      return SITE_URL
    }
  } catch {
    return SITE_URL
  }
  return fromEnv
}
