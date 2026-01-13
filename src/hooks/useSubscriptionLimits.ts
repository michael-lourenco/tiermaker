/**
 * useSubscriptionLimits Hook
 * Hook para verificar limites de assinatura
 */

import { useState, useEffect } from 'react'
import { useAuth } from './useAuth'
import type { SubscriptionLimitType } from '@/types/subscription.types'

interface LimitCheck {
  canPerform: boolean
  hasReached: boolean
  limit: {
    limit_type: string
    current_count: number
    max_count: number
  } | null
}

export function useSubscriptionLimits(limitType: SubscriptionLimitType) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [limitCheck, setLimitCheck] = useState<LimitCheck | null>(null)

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }

    checkLimit()
  }, [user, limitType])

  const checkLimit = async () => {
    if (!user) return

    try {
      const response = await fetch('/api/subscription/check-limit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ limitType }),
      })

      if (!response.ok) {
        throw new Error('Failed to check limit')
      }

      const data = await response.json()
      setLimitCheck(data)
    } catch (error) {
      // Em caso de erro, permitir ação (fail-open para não bloquear usuários)
      setLimitCheck({
        canPerform: true,
        hasReached: false,
        limit: null,
      })
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    canPerform: limitCheck?.canPerform ?? true,
    hasReached: limitCheck?.hasReached ?? false,
    limit: limitCheck?.limit ?? null,
    refetch: checkLimit,
  }
}
