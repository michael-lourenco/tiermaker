'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, X, Crown } from 'lucide-react'
import { formatPrice, PRICE_VALUES } from '@/lib/stripe/prices'
import type { SubscriptionInterval } from '@/types/subscription.types'
import { useSubscription } from '@/hooks/useSubscription'
import { useRouter } from 'next/navigation'

const BASIC_FEATURES = [
  { text: '3 templates criados', included: true },
  { text: '5 tier lists salvas', included: true },
  { text: 'Tier lists públicas ilimitadas', included: true },
  { text: 'Tier lists privadas', included: false },
  { text: 'Export com marca d\'água', included: true },
  { text: 'Export em resolução padrão (1080p)', included: true },
  { text: 'Export em alta resolução (4K)', included: false },
  { text: 'Estatísticas básicas', included: true },
  { text: 'Estatísticas detalhadas', included: false },
  { text: 'Anúncios', included: true },
  { text: 'Organização por pastas', included: false },
]

const PREMIUM_FEATURES = [
  { text: 'Templates criados ilimitados', included: true },
  { text: 'Tier lists salvas ilimitadas', included: true },
  { text: 'Tier lists públicas ilimitadas', included: true },
  { text: 'Tier lists privadas ilimitadas', included: true },
  { text: 'Export sem marca d\'água', included: true },
  { text: 'Export em resolução padrão (1080p)', included: true },
  { text: 'Export em alta resolução (4K)', included: true },
  { text: 'Estatísticas básicas', included: true },
  { text: 'Estatísticas detalhadas', included: true },
  { text: 'Sem anúncios', included: true },
  { text: 'Organização por pastas', included: true },
]

export function PricingPageClient() {
  const [loading, setLoading] = useState<string | null>(null)
  const router = useRouter()
  const { isPremium, loading: subscriptionLoading } = useSubscription()

  const handleSubscribe = async (interval: SubscriptionInterval) => {
    setLoading(interval)
    try {
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ interval }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create checkout session')
      }

      const { url } = await response.json()
      if (url) {
        window.location.href = url
      }
    } catch (error: any) {
      alert(error.message || 'Erro ao criar sessão de checkout')
      setLoading(null)
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
      {/* Plano Básico */}
      <Card className="flex flex-col">
        <CardHeader>
          <CardTitle className="text-2xl">Básico</CardTitle>
          <CardDescription>Perfeito para começar</CardDescription>
          <div className="mt-4">
            <div className="text-4xl font-bold">Grátis</div>
            <div className="text-sm text-muted-foreground">Para sempre</div>
          </div>
        </CardHeader>
        <CardContent className="flex-1">
          <ul className="space-y-3">
            {BASIC_FEATURES.map((feature, index) => (
              <li key={index} className="flex items-start gap-3">
                {feature.included ? (
                  <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                ) : (
                  <X className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                )}
                <span className={feature.included ? '' : 'text-muted-foreground'}>
                  {feature.text}
                </span>
              </li>
            ))}
          </ul>
        </CardContent>
        <CardFooter>
          {isPremium ? (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => router.push('/account/subscription')}
            >
              Gerenciar Assinatura
            </Button>
          ) : (
            <Button
              variant="outline"
              className="w-full"
              disabled
            >
              Plano Atual
            </Button>
          )}
        </CardFooter>
      </Card>

      {/* Plano Premium */}
      <Card className="flex flex-col border-primary relative">
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge className="bg-primary text-primary-foreground">Popular</Badge>
        </div>
        <CardHeader>
          <CardTitle className="text-2xl">Premium</CardTitle>
          <CardDescription>Acesso completo a todos os recursos</CardDescription>
          <div className="mt-4">
            <div className="text-4xl font-bold">
              {formatPrice(PRICE_VALUES.premiumMonthly)}
            </div>
            <div className="text-sm text-muted-foreground">por mês</div>
            <div className="text-sm text-muted-foreground mt-1">
              ou {formatPrice(PRICE_VALUES.premiumYearly)}/ano (economize 33%)
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1">
          <ul className="space-y-3">
            {PREMIUM_FEATURES.map((feature, index) => (
              <li key={index} className="flex items-start gap-3">
                {feature.included ? (
                  <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                ) : (
                  <X className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                )}
                <span className={feature.included ? '' : 'text-muted-foreground'}>
                  {feature.text}
                </span>
              </li>
            ))}
          </ul>
        </CardContent>
        <CardFooter className="flex-col gap-2">
          {isPremium ? (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => router.push('/account/subscription')}
            >
              <Crown className="h-4 w-4 mr-2" />
              Gerenciar Assinatura Premium
            </Button>
          ) : (
            <>
              <Button
                className="w-full"
                onClick={() => handleSubscribe('month')}
                disabled={loading !== null || subscriptionLoading}
              >
                {loading === 'month' ? 'Carregando...' : 'Assinar Mensal'}
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => handleSubscribe('year')}
                disabled={loading !== null || subscriptionLoading}
              >
                {loading === 'year' ? 'Carregando...' : 'Assinar Anual'}
              </Button>
            </>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
