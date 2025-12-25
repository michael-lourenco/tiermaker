import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TemplateService } from '@/services/template.service'
import type { TemplateWithItems } from '@/types/template.types'

export default async function HomePage() {
  const templateService = new TemplateService()
  let popularTemplates: (TemplateWithItems | null)[] = []
  
  try {
    const templates = await templateService.getPublicTemplates({ limit: 6 })
    // Fetch full template data with categories for each template
    popularTemplates = await Promise.all(
      templates.map(async (t) => await templateService.getTemplateById(t.id))
    )
    // Filter out nulls
    popularTemplates = popularTemplates.filter((t): t is TemplateWithItems => t !== null)
  } catch (error) {
    // If templates table doesn't exist or there's an error, show empty state
    console.error('Error loading templates:', error)
  }

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="py-20 px-8 bg-gradient-to-b from-background to-muted">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-6xl font-bold mb-4">TierMaker</h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Create, rank, and share tier lists for any topic. Organize your favorites
            and discover what others think.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/templates">
              <Button size="lg">Browse Templates</Button>
            </Link>
            <Link href="/create-template">
              <Button size="lg" variant="outline">
                Create Your Own
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Popular Templates */}
      <section className="py-16 px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold mb-8">Popular Templates</h2>
          {popularTemplates.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {popularTemplates.filter((t) => t !== null).map((template) => (
                <Card key={template.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle>{template.name}</CardTitle>
                    <CardDescription>{template.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                      {template.categories && template.categories.length > 0 ? (
                        <div className="flex gap-1 flex-wrap">
                          {template.categories.map((cat) => (
                            <span key={cat.id} className="px-2 py-1 bg-secondary text-secondary-foreground rounded text-xs">
                              {cat.name}
                            </span>
                          ))}
                        </div>
                      ) : null}
                      <span>•</span>
                      <span>{template.views_count} views</span>
                    </div>
                  </CardContent>
                  <div className="p-6 pt-0">
                    <Link href={`/templates/${template.id}`}>
                      <Button variant="outline" className="w-full">
                        View Template
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                No templates available yet. Be the first to create one!
              </p>
              <Link href="/create-template">
                <Button>Create Your First Template</Button>
              </Link>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
