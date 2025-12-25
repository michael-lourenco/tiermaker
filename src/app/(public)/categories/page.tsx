import { TemplateService } from '@/services/template.service'
import { CategoriesPageClient } from '@/components/categories/CategoriesPageClient'

export default async function CategoriesPage() {
  const templateService = new TemplateService()
  let categories: Array<{ category: string; count: number; category_id?: string }> = []

  try {
    categories = await templateService.getCategoriesWithCount()
  } catch (error) {
    console.error('Error loading categories:', error)
  }

  return <CategoriesPageClient categories={categories} />
}

