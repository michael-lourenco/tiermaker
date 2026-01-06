'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Heart, Eye, Share2, Plus, ExternalLink } from 'lucide-react'
import { TierListThumbnail } from '@/components/my-tier-lists/TierListThumbnail'
import { ShareButton } from '@/components/share/ShareButton'
import { useAuth } from '@/hooks/useAuth'
import type { TierListWithData } from '@/types/tierList.types'

interface TierListCardProps {
  tierList: TierListWithData & {
    template_name?: string
    category_name?: string
    category_slug?: string
    user_email?: string | null
  }
  onLike?: (tierListId: string, liked: boolean) => void
}

export function TierListCard({ tierList, onLike }: TierListCardProps) {
  const { user } = useAuth()
  const [liked, setLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(tierList.likes_count)
  const [isLiking, setIsLiking] = useState(false)

  // Verificar se usuário curtiu
  useEffect(() => {
    if (user) {
      fetch(`/api/tierlists/${tierList.id}/like`)
        .then((res) => res.json())
        .then((data) => setLiked(data.liked || false))
        .catch(() => setLiked(false))
    }
  }, [user, tierList.id])

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

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
      onLike?.(tierList.id, data.liked)
    } catch (error) {
      console.error('Error toggling like:', error)
    } finally {
      setIsLiking(false)
    }
  }

  // Calcular badges
  const isRecent = new Date(tierList.created_at).getTime() > Date.now() - 24 * 60 * 60 * 1000
  const isPopular = tierList.views_count > 100 || tierList.likes_count > 10

  return (
    <Link href={`/tier-lists/${tierList.id}`}>
      <Card className="group relative overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border-2 hover:border-primary">
        {/* Thumbnail Background */}
        <div className="relative aspect-video w-full overflow-hidden bg-muted">
          <TierListThumbnail tierList={tierList} className="absolute inset-0" />

          {/* Overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

          {/* Badges - Top Left */}
          <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
            {isRecent && (
              <Badge className="bg-green-500/90 text-white text-xs">
                Recém Criada
              </Badge>
            )}
            {isPopular && (
              <Badge className="bg-yellow-500/90 text-white text-xs">
                Popular
              </Badge>
            )}
            {tierList.category_name && (
              <Badge className="bg-primary/90 text-primary-foreground text-xs">
                {tierList.category_name}
              </Badge>
            )}
          </div>

          {/* Stats - Top Right */}
          <div className="absolute top-2 right-2 z-10 flex flex-col gap-1 items-end">
            <div className="flex items-center gap-1 px-2 py-1 bg-black/60 text-white rounded text-xs font-medium backdrop-blur-sm">
              <Eye className="h-3 w-3" />
              <span>{tierList.views_count}</span>
            </div>
            <button
              onClick={handleLike}
              disabled={isLiking}
              className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium backdrop-blur-sm transition-colors ${
                liked
                  ? 'bg-red-500/90 text-white'
                  : 'bg-black/60 text-white hover:bg-red-500/70'
              }`}
            >
              <Heart className={`h-3 w-3 ${liked ? 'fill-current' : ''}`} />
              <span>{likesCount}</span>
            </button>
          </div>

          {/* Title and Template - Bottom */}
          <div className="absolute bottom-0 left-0 right-0 z-10 p-3 bg-black/60 backdrop-blur-sm">
            <h3 className="text-white font-semibold text-sm line-clamp-2 drop-shadow-lg mb-1">
              {tierList.title}
            </h3>
            {tierList.template_name && (
              <p className="text-white/80 text-xs line-clamp-1">
                Template: {tierList.template_name}
              </p>
            )}
            <p className="text-white/60 text-xs mt-1">
              {new Date(tierList.created_at).toLocaleDateString('pt-BR')}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-3 bg-background flex gap-2 min-w-0">
          <Link
            href={`/tier-lists/${tierList.id}`}
            className="flex-1 min-w-[80px] sm:min-w-0"
            onClick={(e) => e.stopPropagation()}
          >
            <Button variant="outline" size="sm" className="w-full text-xs">
              <ExternalLink className="h-3 w-3 mr-1 flex-shrink-0" />
              <span>Ver</span>
            </Button>
          </Link>
          <div onClick={(e) => e.stopPropagation()} className="flex-shrink-0">
            <ShareButton
              type="tier_list"
              data={tierList}
              size="sm"
              variant="outline"
              className="min-w-[60px]"
            />
          </div>
          <Link
            href={`/editor/${tierList.template_id}`}
            onClick={(e) => e.stopPropagation()}
            className="flex-shrink-0 min-w-[80px]"
          >
            <Button variant="outline" size="sm" className="text-xs w-full whitespace-nowrap">
              <Plus className="h-3 w-3 mr-1 flex-shrink-0" />
              <span>Criar</span>
            </Button>
          </Link>
        </div>
      </Card>
    </Link>
  )
}
