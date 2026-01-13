'use client'

// BANNERS DESABILITADOS TEMPORARIAMENTE
// Para reativar, descomente o código abaixo e remova o return null

// import { AdSpace } from './AdSpace'
// import { useDeviceType } from '@/hooks/useDeviceType'
// import { useSubscription } from '@/hooks/useSubscription'

/**
 * Sticky Sidebar - Sidebar fixa que acompanha o scroll
 * Aparece apenas em desktop (xl breakpoint) e fica fixa na lateral direita da tela
 * Não interfere com o conteúdo principal devido ao z-index e pointer-events
 * Só renderiza se não for premium e houver ad
 */
export function StickySidebar() {
  // BANNERS DESABILITADOS - sempre retorna null
  return null

  // CÓDIGO ORIGINAL COMENTADO (para reativar no futuro):
  /*
  const deviceType = useDeviceType()
  const isDesktop = deviceType === 'desktop'
  const { isPremium, loading: subscriptionLoading } = useSubscription()

  if (!isDesktop) {
    return null
  }

  // Não renderizar enquanto está carregando ou se for premium
  if (subscriptionLoading || isPremium) {
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
  */
}

