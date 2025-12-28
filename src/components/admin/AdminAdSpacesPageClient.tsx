'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react'
import { AdSpaceFormDialog } from './AdSpaceFormDialog'
import { AdSpaceService } from '@/services/adSpace.service'
import { ImageService } from '@/services/image.service'
import { useRouter } from 'next/navigation'
import type { AdSpace } from '@/types/adSpace.types'
import { Badge } from '@/components/ui/badge'

interface AdminAdSpacesPageClientProps {
  adSpaces: AdSpace[]
}

export function AdminAdSpacesPageClient({ adSpaces: initialAdSpaces }: AdminAdSpacesPageClientProps) {
  const [adSpaces, setAdSpaces] = useState<AdSpace[]>(initialAdSpaces)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingAdSpace, setEditingAdSpace] = useState<AdSpace | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [toggling, setToggling] = useState<string | null>(null)
  const router = useRouter()
  const adSpaceService = new AdSpaceService()
  const imageService = new ImageService()

  const handleCreate = () => {
    setEditingAdSpace(null)
    setIsDialogOpen(true)
  }

  const handleEdit = (adSpace: AdSpace) => {
    setEditingAdSpace(adSpace)
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este espaço de publicidade?')) {
      return
    }

    setDeleting(id)
    try {
      await adSpaceService.deleteAdSpace(id)
      setAdSpaces(adSpaces.filter(a => a.id !== id))
      router.refresh()
    } catch (error) {
      console.error('Error deleting ad space:', error)
      alert('Erro ao excluir espaço. Por favor, tente novamente.')
    } finally {
      setDeleting(null)
    }
  }

  const handleToggleActive = async (id: string) => {
    setToggling(id)
    try {
      const updated = await adSpaceService.toggleAdSpaceActive(id)
      setAdSpaces(adSpaces.map(a => a.id === id ? updated : a))
      router.refresh()
    } catch (error) {
      console.error('Error toggling ad space:', error)
      alert('Erro ao alterar status. Por favor, tente novamente.')
    } finally {
      setToggling(null)
    }
  }

  const handleSave = async (data: {
    name: string
    position: string
    device_type: 'all' | 'desktop' | 'mobile'
    ad_type: 'manual' | 'google'
    manual_image_url?: string | null
    manual_link_url?: string | null
    manual_alt_text?: string | null
    google_ad_client?: string | null
    google_ad_slot?: string | null
    google_ad_format?: string | null
    is_active?: boolean
    priority?: number
    image?: File | null
    imageRemoved?: boolean
  }) => {
    try {
      let imageUrl = data.manual_image_url

      // Upload image if provided
      if (data.image) {
        imageUrl = await imageService.uploadImage(data.image)
      } else if (data.imageRemoved) {
        imageUrl = null
      }

      if (editingAdSpace) {
        const updated = await adSpaceService.updateAdSpace(editingAdSpace.id, {
          name: data.name,
          position: data.position,
          device_type: data.device_type,
          ad_type: data.ad_type,
          manual_image_url: imageUrl,
          manual_link_url: data.manual_link_url,
          manual_alt_text: data.manual_alt_text,
          google_ad_client: data.google_ad_client,
          google_ad_slot: data.google_ad_slot,
          google_ad_format: data.google_ad_format,
          is_active: data.is_active,
          priority: data.priority,
        })
        setAdSpaces(adSpaces.map(a => a.id === editingAdSpace.id ? updated : a))
      } else {
        const created = await adSpaceService.createAdSpace({
          name: data.name,
          position: data.position,
          device_type: data.device_type,
          ad_type: data.ad_type,
          manual_image_url: imageUrl,
          manual_link_url: data.manual_link_url,
          manual_alt_text: data.manual_alt_text,
          google_ad_client: data.google_ad_client,
          google_ad_slot: data.google_ad_slot,
          google_ad_format: data.google_ad_format,
          is_active: data.is_active,
          priority: data.priority,
        })
        setAdSpaces([...adSpaces, created])
      }
      setIsDialogOpen(false)
      router.refresh()
    } catch (error) {
      console.error('Error saving ad space:', error)
      throw error
    }
  }

  return (
    <main className="min-h-screen p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 md:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">
                Gerenciar Espaços de Publicidade
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                Configure espaços de publicidade manual ou Google AdSense
              </p>
            </div>
            <Button onClick={handleCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Espaço
            </Button>
          </div>
        </div>

        {adSpaces.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">
                Nenhum espaço de publicidade criado ainda.
              </p>
              <Button onClick={handleCreate}>
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeiro Espaço
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {adSpaces.map((adSpace) => (
              <Card key={adSpace.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{adSpace.name}</CardTitle>
                      <CardDescription className="mt-1">
                        {adSpace.position} • {adSpace.device_type}
                      </CardDescription>
                    </div>
                    <Badge variant={adSpace.is_active ? 'default' : 'secondary'}>
                      {adSpace.is_active ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Tipo:</span>
                      <Badge variant="outline">{adSpace.ad_type}</Badge>
                    </div>
                    {adSpace.ad_type === 'manual' && adSpace.manual_image_url && (
                      <div className="relative w-full h-32 rounded-lg overflow-hidden border">
                        <img
                          src={adSpace.manual_image_url}
                          alt={adSpace.manual_alt_text || 'Ad preview'}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    {adSpace.ad_type === 'google' && (
                      <div className="text-sm text-muted-foreground">
                        <div>Client: {adSpace.google_ad_client || 'N/A'}</div>
                        <div>Slot: {adSpace.google_ad_slot || 'N/A'}</div>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(adSpace)}
                      className="flex-1"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleActive(adSpace.id)}
                      disabled={toggling === adSpace.id}
                    >
                      {adSpace.is_active ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(adSpace.id)}
                      disabled={deleting === adSpace.id}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <AdSpaceFormDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          adSpace={editingAdSpace}
          onSave={handleSave}
        />
      </div>
    </main>
  )
}

