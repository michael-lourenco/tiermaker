'use client'

import { useState, useMemo, memo, useCallback } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable'
import { ItemCard } from './ItemCard'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Pin, PinOff } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import type { TemplateItem } from '@/types/template.types'
import { useTranslation } from '@/hooks/useTranslation'

interface UnassignedDropZoneProps {
  items: TemplateItem[]
  showItemName?: boolean
  onShowItemNameChange?: (show: boolean) => void
}

// Componente memoizado
export const UnassignedDropZone = memo(function UnassignedDropZone({ 
  items, 
  showItemName = false, 
  onShowItemNameChange 
}: UnassignedDropZoneProps) {
  const { t } = useTranslation()
  const [isPinned, setIsPinned] = useState(false)
  const { setNodeRef, isOver } = useDroppable({
    id: 'unassigned',
  })

  const togglePin = useCallback(() => {
    setIsPinned((prev) => !prev)
  }, [])

  // Memoiza os IDs dos items para o SortableContext
  const itemIds = useMemo(() => items.map((item) => item.id), [items])

  // Estilo do container memoizado
  const containerStyle = useMemo(() => ({
    maxHeight: isPinned ? '50vh' : '35vh',
    minHeight: '120px',
    bottom: isPinned ? 'auto' : '10px',
  }), [isPinned])

  // Altura máxima do container de itens memoizada
  const itemsContainerMaxHeight = useMemo(() => 
    isPinned ? 'calc(50vh - 2rem)' : 'calc(35vh - 2rem)',
    [isPinned]
  )

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'border-2 border-dashed rounded-lg p-2 sm:p-4 transition-colors bg-background shadow-lg touch-manipulation relative',
        !isPinned && 'sticky z-10',
        isOver ? 'border-primary bg-primary/20 border-4' : 'border-border'
      )}
      style={containerStyle}
    >
      {/* Botão de fixar/desafixar e switch de nomes - sempre no topo à direita do bloco */}
      <div className="absolute top-2 right-2 z-30 flex flex-col gap-2 items-end">
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
        {onShowItemNameChange && (
          <div className="flex items-center gap-2 bg-background/95 backdrop-blur-sm px-2 py-1 rounded border border-border">
            <Label htmlFor="show-item-names" className="text-xs cursor-pointer">
              {t('editor.showItemNames')}
            </Label>
            <Switch
              id="show-item-names"
              checked={showItemName}
              onCheckedChange={onShowItemNameChange}
            />
          </div>
        )}
      </div>
      {items.length > 0 ? (
        <SortableContext
          items={itemIds}
          strategy={rectSortingStrategy}
        >
          {/* Renderização otimizada - memoização garante que apenas items que mudaram re-renderizem */}
          <div
            className="flex flex-wrap gap-1.5 sm:gap-2 md:gap-4 overflow-y-auto"
            style={{ maxHeight: itemsContainerMaxHeight }}
          >
            {items.map((item) => (
              <ItemCard key={item.id} item={item} showItemName={showItemName} />
            ))}
          </div>
        </SortableContext>
      ) : (
        <div className="flex items-center justify-center min-h-[140px] sm:min-h-[180px] text-muted-foreground px-4">
          <p className="text-xs sm:text-sm text-center">{t('editor.dragItemsHere')}</p>
        </div>
      )}
    </div>
  )
}, (prevProps, nextProps) => {
  // Comparação customizada para memo
  if (prevProps.items.length !== nextProps.items.length) return false
  if (prevProps.showItemName !== nextProps.showItemName) return false
  
  // Compara items por IDs
  const prevIds = prevProps.items.map(item => item.id).join(',')
  const nextIds = nextProps.items.map(item => item.id).join(',')
  if (prevIds !== nextIds) return false
  
  return true
})


