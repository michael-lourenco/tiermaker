import { notFound } from 'next/navigation'
import { TemplateService } from '@/services/template.service'
import { TierListEditorClient } from './TierListEditorClient'

interface EditorPageProps {
  params: Promise<{ templateId: string }>
}

export default async function EditorPage({ params }: EditorPageProps) {
  const { templateId } = await params
  const templateService = new TemplateService()
  const template = await templateService.getTemplateById(templateId)

  if (!template) {
    notFound()
  }

  return (
    <main className="min-h-screen p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">Create Tier List</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Drag and drop items to organize them into tiers
          </p>
        </div>
        <TierListEditorClient template={template} />
      </div>
    </main>
  )
}


