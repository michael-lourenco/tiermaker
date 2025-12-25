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
import { CategoryService } from '@/services/category.service'
import { ImageService } from '@/services/image.service'
import { useAuth } from '@/hooks/useAuth'
import Image from 'next/image'
import { X, Upload, Plus } from 'lucide-react'
import type { Category } from '@/types/category.types'

const templateSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  description: z.string().optional(),
  category_ids: z.array(z.string()).min(1, 'At least one category is required'),
  is_public: z.boolean().default(true),
})

type TemplateFormData = z.infer<typeof templateSchema>

interface TemplateItem {
  id: string
  name: string
  file: File
  preview: string
  imageUrl?: string
}

export function CreateTemplateForm() {
  const [items, setItems] = useState<TemplateItem[]>([])
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false)
  const { user } = useAuth()
  const router = useRouter()
  const imageService = new ImageService()
  const categoryService = new CategoryService()

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<TemplateFormData>({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      is_public: true,
      category_ids: [],
    },
  })

  const selectedCategoryIds = watch('category_ids') || []

  // Load categories on mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const cats = await categoryService.getAllCategories()
        setCategories(cats)
      } catch (err) {
        console.error('Error loading categories:', err)
        setError('Failed to load categories')
      } finally {
        setLoadingCategories(false)
      }
    }
    loadCategories()
  }, [])

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
        const item: TemplateItem = {
          id: Math.random().toString(36).substring(7),
          name: file.name.replace(/\.[^/.]+$/, ''), // Remove extension
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

  const toggleCategory = (categoryId: string) => {
    const current = selectedCategoryIds
    if (current.includes(categoryId)) {
      setValue('category_ids', current.filter((id) => id !== categoryId))
    } else {
      setValue('category_ids', [...current, categoryId])
    }
  }

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      setError('Category name is required')
      return
    }

    try {
      const category = await categoryService.getOrCreateCategory(newCategoryName.trim())
      setCategories((prev) => {
        // Add if not already in list
        if (!prev.find((c) => c.id === category.id)) {
          return [...prev, category].sort((a, b) => a.name.localeCompare(b.name))
        }
        return prev
      })
      // Select the newly created category
      toggleCategory(category.id)
      setNewCategoryName('')
      setShowNewCategoryInput(false)
      setError(null)
    } catch (err: any) {
      setError(err.message || 'Failed to create category')
    }
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

    if (data.category_ids.length === 0) {
      setError('Please select at least one category')
      return
    }

    setUploading(true)
    setError(null)

    try {
      const templateService = new TemplateService()

      // Upload all images
      const uploadedItems = await Promise.all(
        items.map(async (item, index) => {
          const imageUrl = await imageService.uploadImage(item.file)
          return {
            name: item.name,
            image_url: imageUrl,
            order: index,
          }
        })
      )

      // Create template
      const template = await templateService.createTemplate(
        {
          name: data.name,
          description: data.description,
          category_ids: data.category_ids,
          is_public: data.is_public,
          items: uploadedItems,
        },
        user.id
      )

      router.push(`/templates/${template.id}`)
    } catch (err: any) {
      console.error('Error creating template:', err)
      setError(err.message || 'Failed to create template. Please try again.')
      setUploading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Template Information</CardTitle>
          <CardDescription>Basic information about your template</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              Template Name *
            </label>
            <Input
              id="name"
              {...register('name')}
              placeholder="e.g., Best Video Games 2024"
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              Description
            </label>
            <Input
              id="description"
              {...register('description')}
              placeholder="Describe your template"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Categories * (Select at least one)
            </label>
            {loadingCategories ? (
              <p className="text-sm text-muted-foreground">Loading categories...</p>
            ) : (
              <>
                <div className="flex flex-wrap gap-2 min-h-[60px] p-3 border rounded-md">
                  {categories.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No categories available</p>
                  ) : (
                    categories.map((category) => {
                      const isSelected = selectedCategoryIds.includes(category.id)
                      return (
                        <button
                          key={category.id}
                          type="button"
                          onClick={() => toggleCategory(category.id)}
                          className={`px-3 py-1 rounded-md text-sm transition-colors ${
                            isSelected
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                          }`}
                        >
                          {category.name}
                        </button>
                      )
                    })
                  )}
                </div>
                {errors.category_ids && (
                  <p className="text-sm text-destructive">
                    {errors.category_ids.message}
                  </p>
                )}

                {/* Create new category */}
                {!showNewCategoryInput ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowNewCategoryInput(true)}
                    className="mt-2"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Category
                  </Button>
                ) : (
                  <div className="flex gap-2 mt-2">
                    <Input
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      placeholder="Category name"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          handleCreateCategory()
                        }
                      }}
                    />
                    <Button
                      type="button"
                      onClick={handleCreateCategory}
                      disabled={!newCategoryName.trim()}
                    >
                      Add
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowNewCategoryInput(false)
                        setNewCategoryName('')
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="is_public"
              {...register('is_public')}
              className="h-4 w-4 rounded border-gray-300"
            />
            <label htmlFor="is_public" className="text-sm font-medium">
              Make this template public
            </label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Template Items</CardTitle>
          <CardDescription>
            Upload images for your template. Each image will become an item that can be ranked.
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
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-muted-foreground">
                  PNG, JPG, GIF, WEBP up to 5MB
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
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {items.map((item) => (
                <div key={item.id} className="relative group">
                  <div className="relative aspect-square rounded-lg overflow-hidden border">
                    <Image
                      src={item.preview}
                      alt={item.name}
                      fill
                      sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="absolute top-2 right-2 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <Input
                    value={item.name}
                    onChange={(e) => updateItemName(item.id, e.target.value)}
                    className="mt-2 text-sm"
                    placeholder="Item name"
                  />
                </div>
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
          Cancel
        </Button>
        <Button type="submit" disabled={uploading || items.length === 0}>
          {uploading ? 'Creating Template...' : 'Create Template'}
        </Button>
      </div>
    </form>
  )
}
