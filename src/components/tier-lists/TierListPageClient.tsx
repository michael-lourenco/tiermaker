'use client'

import { useRef, useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { ShareButton } from '@/components/share/ShareButton'
import { Heart, Plus } from 'lucide-react'
import { TierListView } from './TierListView'
import { useViewTracking } from '@/hooks/useViewTracking'
import { useTranslation } from '@/hooks/useTranslation'
import { useUserPreferences } from '@/hooks/useUserPreferences'
import { useAuth } from '@/hooks/useAuth'
import { AdSpace } from '@/components/ads/AdSpace'
import { PageWithSidebar } from '@/components/layout/PageWithSidebar'
import type { TierListWithData } from '@/types/tierList.types'

interface TierListPageClientProps {
  tierList: TierListWithData
}

export function TierListPageClient({ tierList }: TierListPageClientProps) {
  const { t } = useTranslation()
  const { user, loading: authLoading } = useAuth()
  const tierListRef = useRef<HTMLDivElement>(null)
  const { showItemNames, setShowItemNames } = useUserPreferences()
  const [liked, setLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(tierList.likes_count)
  const [isLiking, setIsLiking] = useState(false)
  
  // Check if tier list belongs to current user
  // Só calcular isOwner após o carregamento do auth para evitar renderização inicial incorreta
  const isOwner = !authLoading && user && tierList.user_id === user.id
  
  // Track view with 30-minute minimum interval validation
  useViewTracking('tier_list', tierList.id)

  // Verificar se usuário curtiu
  useEffect(() => {
    // Só fazer fetch após o carregamento do auth estar completo
    if (authLoading) return
    
    if (user && !isOwner) {
      fetch(`/api/tierlists/${tierList.id}/like`)
        .then((res) => res.json())
        .then((data) => setLiked(data.liked || false))
        .catch(() => setLiked(false))
    }
  }, [user, tierList.id, isOwner, authLoading])

  const handleLike = async () => {
    if (!user) {
      // Redirecionar para login se não estiver autenticado
      window.location.href = '/login'
      return
    }

    if (isLiking) return

    setIsLiking(true)
    const newLiked = !liked

    try {
      const response = await fetch(`/api/tierlists/${tierList.id}/like`, {
        method: 'POST',
      })

      if (!response.ok) throw new Error('Failed to toggle like')

      const data = await response.json()
      setLiked(data.liked)
      setLikesCount((prev) => (data.liked ? prev + 1 : Math.max(0, prev - 1)))
    } catch (error) {
      // Erro ao curtir - silencioso
    } finally {
      setIsLiking(false)
    }
  }

  return (
    <main className="min-h-screen p-4 sm:p-6 md:p-8">
      <PageWithSidebar showRightSidebar={true}>
        <div className="mb-6 md:mb-8">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <Link href="/templates">
              <Button variant="ghost" size="sm">← {t('common.back')}</Button>
            </Link>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Label htmlFor="show-item-names-view" className="text-sm cursor-pointer">
                  {t('editor.showItemNames')}
                </Label>
                <Switch
                  id="show-item-names-view"
                  checked={showItemNames}
                  onCheckedChange={setShowItemNames}
                />
              </div>
              <ShareButton 
                type="tier_list" 
                data={tierList} 
                tierListElementRef={tierListRef}
              />
            </div>
          </div>
        </div>

        {/* Ad Space - Content Top */}
        {/* BANNERS DESABILITADOS TEMPORARIAMENTE */}
        {/* <AdSpace position="content-top" /> */}

        <div className="mb-6 md:mb-8">
          <div className="flex items-start justify-between gap-4 mb-4 flex-wrap">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">{tierList.title}</h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                {t('tierList.created')} {new Date(tierList.created_at).toLocaleDateString('pt-BR')}
              </p>
            </div>
            {/* Só renderizar botões após o carregamento do auth para evitar flash de renderização incorreta */}
            {!authLoading && !isOwner && (
              <div className="flex items-center gap-3 flex-wrap">
                <Button
                  variant={liked ? 'default' : 'outline'}
                  size="sm"
                  onClick={handleLike}
                  disabled={isLiking}
                  className="flex items-center gap-2"
                >
                  <Heart className={`h-4 w-4 ${liked ? 'fill-current' : ''}`} />
                  <span>{likesCount}</span>
                </Button>
                <Link href={`/editor/${tierList.template_id}`}>
                  <Button variant="default" size="sm" className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    <span>{t('tierList.makeMyVersion')}</span>
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Ad Space - Content Middle */}
        {/* BANNERS DESABILITADOS TEMPORARIAMENTE */}
        {/* <AdSpace position="content-middle" /> */}

        <div ref={tierListRef} className="w-full">
          <TierListView tierList={tierList} />
        </div>

        {/* Ad Space - Content Bottom */}
        {/* BANNERS DESABILITADOS TEMPORARIAMENTE */}
        {/* <AdSpace position="content-bottom" /> */}
      </PageWithSidebar>
    </main>
  )
}

