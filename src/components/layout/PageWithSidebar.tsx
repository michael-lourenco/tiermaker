'use client'

import { ReactNode, useState, useEffect } from 'react'
import { AdSpace } from '@/components/ads/AdSpace'
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
  const [mounted, setMounted] = useState(false)
  // BANNERS DESABILITADOS TEMPORARIAMENTE - comentado useSubscription
  // const { isPremium, loading: subscriptionLoading } = useSubscription()

  // Avoid hydration mismatch - sempre renderizar layout desktop no SSR
  useEffect(() => {
    setMounted(true)
  }, [])

  // BANNERS DESABILITADOS TEMPORARIAMENTE - sempre não mostrar sidebars
  // CÓDIGO ORIGINAL COMENTADO (para reativar no futuro):
  // // Se for premium ou estiver carregando, não mostrar sidebars (AdSpace retorna null)
  // // Mas ainda renderizar o layout para não quebrar o design
  // const shouldShowLeftSidebar = showLeftSidebar && !subscriptionLoading && !isPremium && mounted
  // const shouldShowRightSidebar = showRightSidebar && !subscriptionLoading && !isPremium && mounted
  const shouldShowLeftSidebar = false // BANNERS DESABILITADOS
  const shouldShowRightSidebar = false // BANNERS DESABILITADOS

  // Sempre renderizar o layout desktop (mobile esconde sidebars via CSS hidden lg:block)
  return (
    <div className={cn('flex gap-6 max-w-7xl mx-auto', className)}>
      {/* Left Sidebar - BANNERS DESABILITADOS TEMPORARIAMENTE */}
      {/* {shouldShowLeftSidebar && (
        <aside className="w-[300px] flex-shrink-0 hidden lg:block">
          <div className="sticky top-20">
            <AdSpace position="sidebar-left" wrapperClassName="my-0" />
          </div>
        </aside>
      )} */}

      {/* Main Content */}
      <main className={cn(
        'flex-1 min-w-0',
        shouldShowLeftSidebar && shouldShowRightSidebar && 'max-w-none',
        shouldShowLeftSidebar && !shouldShowRightSidebar && 'max-w-none',
        !shouldShowLeftSidebar && shouldShowRightSidebar && 'max-w-none'
      )}>
        {children}
      </main>

      {/* Right Sidebar - BANNERS DESABILITADOS TEMPORARIAMENTE */}
      {/* {shouldShowRightSidebar && (
        <aside className="w-[300px] flex-shrink-0 hidden lg:block">
          <div className="sticky top-20">
            <AdSpace position="sidebar-right" wrapperClassName="my-0" />
          </div>
        </aside>
      )} */}
    </div>
  )
}

