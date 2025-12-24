import { notFound } from 'next/navigation'
import { TierListService } from '@/services/tierList.service'
import { TierListView } from '@/components/tier-lists/TierListView'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface TierListPageProps {
  params: Promise<{ id: string }>
}

export default async function TierListPage({ params }: TierListPageProps) {
  const { id } = await params
  const tierListService = new TierListService()
  const tierList = await tierListService.getTierListById(id)

  if (!tierList) {
    notFound()
  }

  // Increment views (fire and forget)
  tierListService.incrementViews(id).catch(console.error)

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <Link href="/templates">
            <Button variant="ghost">← Back</Button>
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">{tierList.title}</h1>
          <p className="text-muted-foreground">
            Created {new Date(tierList.created_at).toLocaleDateString()}
          </p>
        </div>

        <TierListView tierList={tierList} />
      </div>
    </main>
  )
}

