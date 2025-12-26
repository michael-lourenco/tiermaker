import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * API Route: POST /api/views/register
 * 
 * Registra uma visualização de template ou tier_list.
 * Valida intervalo mínimo de 30 minutos no servidor.
 * 
 * Body:
 * {
 *   content_type: 'template' | 'tier_list',
 *   content_id: string (UUID),
 *   session_id: string (UUID v4, para usuários não autenticados)
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Parse body
    const body = await request.json()
    const { content_type, content_id, session_id } = body

    // Validação básica
    if (!content_type || !content_id) {
      return NextResponse.json(
        { error: 'content_type and content_id are required' },
        { status: 400 }
      )
    }

    if (content_type !== 'template' && content_type !== 'tier_list') {
      return NextResponse.json(
        { error: 'content_type must be "template" or "tier_list"' },
        { status: 400 }
      )
    }

    // Obter user_id se usuário estiver autenticado
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const user_id = user?.id || null

    // Se não tem user_id nem session_id, retorna erro
    if (!user_id && !session_id) {
      return NextResponse.json(
        { error: 'user_id or session_id is required' },
        { status: 400 }
      )
    }

    // Capturar metadados da requisição
    // IP address: tenta x-forwarded-for (Vercel/proxies), depois x-real-ip
    const ip_address = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
                      request.headers.get('x-real-ip') ||
                      null
    
    const user_agent = request.headers.get('user-agent') || null
    const referrer = request.headers.get('referer') || null

    // Converter IP para formato INET do PostgreSQL (se válido)
    let ip_inet: string | null = null
    if (ip_address) {
      // Validação básica de IP (IPv4 ou IPv6)
      const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/
      const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/
      if (ipv4Regex.test(ip_address) || ipv6Regex.test(ip_address)) {
        ip_inet = ip_address
      }
    }

    // Chamar função PostgreSQL para registrar visualização
    // Usar 'as any' porque os tipos do Supabase não incluem funções RPC customizadas
    const { data, error } = await (supabase as any).rpc('register_view', {
      p_user_id: user_id,
      p_session_id: session_id || null,
      p_content_type: content_type,
      p_content_id: content_id,
      p_ip_address: ip_inet,
      p_user_agent: user_agent,
      p_referrer: referrer,
    })

    if (error) {
      console.error('Error registering view:', error)
      return NextResponse.json(
        { error: 'Failed to register view', details: error.message },
        { status: 500 }
      )
    }

    // Retornar resultado
    const result = data as string
    if (result === 'counted') {
      return NextResponse.json({ 
        success: true, 
        status: 'counted',
        message: 'View registered successfully' 
      })
    } else if (result === 'ignored') {
      return NextResponse.json({ 
        success: true, 
        status: 'ignored',
        message: 'View ignored (within 30-minute interval)' 
      })
    } else {
      // Erro retornado pela função
      return NextResponse.json(
        { error: result },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Error in /api/views/register:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

