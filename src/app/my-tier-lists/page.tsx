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

  // Fetch full tier list data for each tier list to get tiers and items
  const tierListsWithData = await Promise.all(
    tierLists.map(async (tierList) => {
      try {
        const fullTierList = await tierListService.getTierListById(tierList.id)
        return fullTierList || tierList
      } catch (error) {
        console.error(`Error fetching tier list ${tierList.id}:`, error)
        return tierList
      }
    })
  )

  return <MyTierListsPageClient tierLists={tierListsWithData} />
}

