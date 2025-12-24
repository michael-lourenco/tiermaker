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
    <main className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Create Tier List</h1>
          <p className="text-muted-foreground">
            Drag and drop items to organize them into tiers
          </p>
        </div>
        <TierListEditorClient template={template} />
      </div>
    </main>
  )
}

