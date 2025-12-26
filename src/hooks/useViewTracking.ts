'use client'

import { useEffect, useRef } from 'react'
import { getOrCreateSessionId } from '@/lib/utils/session'

/**
 * Hook para rastrear visualizações de templates e tier lists
 * 
 * Registra visualização automaticamente quando o componente é montado.
 * Respeita intervalo mínimo de 30 minutos (validação no servidor).
 * 
 * @param contentType - 'template' ou 'tier_list'
 * @param contentId - ID do template ou tier_list
 * @param enabled - Se false, não registra visualização (default: true)
 */
export function useViewTracking(
  contentType: 'template' | 'tier_list',
  contentId: string | null | undefined,
  enabled: boolean = true
) {
  const hasTracked = useRef(false)

  useEffect(() => {
    // Validações
    if (!enabled || !contentId || hasTracked.current) {
      return
    }

    // Marcar como rastreado para evitar múltiplas chamadas
    hasTracked.current = true

    // Obter ou criar session_id
    const sessionId = getOrCreateSessionId()

    // Registrar visualização (fire and forget)
    fetch('/api/views/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content_type: contentType,
        content_id: contentId,
        session_id: sessionId,
      }),
    })
      .then(response => {
        if (!response.ok) {
          console.error('Failed to register view:', response.statusText)
        }
        return response.json()
      })
      .then(data => {
        if (data.status === 'counted') {
          // Visualização contabilizada com sucesso
          // Opcional: pode atualizar UI ou fazer outras ações
        } else if (data.status === 'ignored') {
          // Visualização ignorada (dentro do intervalo de 30min)
          // Normal, não é erro
        }
      })
      .catch(error => {
        // Erro silencioso - não quebra a UX
        console.error('Error registering view:', error)
      })
  }, [contentType, contentId, enabled])
}

