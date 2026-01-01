'use client'

import { cn } from '@/lib/utils/cn'

interface AuthErrorMessageProps {
  message: string
  className?: string
}

/**
 * Componente para exibir mensagens de erro de autenticação
 * Com melhor contraste no modo dark
 */
export function AuthErrorMessage({ message, className }: AuthErrorMessageProps) {
  return (
    <div
      className={cn(
        'p-3 text-sm text-destructive rounded-md',
        'bg-destructive/10 dark:bg-destructive/20',
        'dark:border dark:border-destructive/50',
        className
      )}
    >
      {message}
    </div>
  )
}
