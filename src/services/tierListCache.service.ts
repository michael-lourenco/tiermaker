/**
 * TierListCacheService
 * Service para gerenciar cache de tier lists públicas
 * Otimiza performance evitando múltiplos joins a cada requisição
 */

import { createClient } from '@/lib/supabase/client'
import type {
  TierListCache,
  TierListCacheQuery,
  TierListSortOption,
  TierListWithData,
} from '@/types/tierList.types'

export class TierListCacheService {
  private supabase: any

  constructor(supabaseClient?: any) {
    this.supabase = supabaseClient || createClient()
  }

  /**
   * Verifica se cache existe para o dia atual
   */
  async cacheExistsForToday(): Promise<boolean> {
    const { data, error } = await this.supabase
      .rpc('tier_lists_cache_exists')

    if (error) {
      console.error('Error checking cache existence:', error)
      return false
    }

    return data === true
  }

  /**
   * Garante que cache existe (gera se não existir)
   */
  async ensureCache(): Promise<void> {
    try {
      const { data, error } = await this.supabase.rpc('ensure_tier_lists_cache')

      if (error) {
        console.error('Error ensuring cache:', error)
        console.error('Error details:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
        })
        
        // Se a função RPC não existir, tentar gerar cache diretamente
        if (error.code === '42883' || error.message?.includes('function') || error.message?.includes('does not exist')) {
          console.warn('RPC function not found, trying to generate cache directly')
          await this.generateCache()
          return
        }
        
        throw error
      }
    } catch (error: any) {
      // Se a função RPC não existir, tentar gerar cache diretamente
      if (error?.code === '42883' || error?.message?.includes('function') || error?.message?.includes('does not exist')) {
        console.warn('RPC function not found, trying to generate cache directly')
        await this.generateCache()
      } else {
        throw error
      }
    }
  }

  /**
   * Gera cache manualmente (útil para forçar atualização)
   */
  async generateCache(): Promise<void> {
    console.log('Generating tier lists cache...')
    try {
      const { data, error } = await this.supabase.rpc('generate_tier_lists_cache')

      if (error) {
        console.error('Error generating cache:', error)
        console.error('Error details:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
        })
        
        // Se a função não existir, não lançar erro (pode ser que a migration não foi executada)
        if (error.code === '42883' || error.message?.includes('function') || error.message?.includes('does not exist')) {
          console.warn('RPC function generate_tier_lists_cache does not exist. Migration may not have been run.')
          return
        }
        
        throw error
      }
      
      console.log('Cache generation completed successfully')
    } catch (error: any) {
      // Se for erro de função não encontrada, apenas logar e continuar
      if (error?.code === '42883' || error?.message?.includes('function') || error?.message?.includes('does not exist')) {
        console.warn('RPC function generate_tier_lists_cache does not exist. Migration may not have been run.')
        return
      }
      throw error
    }
  }

  /**
   * Limpa cache antigo (mais de 7 dias)
   */
  async cleanOldCache(): Promise<void> {
    const { error } = await this.supabase.rpc('clean_old_tier_lists_cache')

    if (error) {
      console.error('Error cleaning old cache:', error)
      // Não lançar erro, apenas logar
    }
  }

  /**
   * Busca tier lists públicas diretamente (fallback quando cache falha)
   */
  private async getTierListsDirectly(query: TierListCacheQuery = {}): Promise<{
    data: Array<TierListWithData & {
      template_name?: string
      category_name?: string
      category_slug?: string
      user_email?: string | null
    }>
    total: number
  }> {
    const {
      filters = {},
      sort = 'recent',
      limit = 20,
      offset = 0,
    } = query

    console.log('Fetching tier lists directly from database (cache fallback)')

    // Buscar tier lists públicas diretamente
    let tierListQuery = this.supabase
      .from('tier_lists')
      .select(`
        *,
        templates!inner(name, deleted_at, is_public),
        template_categories(
          categories(id, name, slug)
        )
      `, { count: 'exact' })
      .eq('is_public', true)
      .eq('templates.is_public', true)
      .is('templates.deleted_at', null)

    // Aplicar filtros
    if (filters.template_id) {
      tierListQuery = tierListQuery.eq('template_id', filters.template_id)
    }

    if (filters.user_id) {
      tierListQuery = tierListQuery.eq('user_id', filters.user_id)
    }

    if (filters.search) {
      tierListQuery = tierListQuery.ilike('title', `%${filters.search}%`)
    }

    if (filters.period && filters.period !== 'all') {
      const now = new Date()
      let startDate: Date

      switch (filters.period) {
        case 'today':
          startDate = new Date(now.setHours(0, 0, 0, 0))
          break
        case 'week':
          startDate = new Date(now.setDate(now.getDate() - 7))
          break
        case 'month':
          startDate = new Date(now.setMonth(now.getMonth() - 1))
          break
        default:
          startDate = new Date(0)
      }

      tierListQuery = tierListQuery.gte('created_at', startDate.toISOString())
    }

    // Aplicar ordenação
    switch (sort) {
      case 'views':
        tierListQuery = tierListQuery.order('views_count', { ascending: false })
        break
      case 'likes':
        tierListQuery = tierListQuery.order('likes_count', { ascending: false })
        break
      case 'recent':
      default:
        tierListQuery = tierListQuery.order('created_at', { ascending: false })
        break
    }

    // Aplicar paginação
    tierListQuery = tierListQuery.range(offset, offset + limit - 1)

    const result = await tierListQuery as { data: any[] | null; error: any; count: number | null }

    if (result.error) {
      console.error('Error fetching tier lists directly:', result.error)
      return { data: [], total: 0 }
    }

    if (!result.data || result.data.length === 0) {
      console.log('No public tier lists found in database')
      return { data: [], total: 0 }
    }

    // Buscar todos os templates de uma vez
    const templateIds = [...new Set(result.data.map((tl: any) => tl.template_id))]
    const { data: templates } = await this.supabase
      .from('templates')
      .select('id, name, deleted_at, is_public')
      .in('id', templateIds)
      .eq('is_public', true)
      .is('deleted_at', null) as { data: any[] | null; error: any }

    const templatesMap = new Map((templates || []).map((t: any) => [t.id, t]))

    // Buscar todas as categorias de uma vez
    const { data: templateCategories } = await this.supabase
      .from('template_categories')
      .select('template_id, category_id, categories(id, name, slug)')
      .in('template_id', templateIds) as { data: any[] | null; error: any }

    const categoriesMap = new Map()
    ;(templateCategories || []).forEach((tc: any) => {
      if (!categoriesMap.has(tc.template_id)) {
        categoriesMap.set(tc.template_id, tc)
      }
    })

    // Filtrar apenas tier lists com templates públicos e não deletados
    const validTierLists = result.data
      .filter((tl: any) => {
        const template = templatesMap.get(tl.template_id)
        return template && template.is_public && !template.deleted_at
      })
      .map((tl: any) => {
        const template = templatesMap.get(tl.template_id)
        const templateCategory = categoriesMap.get(tl.template_id)

        return {
          id: tl.id,
          user_id: tl.user_id,
          template_id: tl.template_id,
          title: tl.title,
          is_public: true,
          share_token: tl.share_token,
          views_count: tl.views_count,
          likes_count: tl.likes_count,
          created_at: tl.created_at,
          updated_at: tl.updated_at,
          tiers: [], // Será carregado depois se necessário
          items: [], // Será carregado depois se necessário
          template_name: template?.name,
          category_id: templateCategory?.category_id || templateCategory?.categories?.id || null,
          category_name: templateCategory?.categories?.name || null,
          category_slug: templateCategory?.categories?.slug || null,
          user_email: null, // Não disponível na query direta
        }
      })

    // Aplicar filtros adicionais
    let filtered = validTierLists
    if (filters.template_id) {
      filtered = filtered.filter((tl) => tl.template_id === filters.template_id)
    }
    if (filters.category_id) {
      filtered = filtered.filter((tl) => tl.category_id === filters.category_id)
    }
    if (filters.user_id) {
      filtered = filtered.filter((tl) => tl.user_id === filters.user_id)
    }
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter((tl) => tl.title.toLowerCase().includes(searchLower))
    }

    // Aplicar ordenação
    switch (sort) {
      case 'views':
        filtered.sort((a, b) => b.views_count - a.views_count)
        break
      case 'likes':
        filtered.sort((a, b) => b.likes_count - a.likes_count)
        break
      case 'recent':
      default:
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        break
    }

    // Aplicar paginação
    const paginated = filtered.slice(offset, offset + limit)

    return {
      data: paginated,
      total: filtered.length,
    }
  }

  /**
   * Busca tier lists do cache com filtros, ordenação e paginação
   */
  async getCachedTierLists(query: TierListCacheQuery = {}): Promise<{
    data: Array<TierListWithData & {
      template_name?: string
      category_name?: string
      category_slug?: string
      user_email?: string | null
    }>
    total: number
  }> {
    const {
      filters = {},
      sort = 'recent',
      limit = 20,
      offset = 0,
    } = query

    // Garantir que cache existe (com tratamento de erro)
    let cacheAvailable = false
    try {
      await this.ensureCache()
      cacheAvailable = true
    } catch (error: any) {
      console.error('Error ensuring cache, will try direct query:', error)
      // Se cache falhar, usar fallback direto
      return this.getTierListsDirectly(query)
    }

    // Construir query base
    const todayDate = new Date().toISOString().split('T')[0]
    console.log('Querying cache for date:', todayDate)
    let cacheQuery = this.supabase
      .from('tier_lists_cache')
      .select('*', { count: 'exact' })
      .eq('cache_date', todayDate)

    // Aplicar filtros
    if (filters.template_id) {
      cacheQuery = cacheQuery.eq('template_id', filters.template_id)
    }

    if (filters.category_id) {
      cacheQuery = cacheQuery.eq('category_id', filters.category_id)
    }

    if (filters.user_id) {
      cacheQuery = cacheQuery.eq('user_id', filters.user_id)
    }

    if (filters.search) {
      // Use ilike for search (textSearch requires specific setup)
      cacheQuery = cacheQuery.ilike('title', `%${filters.search}%`)
    }

    if (filters.period && filters.period !== 'all') {
      const now = new Date()
      let startDate: Date

      switch (filters.period) {
        case 'today':
          startDate = new Date(now.setHours(0, 0, 0, 0))
          break
        case 'week':
          startDate = new Date(now.setDate(now.getDate() - 7))
          break
        case 'month':
          startDate = new Date(now.setMonth(now.getMonth() - 1))
          break
        default:
          startDate = new Date(0)
      }

      cacheQuery = cacheQuery.gte('created_at', startDate.toISOString())
    }

    // Aplicar ordenação
    switch (sort) {
      case 'views':
        cacheQuery = cacheQuery.order('views_count', { ascending: false })
        break
      case 'likes':
        cacheQuery = cacheQuery.order('likes_count', { ascending: false })
        break
      case 'recent':
      default:
        cacheQuery = cacheQuery.order('created_at', { ascending: false })
        break
    }

    // Aplicar paginação
    cacheQuery = cacheQuery.range(offset, offset + limit - 1)

    const result = await cacheQuery as { data: TierListCache[] | null; error: any; count: number | null }

    if (result.error) {
      console.error('Error fetching cached tier lists:', result.error)
      console.error('Error details:', {
        message: result.error.message,
        code: result.error.code,
        details: result.error.details,
        hint: result.error.hint,
      })
      
      // Se não houver cache, retornar array vazio em vez de erro
      if (result.error.code === 'PGRST116' || result.error.message?.includes('No rows')) {
        console.warn('No cache found, returning empty array')
        return {
          data: [],
          total: 0,
        }
      }
      
      throw result.error
    }

    console.log(`Found ${result.data?.length || 0} cached tier lists (total: ${result.count || 0})`)

    // Converter cache entries para TierListWithData com informações adicionais
    const tierLists: Array<TierListWithData & {
      template_name?: string
      category_name?: string
      category_slug?: string
      user_email?: string | null
    }> = (result.data || []).map((cache: TierListCache) => {
      const tierListData = cache.tier_list_data as any
      return {
        id: cache.tier_list_id,
        user_id: cache.user_id,
        template_id: cache.template_id,
        title: cache.title,
        is_public: true as boolean, // Cache só contém tier lists públicas
        share_token: null as string | null, // Não necessário no cache
        views_count: cache.views_count,
        likes_count: cache.likes_count,
        created_at: cache.created_at,
        updated_at: cache.created_at,
        tiers: tierListData.tiers || [],
        items: (tierListData.items || []).map((item: any) => ({
          id: item.id,
          tier_list_id: cache.tier_list_id,
          template_item_id: item.template_item_id,
          tier_name: item.tier_name,
          order: item.order,
          created_at: cache.created_at,
          template_item: item.template_item,
        })),
        // Informações adicionais do cache
        template_name: cache.template_name,
        category_name: cache.category_name,
        category_slug: cache.category_slug,
        user_email: cache.user_email,
      } as TierListWithData & {
        template_name?: string
        category_name?: string
        category_slug?: string
        user_email?: string | null
      }
    })

    return {
      data: tierLists,
      total: result.count || 0,
    }
  }

  /**
   * Busca templates únicos disponíveis no cache (para filtro)
   */
  async getAvailableTemplates(): Promise<Array<{ id: string; name: string }>> {
    await this.ensureCache()

    const todayDate = new Date().toISOString().split('T')[0]
    const { data, error } = await this.supabase
      .from('tier_lists_cache')
      .select('template_id, template_name')
      .eq('cache_date', todayDate)
      .order('template_name', { ascending: true })

    if (error) {
      console.error('Error fetching available templates:', error)
      return []
    }

    // Remover duplicatas
    const uniqueTemplates = new Map<string, string>()
    ;(data || []).forEach((item: any) => {
      if (!uniqueTemplates.has(item.template_id)) {
        uniqueTemplates.set(item.template_id, item.template_name)
      }
    })

    return Array.from(uniqueTemplates.entries()).map(([id, name]) => ({
      id,
      name,
    }))
  }

  /**
   * Busca categorias únicas disponíveis no cache (para filtro)
   */
  async getAvailableCategories(): Promise<
    Array<{ id: string; name: string; slug: string }>
  > {
    await this.ensureCache()

    const todayDate = new Date().toISOString().split('T')[0]
    const { data, error } = await this.supabase
      .from('tier_lists_cache')
      .select('category_id, category_name, category_slug')
      .eq('cache_date', todayDate)
      .not('category_id', 'is', null)
      .order('category_name', { ascending: true })

    if (error) {
      console.error('Error fetching available categories:', error)
      return []
    }

    // Remover duplicatas
    const uniqueCategories = new Map<
      string,
      { name: string; slug: string }
    >()
    ;(data || []).forEach((item: any) => {
      if (
        item.category_id &&
        !uniqueCategories.has(item.category_id)
      ) {
        uniqueCategories.set(item.category_id, {
          name: item.category_name,
          slug: item.category_slug,
        })
      }
    })

    return Array.from(uniqueCategories.entries()).map(([id, info]) => ({
      id,
      name: info.name,
      slug: info.slug,
    }))
  }
}
