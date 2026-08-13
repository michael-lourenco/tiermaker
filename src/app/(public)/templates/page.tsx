import { TemplateService } from '@/services/template.service'
import { CategoryService } from '@/services/category.service'
import { TemplatesPageClient } from '@/components/templates/TemplatesPageClient'
import { createClient } from '@/lib/supabase/server'

interface TemplatesPageProps {
  searchParams: Promise<{ category?: string; category_id?: string; search?: string }>
}

export default async function TemplatesPage({ searchParams }: TemplatesPageProps) {
  const params = await searchParams
  const category = params.category
  const categoryId = params.category_id
  const search = params.search?.trim() || undefined
  const supabase = await createClient()
  const templateService = new TemplateService(supabase)
  const categoryService = new CategoryService(supabase)

  let categoryName: string | undefined = category
  if (categoryId && !category) {
    try {
      const { data: categoryData } = await supabase
        .from('categories')
        .select('name')
        .eq('id', categoryId)
        .single() as { data: { name: string } | null; error: unknown }
      if (categoryData) {
        categoryName = categoryData.name
      }
    } catch (error) {
      console.error('Error fetching category name:', error)
    }
  }

  const filters = {
    category,
    category_id: categoryId,
    search,
    sort: 'recent' as const,
    limit: 24,
    offset: 0,
  }

  const [templates, total, categories] = await Promise.all([
    templateService.getPublicTemplates(filters),
    templateService.countPublicTemplates({
      category_id: categoryId,
      search,
    }),
    categoryService.getAllCategories(),
  ])

  return (
    <TemplatesPageClient
      templates={templates}
      total={total}
      categories={categories.map((c) => ({ id: c.id, name: c.name, slug: c.slug }))}
      initialSearch={search || ''}
      initialCategoryId={categoryId}
      categoryName={categoryName}
    />
  )
}
