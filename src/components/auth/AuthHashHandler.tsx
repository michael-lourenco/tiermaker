'use client'

import { useEffect } from 'react'

/**
 * Recovery links often land on Site URL with `#access_token=...&type=recovery`.
 * Forward to /reset-password keeping the hash so that page can setSession.
 */
export function AuthHashHandler() {
  useEffect(() => {
    if (typeof window === 'undefined') return

    const hash = window.location.hash
    if (!hash || hash.length < 2) return

    const params = new URLSearchParams(hash.replace(/^#/, ''))
    const type = params.get('type')
    const accessToken = params.get('access_token')

    if (type !== 'recovery' || !accessToken) return
    if (window.location.pathname === '/reset-password') return

    window.location.replace(`/reset-password${hash}`)
  }, [])

  return null
}
