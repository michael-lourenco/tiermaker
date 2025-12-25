import { TemplateGrid } from '@/components/templates/TemplateGrid'
import { TemplateService } from '@/services/template.service'
import type { TemplateWithItems } from '@/types/template.types'

export default async function TemplatesPage() {
  const templateService = new TemplateService()
  const templateList = await templateService.getPublicTemplates({ limit: 20 })
  
  // Fetch full template data with categories for each template
  const templates: TemplateWithItems[] = await Promise.all(
    templateList.map(async (t) => {
      const fullTemplate = await templateService.getTemplateById(t.id)
      return fullTemplate || { ...t, items: [], categories: [] }
    })
  )

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


