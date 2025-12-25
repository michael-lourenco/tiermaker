import { TemplateGrid } from '@/components/templates/TemplateGrid'
import { TemplateService } from '@/services/template.service'

export default async function TemplatesPage() {
  const templateService = new TemplateService()
  const templates = await templateService.getPublicTemplates({ limit: 20 })

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Templates</h1>
          <p className="text-muted-foreground">
            Browse and use templates created by the community
          </p>
        </div>
        <TemplateGrid templates={templates} />
      </div>
    </main>
  )
}


