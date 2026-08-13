import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { TemplateService } from '@/services/template.service'
import { TierListService } from '@/services/tierList.service'
import { TierListEditorClient } from './TierListEditorClient'
import { PageWithSidebar } from '@/components/layout/PageWithSidebar'
import type { TierListWithData } from '@/types/tierList.types'

interface EditorPageProps {
  params: Promise<{ templateId: string }>
  searchParams: Promise<{ from?: string }>
}

export default async function EditorPage({ params, searchParams }: EditorPageProps) {
  const { templateId } = await params
  const { from } = await searchParams

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const templateService = new TemplateService(supabase)
  const template = await templateService.getTemplateById(templateId)

  if (!template) {
    notFound()
  }

  let remixSource: TierListWithData | null = null
  if (from) {
    const tierListService = new TierListService(supabase)
    const source = await tierListService.getTierListById(from)
    if (
      source &&
      source.template_id === templateId &&
      (source.is_public || source.user_id === user.id)
    ) {
      remixSource = source
    }
  }

  return (
    <main className="min-h-screen p-2 sm:p-4 md:p-6 lg:p-8">
      <PageWithSidebar showRightSidebar={false}>
        <TierListEditorClient template={template} remixSource={remixSource} />
      </PageWithSidebar>
    </main>
  )
}
