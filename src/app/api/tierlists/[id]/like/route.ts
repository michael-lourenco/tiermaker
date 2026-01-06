/**
 * Like/Unlike Tier List API Route
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(
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

    // Verificar se já existe like
    const { data: existingLike } = await supabase
      .from('likes')
      .select('id')
      .eq('user_id', user.id)
      .eq('tier_list_id', id)
      .single() as { data: any | null; error: any }

    if (existingLike) {
      // Remover like
      const { error: deleteError } = await supabase
        .from('likes')
        .delete()
        .eq('id', existingLike.id)

      if (deleteError) throw deleteError

      // Decrementar likes_count
      const { data: tierList } = await supabase
        .from('tier_lists')
        .select('likes_count')
        .eq('id', id)
        .single() as { data: any | null; error: any }

      if (tierList) {
        await (supabase as any)
          .from('tier_lists')
          .update({ likes_count: Math.max(0, tierList.likes_count - 1) })
          .eq('id', id)
      }

      return NextResponse.json({ liked: false })
    } else {
      // Adicionar like
      const { error: insertError } = await supabase.from('likes').insert({
        user_id: user.id,
        tier_list_id: id,
      } as any)

      if (insertError) throw insertError

      // Incrementar likes_count
      const { data: tierList } = await supabase
        .from('tier_lists')
        .select('likes_count')
        .eq('id', id)
        .single() as { data: any | null; error: any }

      if (tierList) {
        await (supabase as any)
          .from('tier_lists')
          .update({ likes_count: tierList.likes_count + 1 })
          .eq('id', id)
      }

      return NextResponse.json({ liked: true })
    }
  } catch (error: any) {
    console.error('Error toggling like:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to toggle like' },
      { status: 500 }
    )
  }
}

export async function GET(
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
      return NextResponse.json({ liked: false })
    }

    // Verificar se usuário curtiu
    const { data: like } = await supabase
      .from('likes')
      .select('id')
      .eq('user_id', user.id)
      .eq('tier_list_id', id)
      .single() as { data: any | null; error: any }

    return NextResponse.json({ liked: !!like })
  } catch (error: any) {
    // Se não encontrar, retorna false (não é erro)
    return NextResponse.json({ liked: false })
  }
}
