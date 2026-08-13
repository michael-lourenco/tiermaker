import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { TierListService } from '@/services/tierList.service'
import { TierListPageClient } from '@/components/tier-lists/TierListPageClient'
import { generateShareMetadata } from '@/lib/share/meta-tags'
import { hasCoverImage } from '@/lib/utils/publicVisibility'
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

  const {
    data: { user },
  } = await supabase.auth.getUser()
  const isOwner = Boolean(user && tierList.user_id === user.id)

  const { data: template } = await supabase
    .from('templates')
    .select('cover_image_url, is_public, deleted_at')
    .eq('id', tierList.template_id)
    .maybeSingle() as {
    data: { cover_image_url: string | null; is_public: boolean; deleted_at: string | null } | null
  }

  const publiclyVisible =
    tierList.is_public &&
    Boolean(template) &&
    !template?.deleted_at &&
    template?.is_public === true &&
    hasCoverImage(template?.cover_image_url)

  if (!publiclyVisible && !isOwner) {
    notFound()
  }

  return <TierListPageClient tierList={tierList} />
}
