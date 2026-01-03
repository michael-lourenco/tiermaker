'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Crown, Check, AlertCircle } from 'lucide-react'
import type { Subscription } from '@/types/subscription.types'
import { formatPrice } from '@/lib/stripe/prices'
import { useRouter } from 'next/navigation'

interface EnhancedSubscriptionStatusProps {
  className?: string
  showUpgradeButton?: boolean
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

export function EnhancedSubscriptionStatus({ className, showUpgradeButton = true }: EnhancedSubscriptionStatusProps) {
  const [data, setData] = useState<SubscriptionStatusData | null>(null)
  const [loading, setLoading] = useState(true)
  const [portalLoading, setPortalLoading] = useState(false)
  const router = useRouter()

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
      console.error('Error loading subscription status:', error)
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
      console.error('Error creating portal session:', error)
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
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2">
              Minha Assinatura
              {isPremium && (
                <Badge className="bg-primary text-primary-foreground">
                  <Crown className="h-3 w-3 mr-1" />
                  Premium
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              {isPremium 
                ? subscription 
                  ? `Plano Premium ${subscription.interval === 'month' ? 'Mensal' : 'Anual'} ativo`
                  : 'Plano Premium ativo'
                : 'Plano Básico - Upgrade para desbloquear todos os recursos'}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {subscription ? (
          <>
            {/* Status da Assinatura */}
            <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-muted-foreground">Status:</span>
                <Badge 
                  variant={subscription.status === 'active' ? 'default' : 'secondary'}
                  className="capitalize"
                >
                  {subscription.status === 'active' ? 'Ativa' : subscription.status}
                </Badge>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-muted-foreground">Valor:</span>
                <span className="text-sm font-semibold">
                  {formatPrice(subscription.amount, subscription.currency)}/
                  {subscription.interval === 'month' ? 'mês' : 'ano'}
                </span>
              </div>

              {subscription.current_period_end && (
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-muted-foreground">
                    {subscription.cancel_at_period_end ? 'Expira em:' : 'Próxima renovação:'}
                  </span>
                  <span className="text-sm">
                    {new Date(subscription.current_period_end).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </span>
                </div>
              )}

              {subscription.cancel_at_period_end && (
                <div className="flex items-start gap-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-md">
                  <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
                      Assinatura será cancelada
                    </p>
                    <p className="text-xs text-yellow-600/80 dark:text-yellow-400/80 mt-1">
                      Sua assinatura será cancelada ao final do período atual. Você continuará tendo acesso até{' '}
                      {new Date(subscription.current_period_end).toLocaleDateString('pt-BR')}.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Benefícios Premium */}
            {isPremium && (
              <div className="space-y-3">
                <h4 className="text-sm font-semibold flex items-center gap-2">
                  <Crown className="h-4 w-4 text-primary" />
                  Seus Benefícios Premium
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    'Tier lists ilimitadas',
                    'Tier lists privadas',
                    'Export sem marca d\'água',
                    'Export em 4K',
                    'Sem anúncios',
                    'Estatísticas detalhadas',
                  ].map((benefit) => (
                    <div key={benefit} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Botão de Gerenciar */}
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
          <>
            <div className="text-center py-4">
              <p className="text-muted-foreground mb-2">Você está no plano básico gratuito</p>
              <p className="text-sm text-muted-foreground mb-4">
                Faça upgrade para desbloquear todos os recursos premium
              </p>
              {showUpgradeButton && (
                <Button 
                  className="w-full" 
                  onClick={() => router.push('/pricing')}
                >
                  <Crown className="h-4 w-4 mr-2" />
                  Fazer Upgrade para Premium
                </Button>
              )}
            </div>

            {/* Benefícios do Premium (para não-assinantes) */}
            <div className="space-y-3 border-t pt-4">
              <h4 className="text-sm font-semibold">Com Premium você ganha:</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  'Tier lists ilimitadas',
                  'Tier lists privadas',
                  'Export sem marca d\'água',
                  'Export em 4K',
                  'Sem anúncios',
                  'Estatísticas detalhadas',
                ].map((benefit) => (
                  <div key={benefit} className="flex items-center gap-2 text-sm">
                    <Crown className="h-4 w-4 text-primary flex-shrink-0" />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Limites */}
        {limits.length > 0 && (
          <div className="border-t pt-4 space-y-3">
            <h4 className="text-sm font-semibold">Uso Atual</h4>
            {limits.map((limit) => {
              const isUnlimited = limit.max_count === -1
              const percentage = isUnlimited
                ? 0
                : Math.min(100, (limit.current_count / limit.max_count) * 100)

              return (
                <div key={limit.limit_type} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {limit.limit_type === 'tier_lists_count'
                        ? 'Tier Lists Salvas'
                        : 'Tier Lists Privadas'}
                    </span>
                    <span className="font-medium">
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
