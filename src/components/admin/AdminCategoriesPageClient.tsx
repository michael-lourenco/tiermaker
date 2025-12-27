'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Edit, Trash2 } from 'lucide-react'
import { CategoryFormDialog } from './CategoryFormDialog'
import { CategoryService, type Category } from '@/services/category.service'
import { ImageService } from '@/services/image.service'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

interface AdminCategoriesPageClientProps {
  categories: Category[]
}

export function AdminCategoriesPageClient({ categories: initialCategories }: AdminCategoriesPageClientProps) {
  const [categories, setCategories] = useState<Category[]>(initialCategories)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const router = useRouter()
  const categoryService = new CategoryService()
  const imageService = new ImageService()

  const handleCreate = () => {
    setEditingCategory(null)
    setIsDialogOpen(true)
  }

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta categoria?')) {
      return
    }

    setDeleting(id)
    try {
      await categoryService.deleteCategory(id)
      setCategories(categories.filter(c => c.id !== id))
      router.refresh()
    } catch (error) {
      console.error('Error deleting category:', error)
      alert('Erro ao excluir categoria. Por favor, tente novamente.')
    } finally {
      setDeleting(null)
    }
  }

  const handleSave = async (data: {
    name: string
    description?: string | null
    image?: File | null
    imageRemoved?: boolean
  }) => {
    try {
      let imageUrl: string | null | undefined = undefined

      // If image was explicitly removed, set to null
      if (data.imageRemoved) {
        imageUrl = null
      } else if (data.image) {
        // Upload new image if provided
        try {
          imageUrl = await imageService.uploadImage(data.image)
        } catch (uploadError) {
          console.error('Error uploading image:', uploadError)
          throw new Error('Erro ao fazer upload da imagem. Por favor, tente novamente.')
        }
      } else if (editingCategory?.image_url) {
        // Keep existing image if not changed - don't include in update
        imageUrl = undefined
      }

      if (editingCategory) {
        // Update existing category - only include image_url if it changed
        const updateData: {
          name: string
          description: string | null
          image_url?: string | null
        } = {
          name: data.name,
          description: data.description ?? null,
        }
        
        // Only include image_url if it was explicitly set (new upload or removed)
        if (imageUrl !== undefined) {
          updateData.image_url = imageUrl
        }

        const updated = await categoryService.updateCategory(editingCategory.id, updateData)
        setCategories(categories.map(c => c.id === updated.id ? updated : c))
      } else {
        // Create new category
        const created = await categoryService.createCategory({
          name: data.name,
          description: data.description ?? null,
          image_url: imageUrl ?? null,
        })
        setCategories([...categories, created])
      }

      setIsDialogOpen(false)
      setEditingCategory(null)
      router.refresh()
    } catch (error) {
      console.error('Error saving category:', error)
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Erro ao salvar categoria. Por favor, tente novamente.'
      alert(errorMessage)
      throw error
    }
  }

  return (
    <main className="min-h-screen p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 md:mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">Administração de Categorias</h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                Gerencie as categorias do sistema
              </p>
            </div>
            <Button onClick={handleCreate} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Nova Categoria
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category) => (
            <Card key={category.id} className="relative group">
              <CardHeader>
                <div className="relative w-full h-48 rounded-lg overflow-hidden bg-muted mb-4">
                  {category.image_url ? (
                    <Image
                      src={category.image_url}
                      alt={category.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      Sem imagem
                    </div>
                  )}
                </div>
                <CardTitle>{category.name}</CardTitle>
                {category.description && (
                  <CardDescription>{category.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(category)}
                    className="flex-1"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(category.id)}
                    disabled={deleting === category.id}
                    className="flex-1"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    {deleting === category.id ? 'Excluindo...' : 'Excluir'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {categories.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">Nenhuma categoria cadastrada</p>
            <Button onClick={handleCreate}>Criar primeira categoria</Button>
          </div>
        )}

        <CategoryFormDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          category={editingCategory}
          onSave={handleSave}
        />
      </div>
    </main>
  )
}

