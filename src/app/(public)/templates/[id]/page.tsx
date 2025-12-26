import { notFound } from 'next/navigation'
import { TemplateService } from '@/services/template.service'
import { TemplatePageClient } from '@/components/templates/TemplatePageClient'

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

  // Views tracking is now handled by useViewTracking hook in TemplatePageClient
  // This provides 30-minute interval validation and full audit trail

  return <TemplatePageClient template={template} />
}

