'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Select } from '@/components/ui/select'
import { ImageService } from '@/services/image.service'
import { Upload, X } from 'lucide-react'
import Image from 'next/image'
import type { AdSpace } from '@/types/adSpace.types'
import { getAdPositionLabels } from '@/lib/ads/positions'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'

interface AdSpaceFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  adSpace: AdSpace | null
  onSave: (data: {
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
  }) => Promise<void>
}

export function AdSpaceFormDialog({
  open,
  onOpenChange,
  adSpace,
  onSave,
}: AdSpaceFormDialogProps) {
  const [name, setName] = useState('')
  const [position, setPosition] = useState('')
  const [deviceType, setDeviceType] = useState<'all' | 'desktop' | 'mobile'>('all')
  const [adType, setAdType] = useState<'manual' | 'google'>('manual')
  const [manualLinkUrl, setManualLinkUrl] = useState('')
  const [manualAltText, setManualAltText] = useState('')
  const [googleAdClient, setGoogleAdClient] = useState('')
  const [googleAdSlot, setGoogleAdSlot] = useState('')
  const [googleAdFormat, setGoogleAdFormat] = useState('auto')
  const [isActive, setIsActive] = useState(true)
  const [priority, setPriority] = useState(0)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageRemoved, setImageRemoved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const imageService = new ImageService()
  const positions = getAdPositionLabels()

  // Reset form when dialog opens/closes or adSpace changes
  useEffect(() => {
    if (open) {
      if (adSpace) {
        setName(adSpace.name)
        setPosition(adSpace.position)
        setDeviceType(adSpace.device_type)
        setAdType(adSpace.ad_type)
        setManualLinkUrl(adSpace.manual_link_url || '')
        setManualAltText(adSpace.manual_alt_text || '')
        setGoogleAdClient(adSpace.google_ad_client || '')
        setGoogleAdSlot(adSpace.google_ad_slot || '')
        setGoogleAdFormat(adSpace.google_ad_format || 'auto')
        setIsActive(adSpace.is_active)
        setPriority(adSpace.priority)
        setImagePreview(adSpace.manual_image_url)
        setImageFile(null)
        setImageRemoved(false)
      } else {
        setName('')
        setPosition('')
        setDeviceType('all')
        setAdType('manual')
        setManualLinkUrl('')
        setManualAltText('')
        setGoogleAdClient('')
        setGoogleAdSlot('')
        setGoogleAdFormat('auto')
        setIsActive(true)
        setPriority(0)
        setImagePreview(null)
        setImageFile(null)
        setImageRemoved(false)
      }
      setError(null)
    }
  }, [open, adSpace])

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const validation = imageService.validateImageFile(file)
    if (!validation.valid) {
      setError(validation.error || 'Arquivo inválido')
      return
    }

    try {
      const preview = await imageService.createPreviewUrl(file)
      setImageFile(file)
      setImagePreview(preview)
      setImageRemoved(false)
      setError(null)
    } catch (err) {
      setError('Erro ao processar imagem')
    }
  }

  const removeImage = () => {
    setImageFile(null)
    setImagePreview(null)
    setImageRemoved(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!name.trim()) {
      setError('Nome do espaço é obrigatório')
      return
    }

    if (!position) {
      setError('Posição é obrigatória')
      return
    }

    if (adType === 'manual' && !imagePreview && !imageFile && !imageRemoved) {
      setError('Imagem é obrigatória para publicidade manual')
      return
    }

    if (adType === 'google') {
      if (!googleAdClient.trim()) {
        setError('Google Ad Client é obrigatório')
        return
      }
      if (!googleAdSlot.trim()) {
        setError('Google Ad Slot é obrigatório')
        return
      }
    }

    setSaving(true)
    try {
      await onSave({
        name: name.trim(),
        position,
        device_type: deviceType,
        ad_type: adType,
        manual_image_url: adSpace?.manual_image_url || null,
        manual_link_url: manualLinkUrl.trim() || null,
        manual_alt_text: manualAltText.trim() || null,
        google_ad_client: googleAdClient.trim() || null,
        google_ad_slot: googleAdSlot.trim() || null,
        google_ad_format: googleAdFormat,
        is_active: isActive,
        priority: priority || 0,
        image: imageFile,
        imageRemoved: imageRemoved,
      })
      onOpenChange(false)
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar espaço')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {adSpace ? 'Editar Espaço de Publicidade' : 'Novo Espaço de Publicidade'}
          </DialogTitle>
          <DialogDescription>
            {adSpace
              ? 'Atualize as informações do espaço de publicidade'
              : 'Configure um novo espaço de publicidade'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Banner Topo Homepage"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="position">Posição *</Label>
              <Select value={position} onValueChange={setPosition} required>
                <option value="">Selecione a posição</option>
                {positions.map((pos) => (
                  <option key={pos.value} value={pos.value}>
                    {pos.label}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="device_type">Tipo de Dispositivo</Label>
              <Select value={deviceType} onValueChange={(v: any) => setDeviceType(v)}>
                <option value="all">Todos</option>
                <option value="desktop">Desktop</option>
                <option value="mobile">Mobile</option>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ad_type">Tipo de Publicidade *</Label>
              <Select value={adType} onValueChange={(v: any) => setAdType(v)} required>
                <option value="manual">Manual</option>
                <option value="google">Google AdSense</option>
              </Select>
            </div>
          </div>

          {adType === 'manual' && (
            <>
              <div className="space-y-2">
                <Label>Imagem *</Label>
                {imagePreview ? (
                  <div className="relative w-full h-48 rounded-lg overflow-hidden border">
                    <Image
                      src={imagePreview}
                      alt="Preview"
                      fill
                      className="object-contain"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-2 right-2 p-1 bg-destructive text-destructive-foreground rounded-full"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <label
                    htmlFor="image-upload"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-accent transition-colors"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                      <p className="mb-2 text-sm text-muted-foreground">
                        <span className="font-semibold">Clique para upload</span> ou arraste e solte
                      </p>
                      <p className="text-xs text-muted-foreground">
                        PNG, JPG, GIF, WEBP até 5MB
                      </p>
                    </div>
                    <input
                      id="image-upload"
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageSelect}
                    />
                  </label>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="manual_link_url">URL de Destino</Label>
                <Input
                  id="manual_link_url"
                  type="url"
                  value={manualLinkUrl}
                  onChange={(e) => setManualLinkUrl(e.target.value)}
                  placeholder="https://exemplo.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="manual_alt_text">Texto Alternativo</Label>
                <Input
                  id="manual_alt_text"
                  value={manualAltText}
                  onChange={(e) => setManualAltText(e.target.value)}
                  placeholder="Descrição da imagem"
                />
              </div>
            </>
          )}

          {adType === 'google' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="google_ad_client">Google Ad Client *</Label>
                <Input
                  id="google_ad_client"
                  value={googleAdClient}
                  onChange={(e) => setGoogleAdClient(e.target.value)}
                  placeholder="ca-pub-xxxxxxxxxxxxxxxx"
                  required={adType === 'google'}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="google_ad_slot">Google Ad Slot *</Label>
                <Input
                  id="google_ad_slot"
                  value={googleAdSlot}
                  onChange={(e) => setGoogleAdSlot(e.target.value)}
                  placeholder="1234567890"
                  required={adType === 'google'}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="google_ad_format">Formato</Label>
                <Select value={googleAdFormat} onValueChange={setGoogleAdFormat}>
                  <option value="auto">Auto</option>
                  <option value="rectangle">Rectangle</option>
                  <option value="horizontal">Horizontal</option>
                  <option value="vertical">Vertical</option>
                </Select>
              </div>
            </>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority">Prioridade</Label>
              <Input
                id="priority"
                type="number"
                value={priority}
                onChange={(e) => setPriority(parseInt(e.target.value) || 0)}
                min="0"
              />
            </div>

            <div className="flex items-center space-x-2 pt-8">
              <Switch
                id="is_active"
                checked={isActive}
                onCheckedChange={setIsActive}
              />
              <Label htmlFor="is_active">Ativo</Label>
            </div>
          </div>

          {error && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
              {error}
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Salvando...' : adSpace ? 'Atualizar' : 'Criar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

