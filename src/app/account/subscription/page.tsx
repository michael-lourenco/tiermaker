import { SubscriptionStatus } from '@/components/subscription/SubscriptionStatus'
import { SuccessMessage } from '@/components/subscription/SuccessMessage'

interface AccountSubscriptionPageProps {
  searchParams: Promise<{ success?: string; canceled?: string }>
}

export default async function AccountSubscriptionPage({
  searchParams,
}: AccountSubscriptionPageProps) {
  const params = await searchParams

  return (
    <main className="min-h-screen p-4 sm:p-6 md:p-8 lg:p-12">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">Minha Assinatura</h1>
          <p className="text-muted-foreground">
            Gerencie sua assinatura e visualize seu status
          </p>
        </div>

        {params?.success === 'true' && (
          <SuccessMessage className="mb-6" />
        )}

        {params?.canceled === 'true' && (
          <div className="mb-6 p-4 border border-yellow-500/50 bg-yellow-500/10 rounded-lg">
            <p className="text-yellow-600 dark:text-yellow-400">
              Pagamento cancelado. Você pode tentar novamente quando quiser.
            </p>
          </div>
        )}

        <SubscriptionStatus />
      </div>
    </main>
  )
}
