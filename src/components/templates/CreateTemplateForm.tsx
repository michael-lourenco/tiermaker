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
import Image from 'next/image'
import { X, Upload } from 'lucide-react'

const templateSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  description: z.string().optional(),
  category_id: z.string().min(1, 'Category is required'),
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
  const { user } = useAuth()
  const router = useRouter()
  const imageService = new ImageService()
  const categoryService = new CategoryService()

  // Load categories from database
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const cats = await categoryService.getAllCategories()
        setCategories(cats)
      } catch (err) {
        console.error('Error loading categories:', err)
        setError('Failed to load categories. Using default list.')
        // Fallback to default categories if table doesn't exist
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
    watch,
  } = useForm<TemplateFormData>({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      is_public: true,
    },
  })

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

  const onSubmit = async (data: TemplateFormData) => {
    if (!user) {
      setError('You must be logged in to create a template')
      return
    }

    if (items.length === 0) {
      setError('Please add at least one item to the template')
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

      // Get selected category
      const selectedCategory = categories.find((c) => c.id === data.category_id)
      if (!selectedCategory) {
        throw new Error('Selected category not found')
      }

      // Create template
      const template = await templateService.createTemplate(
        {
          name: data.name,
          description: data.description,
          category_id: data.category_id,
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
            <label htmlFor="category_id" className="text-sm font-medium">
              Category *
            </label>
            {loadingCategories ? (
              <p className="text-sm text-muted-foreground">Loading categories...</p>
            ) : (
              <select
                id="category_id"
                {...register('category_id')}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                disabled={categories.length === 0}
              >
                <option value="">Select a category</option>
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
                No categories found. Please create categories in the database first.
              </p>
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

