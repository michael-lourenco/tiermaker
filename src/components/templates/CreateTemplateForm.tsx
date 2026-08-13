'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { v4 as uuidv4 } from 'uuid'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { TemplateService } from '@/services/template.service'
import { CategoryService, type Category } from '@/services/category.service'
import { ImageService } from '@/services/image.service'
import { useAuth } from '@/hooks/useAuth'
import { useTranslation } from '@/hooks/useTranslation'
import Image from 'next/image'
import { X, Upload } from 'lucide-react'
import { TemplateTiersVisualEditor, type TemplateTier } from './TemplateTiersVisualEditor'
import { DEFAULT_TIERS, TIER_COLORS } from '@/lib/constants/tiers'

const templateSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  description: z.string().optional(),
  category_id: z.string().min(1, 'Category is required'),
  is_public: z.boolean().default(true),
})

type TemplateFormData = z.infer<typeof templateSchema>

/** Criação normal: ficheiro local; clone: imagem do template; clone: novo upload já no S3 */
type TemplateFormItem =
  | {
      id: string
      name: string
      kind: 'file'
      file: File
      preview: string
    }
  | {
      id: string
      name: string
      kind: 'cloned'
      imageUrl: string
      preview: string
    }
  | {
      id: string
      name: string
      kind: 'uploadedNew'
      preview: string
      uploadedUrl: string
    }

type CoverForm =
  | null
  | { kind: 'file'; file: File; preview: string }
  | { kind: 'cloned'; imageUrl: string; preview: string }
  | { kind: 'uploadedNew'; preview: string; uploadedUrl: string }

export interface CreateTemplateFormProps {
  initialCloneFromId?: string
}

export function CreateTemplateForm({ initialCloneFromId }: CreateTemplateFormProps) {
  const [items, setItems] = useState<TemplateFormItem[]>([])
  const [cover, setCover] = useState<CoverForm>(null)
  const [tiers, setTiers] = useState<TemplateTier[]>(
    DEFAULT_TIERS.map((name, index) => ({
      id: `tier-${name}-${Date.now()}-${index}`,
      tier_name: name,
      tier_order: index,
      color: TIER_COLORS[name] || null,
    }))
  )
  const [uploading, setUploading] = useState(false)
  const [addingItemBusy, setAddingItemBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [cloneSourceId, setCloneSourceId] = useState<string | null>(null)
  const [cloneSourceName, setCloneSourceName] = useState<string | null>(null)
  const [cloneLoading, setCloneLoading] = useState(false)
  const [cloneLoadError, setCloneLoadError] = useState<string | null>(null)
  const [cloneIdInput, setCloneIdInput] = useState(initialCloneFromId?.trim() || '')
  const { user } = useAuth()
  const { t } = useTranslation()
  const router = useRouter()
  const imageService = new ImageService()
  const categoryService = new CategoryService()
  const isCloneMode = Boolean(cloneSourceId)
  const hadCloneFromUrlRef = useRef(Boolean(initialCloneFromId?.trim()))

  useEffect(() => {
    setCloneIdInput(initialCloneFromId?.trim() || '')
  }, [initialCloneFromId])

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const cats = await categoryService.getAllCategories()
        setCategories(cats)
      } catch {
        setError('Failed to load categories. Using default list.')
        setCategories([])
      } finally {
        setLoadingCategories(false)
      }
    }
    loadCategories()
  }, [])

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<TemplateFormData>({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      is_public: true,
    },
  })

  const wantsPublic = watch('is_public')
  const hasCover = Boolean(cover)

  const mapTiersFromTemplate = useCallback(
    (sourceTiers: { tier_name: string; tier_order: number; color: string | null }[] | undefined) => {
      const base =
        sourceTiers && sourceTiers.length > 0
          ? [...sourceTiers].sort((a, b) => a.tier_order - b.tier_order)
          : DEFAULT_TIERS.map((name, index) => ({
              tier_name: name,
              tier_order: index,
              color: TIER_COLORS[name] || null,
            }))
      return base.map((tier, index) => ({
        id: `tier-${uuidv4()}-${index}`,
        tier_name: tier.tier_name,
        tier_order: tier.tier_order,
        color: tier.color,
      }))
    },
    []
  )

  // Só reseta o formulário ao SAIR do modo clone (URL `from` removida).
  // Não depende de `reset` a cada render — isso recriava tiers padrão e apagava edições.
  useEffect(() => {
    const hasCloneFromUrl = Boolean(initialCloneFromId?.trim())
    if (hasCloneFromUrl) {
      hadCloneFromUrlRef.current = true
      return
    }
    if (!hadCloneFromUrlRef.current) return
    hadCloneFromUrlRef.current = false

    setCloneSourceId(null)
    setCloneSourceName(null)
    setCloneLoadError(null)
    setCloneLoading(false)
    setItems([])
    setCover(null)
    setTiers(
      DEFAULT_TIERS.map((name, index) => ({
        id: `tier-${name}-${Date.now()}-${index}`,
        tier_name: name,
        tier_order: index,
        color: TIER_COLORS[name] || null,
      }))
    )
    reset({
      name: '',
      description: '',
      category_id: '',
      is_public: true,
    })
  }, [initialCloneFromId, reset])

  // Carrega o template original só quando `from` na URL muda. Não incluir `t` (useTranslation) nas
  // deps: antes era uma nova função a cada render e re-disparava o efeito, revertendo o formulário.
  useEffect(() => {
    if (!initialCloneFromId?.trim()) return

    let cancelled = false
    const id = initialCloneFromId.trim()

    const load = async () => {
      setCloneLoading(true)
      setCloneLoadError(null)
      try {
        const svc = new TemplateService()
        const tpl = await svc.getTemplateById(id, false)
        if (cancelled) return
        if (!tpl) {
          setCloneLoadError(t('createTemplate.cloneLoadError'))
          setCloneSourceId(null)
          setCloneSourceName(null)
          return
        }

        setCloneSourceId(id)
        setCloneSourceName(tpl.name)

        reset({
          name: `${tpl.name}${t('createTemplate.cloneNameSuffix')}`,
          description: tpl.description || '',
          category_id: tpl.categories?.[0]?.id || '',
          is_public: tpl.is_public,
        })

        setItems(
          [...tpl.items]
            .sort((a, b) => a.order - b.order)
            .map((it) => ({
              id: uuidv4(),
              name: it.name,
              kind: 'cloned' as const,
              imageUrl: it.image_url,
              preview: it.image_url,
            }))
        )

        if (tpl.cover_image_url) {
          setCover({
            kind: 'cloned',
            imageUrl: tpl.cover_image_url,
            preview: tpl.cover_image_url,
          })
        } else {
          setCover(null)
        }

        setTiers(mapTiersFromTemplate(tpl.tiers))
      } catch {
        if (!cancelled) {
          setCloneLoadError(t('createTemplate.cloneLoadError'))
          setCloneSourceId(null)
          setCloneSourceName(null)
        }
      } finally {
        if (!cancelled) setCloneLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [initialCloneFromId]) // eslint-disable-line react-hooks/exhaustive-deps -- só quando `from` muda

  const deleteCoverUploadIfNeeded = async (c: CoverForm) => {
    if (c?.kind === 'uploadedNew' && c.uploadedUrl) {
      try {
        await imageService.deleteUploadedImage(c.uploadedUrl)
      } catch {
        /* best-effort */
      }
    }
  }

  const handleCoverImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const validation = imageService.validateImageFile(file)
    if (!validation.valid) {
      setError(validation.error || 'Invalid file')
      return
    }

    try {
      if (isCloneMode) {
        setUploading(true)
        await deleteCoverUploadIfNeeded(cover)
        const uploadedUrl = await imageService.uploadImage(file)
        setCover({
          kind: 'uploadedNew',
          preview: uploadedUrl,
          uploadedUrl,
        })
      } else {
        const preview = await imageService.createPreviewUrl(file)
        setCover({ kind: 'file', file, preview })
      }
      setError(null)
    } catch {
      setError('Failed to process cover image')
    } finally {
      setUploading(false)
    }
    e.target.value = ''
  }

  const removeCoverImage = async () => {
    await deleteCoverUploadIfNeeded(cover)
    setCover(null)
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])

    for (const file of files) {
      const validation = imageService.validateImageFile(file)
      if (!validation.valid) {
        setError(validation.error || 'Invalid file')
        continue
      }

      try {
        if (isCloneMode) {
          setAddingItemBusy(true)
          const uploadedUrl = await imageService.uploadImage(file)
          setItems((prev) => [
            ...prev,
            {
              id: uuidv4(),
              name: file.name.replace(/\.[^/.]+$/, ''),
              kind: 'uploadedNew',
              preview: uploadedUrl,
              uploadedUrl,
            },
          ])
        } else {
          const preview = await imageService.createPreviewUrl(file)
          setItems((prev) => [
            ...prev,
            {
              id: uuidv4(),
              name: file.name.replace(/\.[^/.]+$/, ''),
              kind: 'file',
              file,
              preview,
            },
          ])
        }
        setError(null)
      } catch {
        setError('Failed to process image')
      } finally {
        setAddingItemBusy(false)
      }
    }
    e.target.value = ''
  }

  const removeItem = (id: string) => {
    const item = items.find((i) => i.id === id)
    if (item?.kind === 'uploadedNew') {
      void imageService.deleteUploadedImage(item.uploadedUrl).catch(() => {})
    }
    setItems((prev) => prev.filter((i) => i.id !== id))
  }

  const updateItemName = (id: string, name: string) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, name } : item)))
  }

  const applyCloneById = () => {
    const id = cloneIdInput.trim()
    if (!id) return
    router.push(`/create-template?from=${encodeURIComponent(id)}`)
  }

  const onSubmit = async (data: TemplateFormData) => {
    if (!user) {
      setError('You must be logged in to create a template')
      return
    }

    if (items.length === 0) {
      setError('Please add at least one item to the template')
      return
    }

    if (data.is_public && !cover) {
      setError(t('createTemplate.coverRequiredForPublic'))
      return
    }

    if (isCloneMode) {
      for (const it of items) {
        if (it.kind === 'uploadedNew' && !it.uploadedUrl) {
          setError(t('createTemplate.cloneInvalidNewItem'))
          return
        }
      }
      if (cover?.kind === 'uploadedNew' && !cover.uploadedUrl) {
        setError(t('createTemplate.cloneInvalidCover'))
        return
      }
    }

    setUploading(true)
    setError(null)

    try {
      const tiersToSend = tiers.map((tier) => ({
        tier_name: tier.tier_name,
        tier_order: tier.tier_order,
        color: tier.color,
      }))

      const selectedCategory = categories.find((c) => c.id === data.category_id)
      if (!selectedCategory) {
        throw new Error('Selected category not found')
      }

      if (isCloneMode && cloneSourceId) {
        let coverPayload: null | { source: 'cloned' | 'new'; image_url: string } = null
        if (cover) {
          if (cover.kind === 'cloned') {
            coverPayload = { source: 'cloned', image_url: cover.imageUrl }
          } else if (cover.kind === 'uploadedNew') {
            coverPayload = { source: 'new', image_url: cover.uploadedUrl }
          }
        }

        const cloneItems = items.map((it, index) => {
          if (it.kind === 'cloned') {
            return {
              name: it.name,
              order: index,
              source: 'cloned' as const,
              image_url: it.imageUrl,
            }
          }
          if (it.kind === 'uploadedNew') {
            return {
              name: it.name,
              order: index,
              source: 'new' as const,
              image_url: it.uploadedUrl,
            }
          }
          throw new Error(t('createTemplate.cloneInvalidNewItem'))
        })

        const response = await fetch('/api/templates/clone', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            source_template_id: cloneSourceId,
            name: data.name,
            description: data.description,
            category_id: data.category_id,
            is_public: data.is_public,
            cover_image: coverPayload,
            items: cloneItems,
            tiers: tiersToSend.length > 0 ? tiersToSend : undefined,
          }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to clone template')
        }

        const { template } = await response.json()
        router.push(`/templates/${template.id}`)
        return
      }

      let coverImageUrl: string | undefined
      if (cover?.kind === 'file') {
        coverImageUrl = await imageService.uploadImage(cover.file)
      }

      const uploadedItems = await Promise.all(
        items.map(async (item, index) => {
          if (item.kind !== 'file') {
            throw new Error('Invalid item state')
          }
          const imageUrl = await imageService.uploadImage(item.file)
          return {
            name: item.name,
            image_url: imageUrl,
            order: index,
          }
        })
      )

      const response = await fetch('/api/templates/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          description: data.description,
          category_id: data.category_id,
          cover_image_url: coverImageUrl,
          is_public: data.is_public,
          items: uploadedItems,
          tiers: tiersToSend.length > 0 ? tiersToSend : undefined,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create template')
      }

      const { template } = await response.json()
      router.push(`/templates/${template.id}`)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create template. Please try again.'
      setError(message)
    } finally {
      setUploading(false)
    }
  }

  const submitLabel = isCloneMode
    ? uploading
      ? t('createTemplate.savingClonedTemplate')
      : t('createTemplate.saveClonedTemplate')
    : uploading
      ? t('createTemplate.creatingTemplate')
      : t('createTemplate.createTemplate')

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-2 md:space-y-3 px-2 sm:px-3 md:px-0">
      <Card>
        <CardHeader className="p-3 space-y-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <CardTitle className="text-xl sm:text-2xl w-fit cursor-help">
                {isCloneMode ? t('createTemplate.cloneModeTitle') : t('createTemplate.title')}
              </CardTitle>
            </TooltipTrigger>
            <TooltipContent side="bottom" align="start" className="max-w-sm text-left">
              <p>{isCloneMode ? t('createTemplate.cloneModeSubtitle') : t('createTemplate.subtitle')}</p>
            </TooltipContent>
          </Tooltip>
          {isCloneMode && cloneSourceName && (
            <p className="text-sm text-muted-foreground pt-0.5">
              {t('createTemplate.cloneBasedOn', { name: cloneSourceName })}
            </p>
          )}
        </CardHeader>
        <CardContent className="space-y-2 p-3 pt-0">
          <div className="space-y-1.5 rounded-lg border border-dashed p-1.5 sm:p-2">
            <p className="text-sm font-medium">{t('createTemplate.cloneByIdLabel')}</p>
            <div className="flex flex-col sm:flex-row gap-1.5">
              <Input
                value={cloneIdInput}
                onChange={(e) => setCloneIdInput(e.target.value)}
                placeholder={t('createTemplate.cloneByIdPlaceholder')}
                className="font-mono text-sm"
              />
              <Button type="button" variant="secondary" onClick={applyCloneById} disabled={!cloneIdInput.trim()}>
                {t('createTemplate.cloneByIdButton')}
              </Button>
            </div>
          </div>

          {cloneLoading && (
            <p className="text-sm text-muted-foreground">{t('createTemplate.cloneLoading')}</p>
          )}
          {cloneLoadError && (
            <div className="p-1.5 text-sm text-destructive bg-destructive/10 rounded-md">{cloneLoadError}</div>
          )}

          <div className="space-y-1">
            <label className="text-sm font-medium">{t('createTemplate.coverImage')}</label>
            {cover ? (
              <div className="relative group">
                <div className="relative w-full h-40 sm:h-48 rounded-lg overflow-hidden border">
                  <Image
                    src={cover.preview}
                    alt="Cover preview"
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                    unoptimized={cover.kind === 'file'}
                  />
                  <button
                    type="button"
                    onClick={() => void removeCoverImage()}
                    className="absolute top-2 right-2 p-1.5 sm:p-1 bg-destructive text-destructive-foreground rounded-full opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity touch-manipulation"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ) : (
              <label
                htmlFor="cover-upload"
                className="flex flex-col items-center justify-center w-full h-28 sm:h-32 border-2 border-dashed border-border rounded-lg cursor-pointer active:bg-accent transition-colors touch-manipulation"
              >
                <div className="flex flex-col items-center justify-center pt-2 sm:pt-2.5 pb-2 sm:pb-3 px-2">
                  <Upload className="w-6 h-6 sm:w-8 sm:h-8 mb-1 text-muted-foreground" />
                  <p className="mb-1 text-xs sm:text-sm text-muted-foreground text-center">
                    <span className="font-semibold">{t('createTemplate.clickToUpload')}</span>{' '}
                    {t('createTemplate.coverImageDescription')}
                  </p>
                  <p className="text-xs text-muted-foreground text-center">{t('createTemplate.fileTypes')}</p>
                </div>
                <input
                  id="cover-upload"
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleCoverImageSelect}
                  disabled={uploading}
                />
              </label>
            )}
          </div>

          <div className="space-y-1">
            <label htmlFor="name" className="text-sm font-medium">
              {t('createTemplate.templateName')}
            </label>
            <Input id="name" {...register('name')} placeholder={t('createTemplate.templateNamePlaceholder')} />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-1">
            <label htmlFor="description" className="text-sm font-medium">
              {t('createTemplate.description')}
            </label>
            <Input
              id="description"
              {...register('description')}
              placeholder={t('createTemplate.descriptionPlaceholder')}
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="category_id" className="text-sm font-medium">
              {t('createTemplate.category')}
            </label>
            {loadingCategories ? (
              <p className="text-sm text-muted-foreground">{t('createTemplate.loadingCategories')}</p>
            ) : (
              <select
                id="category_id"
                {...register('category_id')}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                disabled={categories.length === 0}
              >
                <option value="">{t('createTemplate.selectCategory')}</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            )}
            {errors.category_id && (
              <p className="text-sm text-destructive">{errors.category_id.message}</p>
            )}
            {categories.length === 0 && !loadingCategories && (
              <p className="text-sm text-muted-foreground">{t('createTemplate.noCategories')}</p>
            )}
          </div>

          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="is_public" {...register('is_public')} className="h-4 w-4 rounded border-gray-300" />
              <label htmlFor="is_public" className="text-sm font-medium">
                {t('createTemplate.isPublic')}
              </label>
            </div>
            <p className="text-xs text-muted-foreground pl-6">{t('createTemplate.isPublicCoverHint')}</p>
            {wantsPublic && !hasCover && (
              <p className="text-xs text-amber-600 dark:text-amber-400 pl-6">
                {t('createTemplate.coverRequiredForPublic')}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="p-3 space-y-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <CardTitle className="w-fit cursor-help">Tiers Padrão</CardTitle>
            </TooltipTrigger>
            <TooltipContent side="bottom" align="start" className="max-w-sm text-left">
              <p>
                Configure as tiers padrão que serão usadas quando alguém criar uma tier list a partir deste template.
                Você pode editar o nome e a cor de cada tier, reordenar arrastando, adicionar novas ou remover.
              </p>
            </TooltipContent>
          </Tooltip>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          <TemplateTiersVisualEditor tiers={tiers} onChange={setTiers} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="p-3 space-y-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <CardTitle className="w-fit cursor-help">{t('createTemplate.templateItems')}</CardTitle>
            </TooltipTrigger>
            <TooltipContent side="bottom" align="start" className="max-w-sm text-left">
              <p>
                {isCloneMode ? t('createTemplate.cloneItemsHint') : t('createTemplate.templateItemsDescription')}
              </p>
            </TooltipContent>
          </Tooltip>
        </CardHeader>
        <CardContent className="space-y-2 p-3 pt-0">
          <div>
            <label
              htmlFor="file-upload"
              className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-accent transition-colors"
            >
              <div className="flex flex-col items-center justify-center pt-2.5 pb-3">
                <Upload className="w-8 h-8 mb-1 text-muted-foreground" />
                <p className="mb-1 text-sm text-muted-foreground">
                  <span className="font-semibold">{t('createTemplate.clickToUpload')}</span>{' '}
                  {t('createTemplate.dragAndDrop')}
                </p>
                <p className="text-xs text-muted-foreground">{t('createTemplate.fileTypes')}</p>
              </div>
              <input
                id="file-upload"
                type="file"
                className="hidden"
                multiple
                accept="image/*"
                onChange={handleFileSelect}
                disabled={addingItemBusy || uploading}
              />
            </label>
            {addingItemBusy && (
              <p className="text-xs text-muted-foreground mt-1">{t('createTemplate.cloneUploadingNewItems')}</p>
            )}
          </div>

          {items.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-1.5 sm:gap-2">
              {items.map((item) => (
                <div key={item.id} className="relative group">
                  <div className="relative aspect-square rounded-lg overflow-hidden border">
                    <Image
                      src={item.preview}
                      alt={item.name}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1200px) 33vw, 25vw"
                      className="object-cover"
                      unoptimized={item.kind === 'file'}
                    />
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 p-1.5 sm:p-1 bg-destructive text-destructive-foreground rounded-full opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity touch-manipulation"
                    >
                      <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </button>
                  </div>
                  <Input
                    value={item.name}
                    onChange={(e) => updateItemName(item.id, e.target.value)}
                    className="mt-1 text-xs sm:text-sm"
                    placeholder="Item name"
                  />
                </div>
              ))}
            </div>
          )}

          {error && <div className="p-1.5 text-sm text-destructive bg-destructive/10 rounded-md">{error}</div>}
        </CardContent>
      </Card>

      <div className="flex flex-col-reverse sm:flex-row justify-end gap-1.5 sm:gap-2 pb-2 sm:pb-0">
        <Button type="button" variant="outline" onClick={() => router.back()} disabled={uploading} className="w-full sm:w-auto">
          {t('common.cancel')}
        </Button>
        <Button
          type="submit"
          disabled={uploading || items.length === 0 || cloneLoading}
          className="w-full sm:w-auto"
        >
          {submitLabel}
        </Button>
      </div>

    </form>
  )
}
