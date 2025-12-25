import { TemplateService } from '@/services/template.service'
import { TemplatesPageClient } from '@/components/templates/TemplatesPageClient'

interface TemplatesPageProps {
  searchParams: Promise<{ category?: string; category_id?: string }>
}

export default async function TemplatesPage({ searchParams }: TemplatesPageProps) {
  const params = await searchParams
  const category = params.category
  const categoryId = params.category_id
  const templateService = new TemplateService()
  
  // If we have category_id, fetch category name for display
  let categoryName: string | undefined = category
  if (categoryId && !category) {
    try {
      const { createClient } = await import('@/lib/supabase/server')
      const supabase = await createClient()
      const { data: categoryData } = await supabase
        .from('categories')
        .select('name')
        .eq('id', categoryId)
        .single() as { data: { name: string } | null; error: any }
      if (categoryData) {
        categoryName = categoryData.name
      }
    } catch (error) {
      console.error('Error fetching category name:', error)
    }
  }
  
  const templates = await templateService.getPublicTemplates({ 
    category,
    category_id: categoryId,
    limit: 50 
  })

  return <TemplatesPageClient templates={templates} categoryName={categoryName} />
}


