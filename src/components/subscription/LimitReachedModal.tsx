'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { SubscriptionButton } from './SubscriptionButton'
import { Crown, X } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface LimitReachedModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  limitType: 'tier_lists_count' | 'private_tier_lists_count' | 'templates_count'
  currentCount: number
  maxCount: number
}

export function LimitReachedModal({
  open,
  onOpenChange,
  limitType,
  currentCount,
  maxCount,
}: LimitReachedModalProps) {
  const router = useRouter()

  const limitTypeLabel =
    limitType === 'tier_lists_count'
      ? 'tier lists salvas'
      : 'tier lists privadas'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <X className="h-5 w-5 text-destructive" />
            Limite Atingido
          </DialogTitle>
          <DialogDescription>
            Você atingiu o limite de {maxCount} {limitTypeLabel} no plano básico.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <p className="text-sm text-muted-foreground mb-4">
            Você está usando {currentCount} de {maxCount} {limitTypeLabel} disponíveis.
          </p>

          <div className="bg-muted p-4 rounded-lg space-y-3">
            <h4 className="font-semibold flex items-center gap-2">
              <Crown className="h-4 w-4 text-primary" />
              Com Premium você ganha:
            </h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">✓</span>
                <span>
                  {limitType === 'tier_lists_count' 
                    ? 'Tier lists salvas ilimitadas' 
                    : limitType === 'private_tier_lists_count'
                    ? 'Tier lists privadas ilimitadas'
                    : 'Templates criados ilimitados'}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">✓</span>
                <span>Export sem marca d&apos;água</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">✓</span>
                <span>Export em alta resolução (4K)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">✓</span>
                <span>Sem anúncios</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">✓</span>
                <span>Estatísticas detalhadas</span>
              </li>
            </ul>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
          <SubscriptionButton className="w-full sm:w-auto" />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
