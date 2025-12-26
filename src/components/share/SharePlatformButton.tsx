'use client'

import { Button } from '@/components/ui/button'
import { getPlatformIconComponent } from '@/lib/share/platforms'
import type { SharePlatform } from '@/lib/share/share.types'
import { cn } from '@/lib/utils/cn'

interface SharePlatformButtonProps {
  platform: SharePlatform
  name: string
  onClick: () => void
  className?: string
}

export function SharePlatformButton({ platform, name, onClick, className }: SharePlatformButtonProps) {
  const Icon = getPlatformIconComponent(platform)

  return (
    <Button
      variant="outline"
      className={cn('flex flex-col items-center justify-center gap-2 h-auto py-4 px-3', className)}
      onClick={onClick}
      aria-label={`Share on ${name}`}
    >
      <Icon className="h-5 w-5" />
      <span className="text-xs">{name}</span>
    </Button>
  )
}

