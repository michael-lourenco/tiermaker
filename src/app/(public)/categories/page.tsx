import Link from 'next/link'
import { TemplateService } from '@/services/template.service'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FolderOpen, ArrowRight } from 'lucide-react'

export default async function CategoriesPage() {
  const templateService = new TemplateService()
  let categories: Array<{ category: string; count: number; category_id?: string }> = []

  try {
    categories = await templateService.getCategoriesWithCount()
  } catch (error) {
    console.error('Error loading categories:', error)
  }

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Categories</h1>
          <p className="text-muted-foreground">
            Browse templates by category. Click on a category to see all templates in that category.
          </p>
        </div>

        {categories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {categories.map(({ category, count, category_id }) => (
              <Link 
                key={category_id || category} 
                href={category_id 
                  ? `/templates?category_id=${encodeURIComponent(category_id)}`
                  : `/templates?category=${encodeURIComponent(category)}`
                }
              >
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <FolderOpen className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-xl">{category}</CardTitle>
                        <CardDescription>
                          {count} template{count !== 1 ? 's' : ''}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        View all templates
                      </span>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <FolderOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-4">
              No categories available yet.
            </p>
            <Link href="/create-template">
              <Button>Create Your First Template</Button>
            </Link>
          </div>
        )}
      </div>
    </main>
  )
}

