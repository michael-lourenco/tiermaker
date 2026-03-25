import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { CreateTemplatePageClient } from '@/components/templates/CreateTemplatePageClient'

type Props = {
  searchParams: Promise<{ from?: string }>
}

export default async function CreateTemplatePage({ searchParams }: Props) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { from } = await searchParams

  return <CreateTemplatePageClient cloneFromId={from} />
}


