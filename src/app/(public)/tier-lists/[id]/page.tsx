import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { TierListService } from '@/services/tierList.service'
import { TierListPageClient } from '@/components/tier-lists/TierListPageClient'
import { generateShareMetadata } from '@/lib/share/meta-tags'
import type { Metadata } from 'next'

interface TierListPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: TierListPageProps): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()
  const tierListService = new TierListService(supabase)
  
  try {
    const tierList = await tierListService.getTierListById(id)
    if (!tierList) {
      return {
        title: 'Tier list not found',
      }
    }
    return generateShareMetadata('tier_list', tierList)
  } catch (error) {
    return {
      title: 'Tier list not found',
    }
  }
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

