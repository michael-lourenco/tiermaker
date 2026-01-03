/**
 * useSubscription Hook
 * Hook para acessar informações de assinatura do usuário
 */

import { useState, useEffect } from 'react'
import { useAuth } from './useAuth'
import type { Subscription } from '@/types/subscription.types'

interface SubscriptionStatusData {
  subscription: Subscription | null
  isPremium: boolean
  limits: Array<{
    limit_type: string
    current_count: number
    max_count: number
  }>
}

export function useSubscription() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<SubscriptionStatusData | null>(null)

  useEffect(() => {
    if (!user) {
      setLoading(false)
      setData(null)
      return
    }

    loadSubscriptionStatus()
  }, [user])

  const loadSubscriptionStatus = async () => {
    if (!user) return

    try {
      const response = await fetch('/api/stripe/subscription-status')
      if (!response.ok) throw new Error('Failed to fetch subscription status')
      const statusData = await response.json()
      setData(statusData)
    } catch (error) {
      console.error('Error loading subscription status:', error)
      // Em caso de erro, assumir plano básico
      setData({
        subscription: null,
        isPremium: false,
        limits: [],
      })
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    subscription: data?.subscription ?? null,
    isPremium: data?.isPremium ?? false,
    limits: data?.limits ?? [],
    refetch: loadSubscriptionStatus,
  }
}
