/**
 * Public templates list API
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { TemplateService } from '@/services/template.service'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const templateService = new TemplateService(supabase)

    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get('search') || undefined
    const categoryId = searchParams.get('category_id') || undefined
    const sort = (searchParams.get('sort') as 'recent' | 'name') || 'recent'
    const limit = Math.min(parseInt(searchParams.get('limit') || '24', 10), 50)
    const offset = parseInt(searchParams.get('offset') || '0', 10)

    const filters = {
      search,
      category_id: categoryId,
      sort,
      limit,
      offset,
    }

    const [data, total] = await Promise.all([
      templateService.getPublicTemplates(filters),
      templateService.countPublicTemplates({
        search,
        category_id: categoryId,
      }),
    ])

    return NextResponse.json({ data, total, limit, offset })
  } catch (error: unknown) {
    console.error('Error fetching templates:', error)
    const message = error instanceof Error ? error.message : 'Failed to fetch templates'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
