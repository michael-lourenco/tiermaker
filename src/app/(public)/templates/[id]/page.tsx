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

        {template.cover_image_url && (
          <div className="relative w-full h-64 md:h-96 rounded-lg overflow-hidden mb-8">
            <Image
              src={template.cover_image_url}
              alt={template.name}
              fill
              sizes="(max-width: 768px) 100vw, 80vw"
              className="object-cover"
            />
          </div>
        )}

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">{template.name}</h1>
          {template.description && (
            <p className="text-muted-foreground text-lg">{template.description}</p>
          )}
          <div className="flex items-center gap-4 mt-4">
            {template.categories && template.categories.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {template.categories.map((cat) => (
                  <span
                    key={cat.id}
                    className="px-2 py-1 bg-secondary text-secondary-foreground rounded text-sm"
                  >
                    {cat.name}
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
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
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

