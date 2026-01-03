'use client'

import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { Crown } from 'lucide-react'

interface SubscriptionButtonProps {
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'lg'
  className?: string
}

export function SubscriptionButton({
  variant = 'default',
  size = 'default',
  className,
}: SubscriptionButtonProps) {
  const router = useRouter()

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={() => router.push('/pricing')}
    >
      <Crown className="h-4 w-4 mr-2" />
      Upgrade para Premium
    </Button>
  )
}
