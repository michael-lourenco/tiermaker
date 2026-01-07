import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { TemplateService } from '@/services/template.service'
import { TierListEditorClient } from './TierListEditorClient'
import { PageWithSidebar } from '@/components/layout/PageWithSidebar'

interface EditorPageProps {
  params: Promise<{ templateId: string }>
}

export default async function EditorPage({ params }: EditorPageProps) {
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
        <div className="mb-4 sm:mb-6 md:mb-8">
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-1 sm:mb-2">Create Tier List</h1>
          <p className="text-xs sm:text-sm md:text-base text-muted-foreground">
            Drag and drop items to organize them into tiers
          </p>
        </div>
        <TierListEditorClient template={template} />
      </PageWithSidebar>
    </main>
  )
}


