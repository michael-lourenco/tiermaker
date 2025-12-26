import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { TemplateService } from '@/services/template.service'
import { MyTemplatesPageClient } from '@/components/templates/MyTemplatesPageClient'

export default async function MyTemplatesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const templateService = new TemplateService()
  const templates = await templateService.getUserTemplates(user.id)

  return <MyTemplatesPageClient templates={templates} />
}

