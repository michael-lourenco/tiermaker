/**
 * Update Tier List Public Status API Route
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { is_public } = body

    if (typeof is_public !== 'boolean') {
      return NextResponse.json(
        { error: 'is_public must be a boolean' },
        { status: 400 }
      )
    }

    // Verificar se a tier list pertence ao usuário
    const { data: tierList, error: fetchError } = await supabase
      .from('tier_lists')
      .select('user_id')
      .eq('id', id)
      .single() as { data: { user_id: string | null } | null; error: any }

    if (fetchError || !tierList) {
      return NextResponse.json(
        { error: 'Tier list not found' },
        { status: 404 }
      )
    }

    if (tierList.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    // Atualizar is_public
    const updateResult = await (supabase as any)
      .from('tier_lists')
      .update({ is_public })
      .eq('id', id)
      .select()
      .single()
    
    const { data, error } = updateResult

    if (error) {
      console.error('Error updating tier list:', error)
      return NextResponse.json(
        { error: error.message || 'Failed to update tier list' },
        { status: 500 }
      )
    }

    return NextResponse.json({ data })
  } catch (error: any) {
    console.error('Error updating tier list:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update tier list' },
      { status: 500 }
    )
  }
}
