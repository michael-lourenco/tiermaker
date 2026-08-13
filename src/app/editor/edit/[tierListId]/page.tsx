import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { TemplateService } from '@/services/template.service'
import { TierListService } from '@/services/tierList.service'
import { TierListEditorClient } from '@/app/editor/[templateId]/TierListEditorClient'
import { PageWithSidebar } from '@/components/layout/PageWithSidebar'

interface EditTierListPageProps {
  params: Promise<{ tierListId: string }>
}

export default async function EditTierListPage({ params }: EditTierListPageProps) {
  const { tierListId } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const tierListService = new TierListService(supabase)
  const tierList = await tierListService.getTierListById(tierListId)

  if (!tierList || tierList.user_id !== user.id) {
    notFound()
  }

  const templateService = new TemplateService(supabase)
  const template = await templateService.getTemplateById(tierList.template_id)

  if (!template) {
    notFound()
  }

  return (
    <main className="min-h-screen p-2 sm:p-4 md:p-6 lg:p-8">
      <PageWithSidebar showRightSidebar={false}>
        <TierListEditorClient
          template={template}
          editTierList={tierList}
        />
      </PageWithSidebar>
    </main>
  )
}
