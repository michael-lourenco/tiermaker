'use client'

import { useState } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable'
import { ItemCard } from './ItemCard'
import { Button } from '@/components/ui/button'
import { Pin, PinOff } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import type { TemplateItem } from '@/types/template.types'
import { useTranslation } from '@/hooks/useTranslation'

interface UnassignedDropZoneProps {
  items: TemplateItem[]
}

export function UnassignedDropZone({ items }: UnassignedDropZoneProps) {
  const { t } = useTranslation()
  const [isPinned, setIsPinned] = useState(false)
  const { setNodeRef, isOver } = useDroppable({
    id: 'unassigned',
  })

  const togglePin = () => {
    setIsPinned((prev) => !prev)
  }

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'border-2 border-dashed rounded-lg p-2 sm:p-4 transition-colors bg-background shadow-lg touch-manipulation relative',
        !isPinned && 'sticky z-10',
        isOver ? 'border-primary bg-primary/20 border-4' : 'border-border'
      )}
      style={{ 
        maxHeight: '40vh',
        minHeight: '140px', // Altura mínima reduzida para mobile
        bottom: isPinned ? 'auto' : '20px', // Quando desafixado, fica na parte inferior mas com espaço para ver imagens
      }}
    >
      {/* Botão de fixar/desafixar - sempre no topo à direita do bloco */}
      <div className="absolute top-2 right-2 z-30">
        <Button
          variant="outline"
          size="sm"
          onClick={togglePin}
          className="gap-2 touch-manipulation bg-background/95 backdrop-blur-sm"
          title={isPinned ? t('editor.unpinUnassigned') : t('editor.pinUnassigned')}
        >
          {isPinned ? (
            <>
              <PinOff className="h-4 w-4" />
              <span className="hidden sm:inline">{t('editor.unpin')}</span>
            </>
          ) : (
            <>
              <Pin className="h-4 w-4" />
              <span className="hidden sm:inline">{t('editor.pin')}</span>
            </>
          )}
        </Button>
      </div>
        {items.length > 0 ? (
          <SortableContext
            items={items.map((item) => item.id)}
            strategy={rectSortingStrategy}
          >
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-4 overflow-y-auto" style={{ maxHeight: 'calc(40vh - 2rem)' }}>
              {items.map((item) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          </SortableContext>
        ) : (
          <div className="flex items-center justify-center min-h-[140px] sm:min-h-[180px] text-muted-foreground px-4">
            <p className="text-xs sm:text-sm text-center">Arraste itens aqui para removê-los dos tiers</p>
          </div>
        )}
    </div>
  )
}


