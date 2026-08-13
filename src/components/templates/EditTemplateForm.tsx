'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TemplateService } from '@/services/template.service'
import { CategoryService, type Category } from '@/services/category.service'
import { ImageService } from '@/services/image.service'
import { useAuth } from '@/hooks/useAuth'
import { useTranslation } from '@/hooks/useTranslation'
import Image from 'next/image'
import { X, Upload } from 'lucide-react'
import { EditableTemplateItemCard } from './EditableTemplateItemCard'
import { TemplateTiersVisualEditor, type TemplateTier } from './TemplateTiersVisualEditor'
import { DEFAULT_TIERS, TIER_COLORS } from '@/lib/constants/tiers'
import { assertCoverAspectRatio, COVER_ASPECT_CLASS } from '@/lib/utils/coverAspect'
import type { TemplateWithItemsAndCategories, TemplateItem as TemplateItemType } from '@/types/template.types'

const templateSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  description: z.string().optional(),
  category_id: z.string().min(1, 'Category is required'),
  is_public: z.boolean().default(true),
})

type TemplateFormData = z.infer<typeof templateSchema>

interface EditableItem {
  id: string
  name: string
  file?: File
  preview: string
  imageUrl?: string
  existingItemId?: string // ID do item existente no banco
}

interface EditTemplateFormProps {
  template: TemplateWithItemsAndCategories
}

export function EditTemplateForm({ template }: EditTemplateFormProps) {
  const [items, setItems] = useState<EditableItem[]>([])
  const [coverImage, setCoverImage] = useState<{ file: File; preview: string; imageUrl?: string } | { imageUrl: string } | null>(null)
  const [tiers, setTiers] = useState<TemplateTier[]>([])
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [loadingCategories, setLoadingCategories] = useState(true)
  const { user } = useAuth()
  const { t } = useTranslation()
  const router = useRouter()
  const imageService = new ImageService()
  const categoryService = new CategoryService()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<TemplateFormData>({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      name: template.name,
      description: template.description || '',
      category_id: template.categories?.[0]?.id || '',
      is_public: template.is_public,
    },
  })

  const wantsPublic = watch('is_public')
  const hasCover = Boolean(coverImage)

  // Initialize form with template data
  useEffect(() => {
    if (template) {
      // Set cover image if exists
      if (template.cover_image_url) {
        setCoverImage({ imageUrl: template.cover_image_url })
      }

      // Set existing items
      const existingItems: EditableItem[] = template.items.map((item) => ({
        id: `existing-${item.id}`,
        name: item.name,
        preview: item.image_url,
        imageUrl: item.image_url,
        existingItemId: item.id,
      }))
      setItems(existingItems)

      // Set existing tiers if available, otherwise use default tiers
      if ('tiers' in template && template.tiers && Array.isArray(template.tiers) && template.tiers.length > 0) {
        const existingTiers: TemplateTier[] = template.tiers.map((tier: any) => ({
          id: tier.id,
          tier_name: tier.tier_name,
          tier_order: tier.tier_order,
          color: tier.color,
        }))
        setTiers(existingTiers)
      } else {
        // Use default tiers if template doesn't have tiers
        const defaultTiers: TemplateTier[] = DEFAULT_TIERS.map((name, index) => ({
          id: `tier-${name}-${Date.now()}-${index}`,
          tier_name: name,
          tier_order: index,
          color: TIER_COLORS[name] || null,
        }))
        setTiers(defaultTiers)
      }

      // Reset form with template values
      reset({
        name: template.name,
        description: template.description || '',
        category_id: template.categories?.[0]?.id || '',
        is_public: template.is_public,
      })
    }
  }, [template, reset])

  // Load categories from database
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const cats = await categoryService.getAllCategories()
        setCategories(cats)
      } catch (err) {
        setError('Failed to load categories.')
        setCategories([])
      } finally {
        setLoadingCategories(false)
      }
    }
    loadCategories()
  }, [])

  const handleCoverImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const validation = imageService.validateImageFile(file)
    if (!validation.valid) {
      setError(validation.error || 'Invalid file')
      e.target.value = ''
      return
    }

    try {
      await assertCoverAspectRatio(file)
    } catch (err) {
      if (err instanceof Error && err.message === 'COVER_ASPECT_INVALID') {
        setError(t('createTemplate.coverImageAspectInvalid'))
      } else {
        setError('Failed to process cover image')
      }
      e.target.value = ''
      return
    }

    try {
      const preview = await imageService.createPreviewUrl(file)
      setCoverImage({ file, preview })
      setError(null)
    } catch {
      setError('Failed to process cover image')
    }
    e.target.value = ''
  }

  const removeCoverImage = () => {
    setCoverImage(null)
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
        const preview = await imageService.createPreviewUrl(file)
        const item: EditableItem = {
          id: `new-${Math.random().toString(36).substring(7)}`,
          name: file.name.replace(/\.[^/.]+$/, ''),
          file,
          preview,
        }
        setItems((prev) => [...prev, item])
      } catch (err) {
        setError('Failed to process image')
      }
    }
  }

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id))
  }

  const updateItemName = (id: string, name: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, name } : item))
    )
  }

  const onSubmit = async (data: TemplateFormData) => {
    if (!user) {
      setError('You must be logged in to edit a template')
      return
    }

    if (items.length === 0) {
      setError('Please add at least one item to the template')
      return
    }

    if (data.is_public && !coverImage) {
      setError(t('createTemplate.coverRequiredForPublic'))
      return
    }

    setUploading(true)
    setError(null)

    try {
      const templateService = new TemplateService()

      // Upload new cover image if provided
      let coverImageUrl: string | undefined = undefined
      if (coverImage && 'file' in coverImage && coverImage.file) {
        coverImageUrl = await imageService.uploadImage(coverImage.file)
      } else if (coverImage && 'imageUrl' in coverImage) {
        coverImageUrl = coverImage.imageUrl
      }

      // Process items: upload new ones, keep existing ones
      const processedItems = await Promise.all(
        items.map(async (item, index) => {
          if (item.file) {
            // New item - upload image
            const imageUrl = await imageService.uploadImage(item.file)
            return {
              name: item.name,
              image_url: imageUrl,
              order: index,
              existingItemId: undefined,
            }
          } else if (item.existingItemId && item.imageUrl) {
            // Existing item - keep URL, but update name if changed
            return {
              name: item.name,
              image_url: item.imageUrl,
              order: index,
              existingItemId: item.existingItemId,
            }
          }
          throw new Error('Invalid item state')
        })
      )

      // Preparar tiers para envio
      const tiersToSend = tiers.map((tier) => ({
        tier_name: tier.tier_name,
        tier_order: tier.tier_order,
        color: tier.color,
      }))

      // Update template
      await templateService.updateTemplateComplete(
        template.id,
        {
          name: data.name,
          description: data.description,
          category_id: data.category_id,
          cover_image_url: coverImageUrl,
          is_public: data.is_public,
          items: processedItems,
          tiers: tiersToSend.length > 0 ? tiersToSend : undefined,
        },
        user.id
      )

      router.push(`/templates/${template.id}`)
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Failed to update template. Please try again.')
      setUploading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardContent className="space-y-4 pt-6">
          {/* Cover Image */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {t('createTemplate.coverImage')}
            </label>
            <p className="text-xs text-muted-foreground">{t('createTemplate.coverImageAspectHint')}</p>
            {coverImage ? (
              <div className="relative">
                <div
                  className={`relative w-full ${COVER_ASPECT_CLASS} rounded-lg overflow-hidden border bg-muted`}
                >
                  <Image
                    src={'file' in coverImage ? coverImage.preview : coverImage.imageUrl}
                    alt="Cover preview"
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-contain"
                    unoptimized={'file' in coverImage}
                  />
                  <button
                    type="button"
                    onClick={removeCoverImage}
                    className="absolute top-2 right-2 p-1 bg-destructive text-destructive-foreground rounded-full opacity-75 hover:opacity-100 transition-opacity"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ) : (
              <label
                htmlFor="cover-upload"
                className={`flex flex-col items-center justify-center w-full ${COVER_ASPECT_CLASS} border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-accent transition-colors`}
              >
                <div className="flex flex-col items-center justify-center px-4 py-2">
                  <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                  <p className="mb-2 text-sm text-muted-foreground text-center">
                    <span className="font-semibold">{t('createTemplate.clickToUpload')}</span>{' '}
                    {t('createTemplate.coverImageDescription')}
                  </p>
                  <p className="text-xs text-muted-foreground text-center">
                    {t('createTemplate.fileTypes')}
                  </p>
                </div>
                <input
                  id="cover-upload"
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleCoverImageSelect}
                />
              </label>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              {t('createTemplate.templateName')}
            </label>
            <Input
              id="name"
              {...register('name')}
              placeholder={t('createTemplate.templateNamePlaceholder')}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              {t('createTemplate.description')}
            </label>
            <Input
              id="description"
              {...register('description')}
              placeholder={t('createTemplate.descriptionPlaceholder')}
            />
          </div>

          <div className="space-y-2">
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
              <p className="text-sm text-muted-foreground">
                {t('createTemplate.noCategories')}
              </p>
            )}
          </div>

          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_public"
                {...register('is_public')}
                className="h-4 w-4 rounded border-gray-300"
              />
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
        <CardHeader>
          <CardTitle>Tiers Padrão</CardTitle>
          <CardDescription>
            Configure as tiers padrão que serão usadas quando alguém criar uma tier list a partir deste template.
            Você pode editar o nome e a cor de cada tier, reordenar arrastando, adicionar novas ou remover.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TemplateTiersVisualEditor tiers={tiers} onChange={setTiers} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('createTemplate.templateItems')}</CardTitle>
          <CardDescription>
            {t('createTemplate.templateItemsDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label
              htmlFor="file-upload"
              className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-accent transition-colors"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                <p className="mb-2 text-sm text-muted-foreground">
                  <span className="font-semibold">{t('createTemplate.clickToUpload')}</span> {t('createTemplate.dragAndDrop')}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t('createTemplate.fileTypes')}
                </p>
              </div>
              <input
                id="file-upload"
                type="file"
                className="hidden"
                multiple
                accept="image/*"
                onChange={handleFileSelect}
              />
            </label>
          </div>

          {items.length > 0 && (
            <div className="flex flex-wrap gap-4">
              {items.map((item) => (
                <EditableTemplateItemCard
                  key={item.id}
                  item={item}
                  onRemove={removeItem}
                  onNameChange={updateItemName}
                />
              ))}
            </div>
          )}

          {error && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
              {error}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={uploading}
        >
          {t('common.cancel')}
        </Button>
        <Button type="submit" disabled={uploading || items.length === 0}>
          {uploading ? (t('templates.updatingTemplate') || 'Updating...') : (t('templates.updateTemplate') || 'Update Template')}
        </Button>
      </div>
    </form>
  )
}

