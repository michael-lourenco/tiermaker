'use client'

import { ReactNode } from 'react'
import { AdSpace } from '@/components/ads/AdSpace'
import { useDeviceType } from '@/hooks/useDeviceType'
import { useSubscription } from '@/hooks/useSubscription'
import { cn } from '@/lib/utils/cn'

interface PageWithSidebarProps {
  children: ReactNode
  showLeftSidebar?: boolean
  showRightSidebar?: boolean
  className?: string
}

export function PageWithSidebar({ 
  children, 
  showLeftSidebar = false,
  showRightSidebar = false,
  className 
}: PageWithSidebarProps) {
  const deviceType = useDeviceType()
  const isDesktop = deviceType === 'desktop'
  const { isPremium, loading: subscriptionLoading } = useSubscription()

  // Only show sidebars on desktop
  if (!isDesktop) {
    return <div className={className}>{children}</div>
  }

  // Se for premium ou estiver carregando, não mostrar sidebars (AdSpace retorna null)
  // Mas ainda renderizar o layout para não quebrar o design
  const shouldShowLeftSidebar = showLeftSidebar && !subscriptionLoading && !isPremium
  const shouldShowRightSidebar = showRightSidebar && !subscriptionLoading && !isPremium

  return (
    <div className={cn('flex gap-6 max-w-7xl mx-auto', className)}>
      {/* Left Sidebar - só renderiza se não for premium */}
      {shouldShowLeftSidebar && (
        <aside className="w-[300px] flex-shrink-0 hidden lg:block">
          <div className="sticky top-20">
            <AdSpace position="sidebar-left" wrapperClassName="my-0" />
          </div>
        </aside>
      )}

      {/* Main Content */}
      <main className={cn(
        'flex-1 min-w-0',
        shouldShowLeftSidebar && shouldShowRightSidebar && 'max-w-none',
        shouldShowLeftSidebar && !shouldShowRightSidebar && 'max-w-none',
        !shouldShowLeftSidebar && shouldShowRightSidebar && 'max-w-none'
      )}>
        {children}
      </main>

      {/* Right Sidebar - só renderiza se não for premium */}
      {shouldShowRightSidebar && (
        <aside className="w-[300px] flex-shrink-0 hidden lg:block">
          <div className="sticky top-20">
            <AdSpace position="sidebar-right" wrapperClassName="my-0" />
          </div>
        </aside>
      )}
    </div>
  )
}

