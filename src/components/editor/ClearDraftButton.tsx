'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { RotateCcw } from 'lucide-react'

interface ClearDraftButtonProps {
  onClear: () => void
  lastModified?: number
}

export function ClearDraftButton({ onClear, lastModified }: ClearDraftButtonProps) {
  const [showDialog, setShowDialog] = useState(false)

  const formatLastModified = (timestamp: number) => {
    const now = Date.now()
    const diff = now - timestamp
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) {
      return `${days} ${days === 1 ? 'dia' : 'dias'} atrás`
    }
    if (hours > 0) {
      return `${hours} ${hours === 1 ? 'hora' : 'horas'} atrás`
    }
    if (minutes > 0) {
      return `${minutes} ${minutes === 1 ? 'minuto' : 'minutos'} atrás`
    }
    return 'agora mesmo'
  }

  const handleConfirm = () => {
    onClear()
    setShowDialog(false)
  }

  const tooltipText = lastModified
    ? `Reiniciar a tier list e descartar todas as alterações. Última alteração: ${formatLastModified(lastModified)}`
    : 'Reiniciar a tier list e descartar todas as alterações'

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            onClick={() => setShowDialog(true)}
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
            size="sm"
          >
            <RotateCcw className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
            Reiniciar
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltipText}</p>
        </TooltipContent>
      </Tooltip>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Limpar Rascunho</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja descartar todas as alterações e voltar do início?
              <br />
              <br />
              Esta ação não pode ser desfeita e todas as alterações não salvas serão perdidas.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleConfirm}>
              Sim, Limpar Tudo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
