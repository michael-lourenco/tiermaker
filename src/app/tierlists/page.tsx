import { createServiceRoleClient } from '@/lib/supabase/server'
import { TierListCacheService } from '@/services/tierListCache.service'
import { TierListsPageClient } from '@/components/tier-lists/TierListsPageClient'

export default async function TierListsPage() {
  const serviceRoleClient = createServiceRoleClient()
  const cacheService = new TierListCacheService(serviceRoleClient as any)

  try {
    // Garantir que cache existe
    console.log('[TierListsPage] Ensuring cache exists...')
    await cacheService.ensureCache()
    console.log('[TierListsPage] Cache ensured')

    // Buscar tier lists iniciais
    console.log('[TierListsPage] Fetching cached tier lists...')
    const { data: tierLists, total } = await cacheService.getCachedTierLists({
      sort: 'recent',
      limit: 20,
      offset: 0,
    })
    console.log(`[TierListsPage] Found ${tierLists.length} tier lists (total: ${total})`)

    // Buscar templates e categorias disponíveis para filtros
    const [templates, categories] = await Promise.all([
      cacheService.getAvailableTemplates(),
      cacheService.getAvailableCategories(),
    ])

    return (
      <TierListsPageClient
        initialTierLists={tierLists}
        total={total}
        templates={templates}
        categories={categories}
      />
    )
  } catch (error) {
    console.error('Error loading tier lists:', error)
    return (
      <TierListsPageClient
        initialTierLists={[]}
        total={0}
        templates={[]}
        categories={[]}
      />
    )
  }
}
