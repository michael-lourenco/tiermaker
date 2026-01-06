'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { TierListCard } from './TierListCard'
import { useTranslation } from '@/hooks/useTranslation'
import { AdSpace } from '@/components/ads/AdSpace'
import { PageWithSidebar } from '@/components/layout/PageWithSidebar'
import type { TierListWithData } from '@/types/tierList.types'
import { Search, X } from 'lucide-react'

interface TierListsPageClientProps {
  initialTierLists: TierListWithData[]
  total: number
  templates: Array<{ id: string; name: string }>
  categories: Array<{ id: string; name: string; slug: string }>
}

export function TierListsPageClient({
  initialTierLists,
  total: initialTotal,
  templates,
  categories,
}: TierListsPageClientProps) {
  const { t } = useTranslation()
  const [tierLists, setTierLists] = useState(initialTierLists)
  const [total, setTotal] = useState(initialTotal)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(initialTierLists.length < initialTotal)
  const observerTarget = useRef<HTMLDivElement>(null)

  // Filters
  const [search, setSearch] = useState('')
  const [templateFilter, setTemplateFilter] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [periodFilter, setPeriodFilter] = useState<string>('all')
  const [sort, setSort] = useState<'recent' | 'views' | 'likes'>('recent')

  // Load more tier lists
  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return

    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (templateFilter !== 'all') params.set('template_id', templateFilter)
      if (categoryFilter !== 'all') params.set('category_id', categoryFilter)
      if (periodFilter !== 'all') params.set('period', periodFilter)
      params.set('sort', sort)
      params.set('limit', '20')
      params.set('offset', tierLists.length.toString())

      const response = await fetch(`/api/tierlists?${params.toString()}`)
      if (!response.ok) throw new Error('Failed to load tier lists')

      const data = await response.json()
      setTierLists((prev) => [...prev, ...data.data])
      setTotal(data.total)
      setHasMore(tierLists.length + data.data.length < data.total)
    } catch (error) {
      console.error('Error loading more tier lists:', error)
    } finally {
      setLoading(false)
    }
  }, [loading, hasMore, search, templateFilter, categoryFilter, periodFilter, sort, tierLists.length])

  // Reset and reload when filters change
  useEffect(() => {
    const reloadTierLists = async () => {
      setLoading(true)
      setTierLists([])
      setHasMore(true)

      try {
        const params = new URLSearchParams()
        if (search) params.set('search', search)
        if (templateFilter !== 'all') params.set('template_id', templateFilter)
        if (categoryFilter !== 'all') params.set('category_id', categoryFilter)
        if (periodFilter !== 'all') params.set('period', periodFilter)
        params.set('sort', sort)
        params.set('limit', '20')
        params.set('offset', '0')

        const response = await fetch(`/api/tierlists?${params.toString()}`)
        if (!response.ok) throw new Error('Failed to load tier lists')

        const data = await response.json()
        setTierLists(data.data)
        setTotal(data.total)
        setHasMore(data.data.length < data.total)
      } catch (error) {
        console.error('Error loading tier lists:', error)
      } finally {
        setLoading(false)
      }
    }

    // Debounce search
    const timeoutId = setTimeout(() => {
      reloadTierLists()
    }, search ? 500 : 0)

    return () => clearTimeout(timeoutId)
  }, [search, templateFilter, categoryFilter, periodFilter, sort])

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadMore()
        }
      },
      { threshold: 0.1 }
    )

    const currentTarget = observerTarget.current
    if (currentTarget) {
      observer.observe(currentTarget)
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget)
      }
    }
  }, [hasMore, loading, loadMore])

  const handleLike = (tierListId: string, liked: boolean) => {
    setTierLists((prev) =>
      prev.map((tl) => {
        if (tl.id === tierListId) {
          return {
            ...tl,
            likes_count: liked ? tl.likes_count + 1 : Math.max(0, tl.likes_count - 1),
          }
        }
        return tl
      })
    )
  }

  const clearFilters = () => {
    setSearch('')
    setTemplateFilter('all')
    setCategoryFilter('all')
    setPeriodFilter('all')
    setSort('recent')
  }

  const hasActiveFilters =
    search || templateFilter !== 'all' || categoryFilter !== 'all' || periodFilter !== 'all'

  return (
    <main className="min-h-screen p-4 sm:p-6 md:p-8">
      <PageWithSidebar showRightSidebar={true}>
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">
            Tier Lists Públicas
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Explore tier lists criadas pela comunidade
          </p>
        </div>

        {/* Filters Section */}
        <div className="mb-6 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por título..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filters Row */}
          <div className="flex flex-wrap gap-3 items-center">
            <Select
              value={templateFilter}
              onValueChange={setTemplateFilter}
              className="w-full sm:w-[200px]"
            >
              <option value="all">Todos os Templates</option>
              {templates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </Select>

            <Select
              value={categoryFilter}
              onValueChange={setCategoryFilter}
              className="w-full sm:w-[200px]"
            >
              <option value="all">Todas as Categorias</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </Select>

            <Select
              value={periodFilter}
              onValueChange={setPeriodFilter}
              className="w-full sm:w-[200px]"
            >
              <option value="all">Todos os Períodos</option>
              <option value="today">Hoje</option>
              <option value="week">Última Semana</option>
              <option value="month">Último Mês</option>
            </Select>

            <Select
              value={sort}
              onValueChange={(v) => setSort(v as 'recent' | 'views' | 'likes')}
              className="w-full sm:w-[200px]"
            >
              <option value="recent">Mais Recentes</option>
              <option value="views">Mais Visualizadas</option>
              <option value="likes">Mais Curtidas</option>
            </Select>

            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="w-full sm:w-auto"
              >
                <X className="h-4 w-4 mr-1" />
                Limpar Filtros
              </Button>
            )}
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4 text-sm text-muted-foreground">
          {total} {total === 1 ? 'tier list encontrada' : 'tier lists encontradas'}
        </div>

        {/* Tier Lists Grid */}
        {tierLists.length === 0 && !loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              Nenhuma tier list encontrada
            </p>
            {hasActiveFilters && (
              <Button variant="outline" onClick={clearFilters}>
                Limpar Filtros
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {tierLists.map((tierList, index) => (
              <div key={tierList.id}>
                <TierListCard
                  tierList={tierList as any}
                  onLike={handleLike}
                />
                {/* Ad Space - In Feed (a cada 6 cards) */}
                {(index + 1) % 6 === 0 && (
                  <AdSpace position="in-feed" className="mt-4 col-span-full" />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Loading / Load More */}
        {loading && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Carregando...</p>
          </div>
        )}

        {/* Infinite Scroll Trigger */}
        {hasMore && !loading && (
          <div ref={observerTarget} className="h-20" />
        )}

        {/* Ad Space - Content Bottom */}
        <AdSpace position="content-bottom" />
      </PageWithSidebar>
    </main>
  )
}
