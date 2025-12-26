import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { TierListService } from '@/services/tierList.service'
import { TierListView } from '@/components/tier-lists/TierListView'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

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

  // Increment views (fire and forget)
  tierListService.incrementViews(id).catch(console.error)

  return (
    <main className="min-h-screen p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 md:mb-8">
          <Link href="/templates">
            <Button variant="ghost" size="sm">← Back</Button>
          </Link>
        </div>

        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">{tierList.title}</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Created {new Date(tierList.created_at).toLocaleDateString()}
          </p>
        </div>

        <TierListView tierList={tierList} />
      </div>
    </main>
  )
}

