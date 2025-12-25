import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { CreateTemplatePageClient } from '@/components/templates/CreateTemplatePageClient'

export default async function CreateTemplatePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return <CreateTemplatePageClient />
}


