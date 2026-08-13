import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { TemplateService } from '@/services/template.service'
import { TemplatePageClient } from '@/components/templates/TemplatePageClient'
import { generateShareMetadata } from '@/lib/share/meta-tags'
import { hasCoverImage } from '@/lib/utils/publicVisibility'
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
  const supabase = await createClient()
  const templateService = new TemplateService(supabase)
  const template = await templateService.getTemplateById(id)

  if (!template) {
    notFound()
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()
  const isOwner = Boolean(user && template.user_id === user.id)
  const publiclyVisible = template.is_public && hasCoverImage(template.cover_image_url)

  if (!publiclyVisible && !isOwner) {
    notFound()
  }

  return <TemplatePageClient template={template} />
}
