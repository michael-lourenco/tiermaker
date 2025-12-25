import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { TierListService } from '@/services/tierList.service'
import { MyTierListsPageClient } from '@/components/my-tier-lists/MyTierListsPageClient'

export default async function MyTierListsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const tierListService = new TierListService(supabase)
  const tierLists = await tierListService.getUserTierLists(user.id)

  return <MyTierListsPageClient tierLists={tierLists} />
}

