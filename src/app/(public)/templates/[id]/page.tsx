import { notFound } from 'next/navigation'
import { TemplateService } from '@/services/template.service'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import Image from 'next/image'

interface TemplatePageProps {
  params: Promise<{ id: string }>
}

export default async function TemplatePage({ params }: TemplatePageProps) {
  const { id } = await params
  const templateService = new TemplateService()
  const template = await templateService.getTemplateById(id)

  if (!template) {
    notFound()
  }

  // Increment views (fire and forget)
  templateService.incrementViews(id).catch(console.error)

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <Link href="/templates">
            <Button variant="ghost">← Back to Templates</Button>
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">{template.name}</h1>
          {template.description && (
            <p className="text-muted-foreground text-lg">{template.description}</p>
          )}
          <div className="flex items-center gap-4 mt-4">
            <span className="text-sm text-muted-foreground">
              Category: {template.category}
            </span>
            {template.tags && template.tags.length > 0 && (
              <div className="flex gap-2">
                {template.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-secondary text-secondary-foreground rounded text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-8">
          {template.items.map((item) => (
            <div key={item.id} className="relative aspect-square rounded-lg overflow-hidden border">
              <Image
                src={item.image_url}
                alt={item.name}
                fill
                className="object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white p-2 text-sm text-center">
                {item.name}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center">
          <Link href={`/editor/${template.id}`}>
            <Button size="lg">Create Tier List with this Template</Button>
          </Link>
        </div>
      </div>
    </main>
  )
}

