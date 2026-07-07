'use client'

import { ReactNode } from 'react'
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
  const shouldShowLeftSidebar = false
  const shouldShowRightSidebar = false

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

