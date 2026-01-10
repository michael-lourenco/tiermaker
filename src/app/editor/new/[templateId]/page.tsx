import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { TemplateService } from '@/services/template.service'
import { CanvasTierListEditorClient } from './CanvasTierListEditorClient'
import { PageWithSidebar } from '@/components/layout/PageWithSidebar'

interface EditorPageProps {
  params: Promise<{ templateId: string }>
}

export default async function CanvasEditorPage({ params }: EditorPageProps) {
  const { templateId } = await params
  
  // Verify user authentication
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const templateService = new TemplateService()
  const template = await templateService.getTemplateById(templateId)

  if (!template) {
    notFound()
  }

  return (
    <main className="min-h-screen p-2 sm:p-4 md:p-6 lg:p-8">
      <PageWithSidebar showRightSidebar={false}>
        <CanvasTierListEditorClient template={template} />
      </PageWithSidebar>
    </main>
  )
}
