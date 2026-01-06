/**
 * Tier Lists API Route
 * Retorna tier lists públicas com cache otimizado
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { TierListCacheService } from '@/services/tierListCache.service'
import type { TierListCacheQuery } from '@/types/tierList.types'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const serviceRoleClient = createServiceRoleClient()
    
    // Usar service role para bypass RLS no cache
    const cacheService = new TierListCacheService(serviceRoleClient as any)

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams
    const templateId = searchParams.get('template_id') || undefined
    const categoryId = searchParams.get('category_id') || undefined
    const userId = searchParams.get('user_id') || undefined
    const search = searchParams.get('search') || undefined
    const period = (searchParams.get('period') as 'today' | 'week' | 'month' | 'all') || 'all'
    const sort = (searchParams.get('sort') as 'recent' | 'views' | 'likes') || 'recent'
    const limit = parseInt(searchParams.get('limit') || '20', 10)
    const offset = parseInt(searchParams.get('offset') || '0', 10)

    const query: TierListCacheQuery = {
      filters: {
        template_id: templateId,
        category_id: categoryId,
        user_id: userId,
        search,
        period,
      },
      sort,
      limit,
      offset,
    }

    let result
    try {
      result = await cacheService.getCachedTierLists(query)
    } catch (cacheError: any) {
      console.error('Error getting cached tier lists, returning empty:', cacheError)
      // Se o cache falhar, retornar array vazio em vez de erro
      result = {
        data: [],
        total: 0,
      }
    }

    return NextResponse.json({
      data: result.data,
      total: result.total,
      limit,
      offset,
    })
  } catch (error: any) {
    console.error('Error fetching tier lists:', error)
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
      stack: error.stack,
    })
    return NextResponse.json(
      { 
        error: error.message || 'Failed to fetch tier lists',
        details: process.env.NODE_ENV === 'development' ? {
          code: error.code,
          details: error.details,
          hint: error.hint,
        } : undefined
      },
      { status: 500 }
    )
  }
}
