'use client'

import { AdSpace } from './AdSpace'
import { useDeviceType } from '@/hooks/useDeviceType'

/**
 * Sticky Sidebar - Sidebar fixa que acompanha o scroll
 * Aparece apenas em desktop (xl breakpoint) e fica fixa na lateral direita da tela
 * Não interfere com o conteúdo principal devido ao z-index e pointer-events
 */
export function StickySidebar() {
  const deviceType = useDeviceType()
  const isDesktop = deviceType === 'desktop'

  if (!isDesktop) {
    return null
  }

  return (
    <aside className="fixed right-0 top-20 w-[300px] z-30 hidden xl:block pointer-events-none">
      <div className="sticky top-20 pointer-events-auto">
        <div className="p-4">
          <AdSpace position="sticky-sidebar" wrapperClassName="my-0" />
        </div>
      </div>
    </aside>
  )
}

