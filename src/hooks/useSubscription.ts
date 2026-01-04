/**
 * useSubscription Hook
 * Hook para acessar informações de assinatura do usuário
 * Agora usa o contexto compartilhado para evitar múltiplas chamadas
 */

import { useSubscriptionContext } from '@/contexts/SubscriptionContext'

export function useSubscription() {
  return useSubscriptionContext()
}
