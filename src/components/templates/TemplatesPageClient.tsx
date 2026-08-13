'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { TemplateGrid } from '@/components/templates/TemplateGrid'
import { useTranslation } from '@/hooks/useTranslation'
import { PageWithSidebar } from '@/components/layout/PageWithSidebar'
import type { TemplateWithCategories } from '@/types/template.types'
import { Search, X } from 'lucide-react'

interface TemplatesPageClientProps {
  templates: TemplateWithCategories[]
  total: number
  categories: Array<{ id: string; name: string; slug: string }>
  initialSearch?: string
  initialCategoryId?: string
  categoryName?: string
}

export function TemplatesPageClient({
  templates: initialTemplates,
  total: initialTotal,
  categories,
  initialSearch = '',
  initialCategoryId,
  categoryName,
}: TemplatesPageClientProps) {
  const { t } = useTranslation()
  const [templates, setTemplates] = useState(initialTemplates)
  const [total, setTotal] = useState(initialTotal)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(initialTemplates.length < initialTotal)
  const observerTarget = useRef<HTMLDivElement>(null)

  const [search, setSearch] = useState(initialSearch)
  const [categoryFilter, setCategoryFilter] = useState(initialCategoryId || 'all')
  const [sort, setSort] = useState<'recent' | 'name'>('recent')
  const [skipFirstReload, setSkipFirstReload] = useState(true)

  const buildParams = useCallback(
    (offset: number) => {
      const params = new URLSearchParams()
      if (search.trim()) params.set('search', search.trim())
      if (categoryFilter !== 'all') params.set('category_id', categoryFilter)
      params.set('sort', sort)
      params.set('limit', '24')
      params.set('offset', offset.toString())
      return params
    },
    [search, categoryFilter, sort]
  )

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return
    setLoading(true)
    try {
      const response = await fetch(`/api/templates?${buildParams(templates.length).toString()}`)
      if (!response.ok) throw new Error('Failed to load templates')
      const data = await response.json()
      setTemplates((prev) => [...prev, ...data.data])
      setTotal(data.total)
      setHasMore(templates.length + data.data.length < data.total)
    } catch {
      /* silent */
    } finally {
      setLoading(false)
    }
  }, [loading, hasMore, buildParams, templates.length])

  useEffect(() => {
    if (skipFirstReload) {
      setSkipFirstReload(false)
      return
    }

    const reload = async () => {
      setLoading(true)
      setTemplates([])
      setHasMore(true)
      try {
        const response = await fetch(`/api/templates?${buildParams(0).toString()}`)
        if (!response.ok) throw new Error('Failed to load templates')
        const data = await response.json()
        setTemplates(data.data)
        setTotal(data.total)
        setHasMore(data.data.length < data.total)
      } catch {
        /* silent */
      } finally {
        setLoading(false)
      }
    }

    const timeoutId = setTimeout(reload, search ? 500 : 0)
    return () => clearTimeout(timeoutId)
  }, [search, categoryFilter, sort, buildParams, skipFirstReload])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          void loadMore()
        }
      },
      { threshold: 0.1 }
    )
    const el = observerTarget.current
    if (el) observer.observe(el)
    return () => {
      if (el) observer.unobserve(el)
    }
  }, [hasMore, loading, loadMore])

  const hasFilters = Boolean(search.trim()) || categoryFilter !== 'all' || sort !== 'recent'

  const clearFilters = () => {
    setSearch('')
    setCategoryFilter('all')
    setSort('recent')
  }

  return (
    <main className="min-h-screen p-4 sm:p-6 md:p-8">
      <PageWithSidebar showLeftSidebar={true}>
        <div className="mb-6 md:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">
                {categoryName && categoryFilter !== 'all'
                  ? `${t('templates.categoryFilter')} ${categoryName}`
                  : t('templates.title')}
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                {t('templates.browseDescription')}
              </p>
            </div>
            <Link href="/categories" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full sm:w-auto">
                {t('templates.browseCategories')}
              </Button>
            </Link>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t('templates.searchPlaceholder')}
                className="pl-9"
              />
            </div>
            <Select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="sm:w-48"
            >
              <option value="all">{t('templates.allCategories')}</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
            <Select
              value={sort}
              onChange={(e) => setSort(e.target.value as 'recent' | 'name')}
              className="sm:w-44"
            >
              <option value="recent">{t('templates.sortRecent')}</option>
              <option value="name">{t('templates.sortName')}</option>
            </Select>
            {hasFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1">
                <X className="h-4 w-4" />
                {t('templates.clearFilter')}
              </Button>
            )}
          </div>

          <p className="text-xs text-muted-foreground mb-2">
            {total} {total === 1 ? t('categories.template') : t('categories.templates')}
          </p>
        </div>

        {templates.length === 0 && !loading ? (
          <p className="text-muted-foreground">{t('templates.noTemplatesFound')}</p>
        ) : (
          <TemplateGrid templates={templates} />
        )}

        {loading && (
          <p className="text-center text-sm text-muted-foreground mt-4">{t('common.loading')}</p>
        )}
        <div ref={observerTarget} className="h-8" />
      </PageWithSidebar>
    </main>
  )
}
