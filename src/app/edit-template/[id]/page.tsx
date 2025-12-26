import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { TemplateService } from '@/services/template.service'
import { EditTemplatePageClient } from '@/components/templates/EditTemplatePageClient'

interface EditTemplatePageProps {
  params: Promise<{ id: string }>
}

export default async function EditTemplatePage({ params }: EditTemplatePageProps) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const templateService = new TemplateService()
  const template = await templateService.getTemplateById(id)

  if (!template) {
    notFound()
  }

  // Check if user owns this template
  if (template.user_id !== user.id) {
    redirect('/my-templates')
  }

  return <EditTemplatePageClient template={template} />
}

