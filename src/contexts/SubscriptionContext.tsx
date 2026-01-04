'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useAuth } from '@/hooks/useAuth'
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

interface SubscriptionContextType {
  loading: boolean
  subscription: Subscription | null
  isPremium: boolean
  limits: Array<{
    limit_type: string
    current_count: number
    max_count: number
  }>
  refetch: () => Promise<void>
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined)

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<SubscriptionStatusData | null>(null)

  const loadSubscriptionStatus = async () => {
    if (!user) {
      setLoading(false)
      setData({
        subscription: null,
        isPremium: false,
        limits: [],
      })
      return
    }

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

  useEffect(() => {
    loadSubscriptionStatus()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const value: SubscriptionContextType = {
    loading,
    subscription: data?.subscription ?? null,
    isPremium: data?.isPremium ?? false,
    limits: data?.limits ?? [],
    refetch: loadSubscriptionStatus,
  }

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  )
}

export function useSubscriptionContext() {
  const context = useContext(SubscriptionContext)
  if (context === undefined) {
    throw new Error('useSubscriptionContext must be used within a SubscriptionProvider')
  }
  return context
}
