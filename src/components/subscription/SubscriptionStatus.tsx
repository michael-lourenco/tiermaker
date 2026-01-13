'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Crown, Check, X } from 'lucide-react'
import type { Subscription } from '@/types/subscription.types'
import { formatPrice } from '@/lib/stripe/prices'

interface SubscriptionStatusProps {
  className?: string
}

interface SubscriptionStatusData {
  subscription: Subscription | null
  isPremium: boolean
  limits: Array<{
    limit_type: string
    current_count: number
    max_count: number
  }>
}

export function SubscriptionStatus({ className }: SubscriptionStatusProps) {
  const [data, setData] = useState<SubscriptionStatusData | null>(null)
  const [loading, setLoading] = useState(true)
  const [portalLoading, setPortalLoading] = useState(false)

  useEffect(() => {
    loadSubscriptionStatus()
  }, [])

  const loadSubscriptionStatus = async () => {
    try {
      const response = await fetch('/api/stripe/subscription-status')
      if (!response.ok) throw new Error('Failed to fetch subscription status')
      const statusData = await response.json()
      setData(statusData)
    } catch (error) {
      // Erro ao carregar status da assinatura - silencioso
    } finally {
      setLoading(false)
    }
  }

  const handleManageSubscription = async () => {
    setPortalLoading(true)
    try {
      const response = await fetch('/api/stripe/create-portal', {
        method: 'POST',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create portal session')
      }

      const { url } = await response.json()
      if (url) {
        window.location.href = url
      }
    } catch (error: any) {
      alert(error.message || 'Erro ao abrir portal de assinatura')
      setPortalLoading(false)
    }
  }

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Assinatura</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Carregando...</p>
        </CardContent>
      </Card>
    )
  }

  if (!data) {
    return null
  }

  const { subscription, isPremium, limits } = data

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              Assinatura
              {isPremium && (
                <Badge className="bg-primary text-primary-foreground">
                  <Crown className="h-3 w-3 mr-1" />
                  Premium
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              {isPremium ? 'Plano Premium ativo' : 'Plano Básico'}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {subscription ? (
          <>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Status:</span>
                <span className="capitalize">{subscription.status}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Valor:</span>
                <span>
                  {formatPrice(subscription.amount, subscription.currency)}/{subscription.interval === 'month' ? 'mês' : 'ano'}
                </span>
              </div>
              {subscription.current_period_end && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {subscription.cancel_at_period_end ? 'Expira em:' : 'Renova em:'}
                  </span>
                  <span>
                    {new Date(subscription.current_period_end).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              )}
            </div>

            {subscription.status === 'active' && (
              <Button
                variant="outline"
                className="w-full"
                onClick={handleManageSubscription}
                disabled={portalLoading}
              >
                {portalLoading ? 'Carregando...' : 'Gerenciar Assinatura'}
              </Button>
            )}
          </>
        ) : (
          <div className="text-center py-4">
            <p className="text-muted-foreground mb-4">Você está no plano básico</p>
            <Button className="w-full" onClick={() => window.location.href = '/pricing'}>
              <Crown className="h-4 w-4 mr-2" />
              Fazer Upgrade
            </Button>
          </div>
        )}

        {/* Limites */}
        {limits.length > 0 && (
          <div className="border-t pt-4 space-y-2">
            <h4 className="text-sm font-semibold">Seus Limites</h4>
            {limits.map((limit) => {
              const isUnlimited = limit.max_count === -1
              const percentage = isUnlimited
                ? 0
                : Math.min(100, (limit.current_count / limit.max_count) * 100)

              return (
                <div key={limit.limit_type} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">
                      {limit.limit_type === 'tier_lists_count'
                        ? 'Tier Lists Salvas'
                        : 'Tier Lists Privadas'}
                    </span>
                    <span>
                      {isUnlimited
                        ? 'Ilimitado'
                        : `${limit.current_count} / ${limit.max_count}`}
                    </span>
                  </div>
                  {!isUnlimited && (
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
