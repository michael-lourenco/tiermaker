import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { TierListService } from '@/services/tierList.service'
import { TierListPageClient } from '@/components/tier-lists/TierListPageClient'

interface TierListPageProps {
  params: Promise<{ id: string }>
}

export default async function TierListPage({ params }: TierListPageProps) {
  const { id } = await params
  const supabase = await createClient()
  const tierListService = new TierListService(supabase)
  
  let tierList: Awaited<ReturnType<typeof tierListService.getTierListById>>
  try {
    tierList = await tierListService.getTierListById(id)
  } catch (error) {
    console.error('Error loading tier list:', error)
    notFound()
  }

  if (!tierList) {
    notFound()
  }

  // Views tracking is now handled by useViewTracking hook in TierListPageClient
  // This provides 30-minute interval validation and full audit trail

  return <TierListPageClient tierList={tierList} />
}

