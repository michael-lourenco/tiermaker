import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { TierListService } from '@/services/tierList.service'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default async function MyTierListsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const tierListService = new TierListService()
  const tierLists = await tierListService.getUserTierLists(user.id)

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">My Tier Lists</h1>
          <p className="text-muted-foreground">
            Manage your saved tier lists
          </p>
        </div>

        {tierLists.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">You haven't created any tier lists yet.</p>
            <Link href="/templates">
              <Button>Browse Templates</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tierLists.map((tierList) => (
              <Card key={tierList.id}>
                <CardHeader>
                  <CardTitle>{tierList.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Created {new Date(tierList.created_at).toLocaleDateString()}
                  </p>
                </CardContent>
                <CardFooter>
                  <Link href={`/tier-lists/${tierList.id}`} className="w-full">
                    <Button variant="outline" className="w-full">
                      View
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

