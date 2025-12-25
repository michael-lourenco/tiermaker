import { TemplateGrid } from '@/components/templates/TemplateGrid'
import { TemplateService } from '@/services/template.service'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

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

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">
                {categoryName ? `Templates: ${categoryName}` : 'Templates'}
              </h1>
              <p className="text-muted-foreground">
                {categoryName 
                  ? `Browse templates in the ${categoryName} category`
                  : 'Browse and use templates created by the community'
                }
              </p>
            </div>
            <Link href="/categories">
              <Button variant="outline">Browse Categories</Button>
            </Link>
          </div>
          {(category || categoryId) && (
            <div className="mb-4">
              <Link href="/templates">
                <Button variant="ghost" size="sm">
                  ← Clear filter
                </Button>
              </Link>
            </div>
          )}
        </div>
        <TemplateGrid templates={templates} />
      </div>
    </main>
  )
}


