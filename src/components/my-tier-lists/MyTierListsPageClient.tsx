'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useTranslation } from '@/hooks/useTranslation'
import { TierListThumbnail } from './TierListThumbnail'
import { Switch } from '@/components/ui/switch'
import { Trash2, Globe, Lock } from 'lucide-react'
import { useState } from 'react'
import { TierListService } from '@/services/tierList.service'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { AdSpace } from '@/components/ads/AdSpace'
import { PageWithSidebar } from '@/components/layout/PageWithSidebar'
import type { TierList, TierListWithData } from '@/types/tierList.types'

interface MyTierListsPageClientProps {
  tierLists: (TierList | TierListWithData)[]
}

export function MyTierListsPageClient({ tierLists: initialTierLists }: MyTierListsPageClientProps) {
  const { t } = useTranslation()
  const { user } = useAuth()
  const router = useRouter()
  const [tierLists, setTierLists] = useState(initialTierLists)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [tierListToDelete, setTierListToDelete] = useState<{ id: string; title: string } | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [updatingPublic, setUpdatingPublic] = useState<string | null>(null)
  const [errorDialogOpen, setErrorDialogOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleDeleteClick = (tierListId: string, tierListTitle: string) => {
    setTierListToDelete({ id: tierListId, title: tierListTitle })
    setDeleteDialogOpen(true)
    setDeleteError(null)
  }

  const handleDeleteConfirm = async () => {
    if (!user || !tierListToDelete) return

    setDeleting(tierListToDelete.id)
    setDeleteError(null)
    
    try {
      const tierListService = new TierListService()
      await tierListService.deleteTierList(tierListToDelete.id, user.id)
      setTierLists(tierLists.filter(t => t.id !== tierListToDelete.id))
      setDeleteDialogOpen(false)
      setTierListToDelete(null)
      router.refresh()
    } catch (error) {
      console.error('Error deleting tier list:', error)
      setDeleteError(t('myTierLists.deleteError') || 'Error deleting tier list. Please try again.')
    } finally {
      setDeleting(null)
    }
  }

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false)
    setTierListToDelete(null)
    setDeleteError(null)
  }

  const handleTogglePublic = async (tierListId: string, currentIsPublic: boolean) => {
    if (!user) return

    setUpdatingPublic(tierListId)
    try {
      const response = await fetch(`/api/tierlists/${tierListId}/public`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_public: !currentIsPublic }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update tier list')
      }

      // Atualizar estado local
      setTierLists(
        tierLists.map((tl) =>
          tl.id === tierListId ? { ...tl, is_public: !currentIsPublic } : tl
        )
      )
    } catch (error) {
      console.error('Error updating tier list:', error)
      setErrorMessage(
        error instanceof Error ? error.message : 'Erro desconhecido ao atualizar tier list'
      )
      setErrorDialogOpen(true)
    } finally {
      setUpdatingPublic(null)
    }
  }

  return (
    <TooltipProvider>
      <main className="min-h-screen p-4 sm:p-6 md:p-8">
        <PageWithSidebar showRightSidebar={true}>
          <div className="mb-6 md:mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">{t('myTierLists.title')}</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              {t('myTierLists.manageDescription') || t('myTierLists.createFirst')}
            </p>
          </div>

          {tierLists.length === 0 ? (
            <div className="text-center py-8 md:py-12 px-4">
              <p className="text-muted-foreground mb-4">{t('myTierLists.noTierLists')}</p>
              <Link href="/templates">
                <Button>{t('home.browseTemplates')}</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {tierLists.map((tierList, index) => {
                const hasFullData = 'tiers' in tierList && 'items' in tierList
                
                return (
                  <div key={tierList.id}>
                    <Card 
                      className="relative group overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-300 ease-in-out hover:scale-[1.02] hover:border-primary border-2 border-transparent"
                    >
                    {/* Thumbnail Background */}
                    <div className="relative aspect-video w-full overflow-hidden bg-muted">
                      {hasFullData ? (
                        <TierListThumbnail tierList={tierList as TierListWithData} className="absolute inset-0" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <p className="text-muted-foreground text-sm">Loading preview...</p>
                        </div>
                      )}
                      
                      {/* Overlay for text readability */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                      
                      {/* Title - Bottom */}
                      <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
                        <h3 className="text-lg font-bold text-white line-clamp-2">
                          {tierList.title}
                        </h3>
                      </div>

                      {/* Date - Top Right */}
                      <div className="absolute top-2 right-2 z-10 px-2 py-1 bg-black/60 text-white rounded-md text-xs font-semibold">
                        {new Date(tierList.created_at).toLocaleDateString('pt-BR')}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <CardFooter className="p-3 sm:p-4 bg-background flex flex-col gap-2">
                      <div className="flex items-center justify-between w-full gap-2">
                        <div className="flex items-center gap-2 flex-1">
                          {tierList.is_public ? (
                            <Globe className="h-4 w-4 text-primary" />
                          ) : (
                            <Lock className="h-4 w-4 text-muted-foreground" />
                          )}
                          <Label htmlFor={`public-${tierList.id}`} className="text-xs sm:text-sm cursor-pointer flex-1">
                            {tierList.is_public ? 'Pública' : 'Privada'}
                          </Label>
                          <Switch
                            id={`public-${tierList.id}`}
                            checked={tierList.is_public}
                            onCheckedChange={() => handleTogglePublic(tierList.id, tierList.is_public)}
                            disabled={updatingPublic === tierList.id}
                          />
                        </div>
                      </div>
                      
                      <div className="flex gap-2 w-full">
                        <Link href={`/tier-lists/${tierList.id}`} className="flex-1">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="outline" className="w-full text-sm sm:text-base touch-manipulation">
                                {t('common.view') || 'View'}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{t('myTierLists.viewTooltip') || 'View this tier list'}</p>
                            </TooltipContent>
                          </Tooltip>
                        </Link>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteClick(tierList.id, tierList.title)}
                              disabled={deleting === tierList.id}
                              className="touch-manipulation"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{t('myTierLists.deleteTooltip') || 'Delete this tier list'}</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </CardFooter>
                  </Card>
                  {/* Ad Space - In Feed (a cada 6 cards) */}
                  {/* BANNERS DESABILITADOS TEMPORARIAMENTE */}
                  {/* {(index + 1) % 6 === 0 && <AdSpace position="in-feed" className="mt-4 col-span-full" />} */}
                  </div>
                )
              })}
            </div>
          )}
        </PageWithSidebar>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('myTierLists.confirmDeleteTitle') || 'Delete Tier List'}</DialogTitle>
              <DialogDescription>
                {tierListToDelete && (
                  <>
                    {t('myTierLists.confirmDeleteMessage', { tierListTitle: tierListToDelete.title }) || 
                     `Are you sure you want to delete "${tierListToDelete.title}"? This action cannot be undone.`}
                  </>
                )}
              </DialogDescription>
            </DialogHeader>
            {deleteError && (
              <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
                {deleteError}
              </div>
            )}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={handleDeleteCancel}
                disabled={deleting !== null}
              >
                {t('common.cancel')}
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteConfirm}
                disabled={deleting !== null}
              >
                {deleting !== null 
                  ? (t('myTierLists.deleting') || 'Deleting...')
                  : (t('common.delete') || 'Delete')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Error Dialog */}
        <Dialog open={errorDialogOpen} onOpenChange={setErrorDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Erro ao Atualizar Tier List</DialogTitle>
              <DialogDescription>
                {errorMessage || 'Ocorreu um erro ao atualizar a tier list. Por favor, tente novamente.'}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button onClick={() => setErrorDialogOpen(false)}>
                Fechar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </TooltipProvider>
  )
}

