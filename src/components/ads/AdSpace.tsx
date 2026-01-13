'use client'

// BANNERS DESABILITADOS TEMPORARIAMENTE
// Para reativar, descomente o código abaixo e remova o return null

// import { useEffect, useState } from 'react'
// import { AdSpaceService } from '@/services/adSpace.service'
// import type { AdSpace as AdSpaceType, AdSpaceDeviceType } from '@/types/adSpace.types'
// import { ManualAd } from './ManualAd'
// import { GoogleAd } from './GoogleAd'
// import { useDeviceType } from '@/hooks/useDeviceType'
// import { useSubscription } from '@/hooks/useSubscription'
// import { cn } from '@/lib/utils/cn'

interface AdSpaceProps {
  position: string
  className?: string
  wrapperClassName?: string
}

export function AdSpace({ position, className, wrapperClassName }: AdSpaceProps) {
  // BANNERS DESABILITADOS - sempre retorna null
  return null

  // CÓDIGO ORIGINAL COMENTADO (para reativar no futuro):
  /*
  const [adSpace, setAdSpace] = useState<AdSpaceType | null>(null)
  const [loading, setLoading] = useState(true)
  const deviceType = useDeviceType()
  const { isPremium, loading: subscriptionLoading } = useSubscription()

  useEffect(() => {
    // Só carregar ad space se não for premium e já souber o status
    if (subscriptionLoading) {
      return // Aguardar até saber o status da subscription
    }

    if (isPremium) {
      setLoading(false)
      return // Não precisa carregar se for premium
    }

    const loadAdSpace = async () => {
      try {
        const service = new AdSpaceService()
        const deviceTypeForQuery: AdSpaceDeviceType = deviceType === 'desktop' ? 'desktop' : 'mobile'
        const space = await service.getAdSpaceByPosition(position, deviceTypeForQuery)
        setAdSpace(space)
      } catch (error) {
        setAdSpace(null)
      } finally {
        setLoading(false)
      }
    }

    loadAdSpace()
  }, [position, deviceType, isPremium, subscriptionLoading])

  // Não renderizar nada enquanto está carregando o status da subscription
  // Isso evita o "flash" dos anúncios aparecendo e depois sumindo
  if (subscriptionLoading) {
    return null
  }

  // Não mostrar anúncios para usuários premium
  if (isPremium) {
    return null
  }

  // Não renderizar nada enquanto está carregando o ad space
  if (loading) {
    return null
  }

  // Se não há ad space ativo, não renderizar nada (removido AdPlaceholder para evitar espaços vazios)
  if (!adSpace || !adSpace.is_active) {
    return null
  }

  const adContent =
    adSpace.ad_type === 'manual' ? (
      <ManualAd adSpace={adSpace} className={className} />
    ) : (
      <GoogleAd adSpace={adSpace} className={className} />
    )

  return (
    <div className={cn('flex justify-center items-center my-4', wrapperClassName)}>
      {adContent}
    </div>
  )
  */
}


