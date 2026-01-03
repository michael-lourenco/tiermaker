'use client'

import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils/cn'

interface SuccessMessageProps {
  className?: string
}

export function SuccessMessage({ className }: SuccessMessageProps) {
  const [visible, setVisible] = useState(true)

  // Auto-hide após 5 segundos
  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false)
    }, 5000)

    return () => clearTimeout(timer)
  }, [])

  if (!visible) return null

  return (
    <Card className={cn('border-green-500/50 bg-green-500/10', className)}>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
          <div>
            <p className="font-semibold text-green-700 dark:text-green-300">
              Assinatura ativada com sucesso! 🎉
            </p>
            <p className="text-sm text-green-600 dark:text-green-400 mt-1">
              Você agora tem acesso a todos os recursos premium.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
