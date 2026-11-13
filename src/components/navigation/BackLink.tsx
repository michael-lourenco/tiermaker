'use client'

import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface BackLinkProps {
  href: string
  children: React.ReactNode
  className?: string
}

/**
 * Secondary page navigation (wayfinding), not a CTA button.
 */
export function BackLink({ href, children, className }: BackLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        'group inline-flex shrink-0 items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors',
        className
      )}
    >
      <span className="inline-flex h-4 w-4 shrink-0 items-center justify-center" aria-hidden="true">
        <ChevronLeft className="h-4 w-4" strokeWidth={2} />
      </span>
      <span>{children}</span>
    </Link>
  )
}
