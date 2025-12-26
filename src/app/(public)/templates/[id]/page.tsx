import { notFound } from 'next/navigation'
import { TemplateService } from '@/services/template.service'
import { TemplatePageClient } from '@/components/templates/TemplatePageClient'
import { generateShareMetadata } from '@/lib/share/meta-tags'
import type { Metadata } from 'next'

interface TemplatePageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: TemplatePageProps): Promise<Metadata> {
  const { id } = await params
  const templateService = new TemplateService()
  const template = await templateService.getTemplateById(id)

  if (!template) {
    return {
      title: 'Template not found',
    }
  }

  return generateShareMetadata('template', template)
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

