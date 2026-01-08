'use client'

import { useState, useEffect, useRef, useMemo, memo, useCallback } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable'
import { ItemCard } from './ItemCard'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Trash2 } from 'lucide-react'
import type { TemplateItem } from '@/types/template.types'
import type { TierListTier } from '@/types/tierList.types'
import { useTranslation } from '@/hooks/useTranslation'

interface TierColumnProps {
  tier: TierListTier
  items: TemplateItem[]
  activeId: string | null
  showItemName?: boolean
  onTierNameChange: (tierId: string, newName: string) => void
  onTierColorChange: (tierId: string, newColor: string) => void
  onTierDelete: (tierId: string) => void
  isDragging?: boolean
}

// Componente memoizado para evitar re-renders desnecessários
export const TierColumn = memo(function TierColumn({
  tier,
  items,
  activeId,
  showItemName = false,
  onTierNameChange,
  onTierColorChange,
  onTierDelete,
  isDragging = false,
}: TierColumnProps) {
  const { t } = useTranslation()
  const { setNodeRef, isOver } = useDroppable({
    id: tier.id, // Use tier.id instead of tier_name to avoid issues when name changes
  })

  const [tierName, setTierName] = useState(tier.tier_name)
  const [tierColor, setTierColor] = useState(tier.color || '#FF6B6B')
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const prevTierRef = useRef({ tier_name: tier.tier_name, color: tier.color })

  // Sync state when tier changes externally (only update if prop actually changed)
  useEffect(() => {
    const prevTier = prevTierRef.current
    if (tier.tier_name !== prevTier.tier_name) {
      setTierName(tier.tier_name)
      prevTier.tier_name = tier.tier_name
    }
    const newColor = tier.color || '#FF6B6B'
    if (newColor !== prevTier.color) {
      setTierColor(newColor)
      prevTier.color = tier.color
    }
  }, [tier.tier_name, tier.color])

  const handleNameBlur = useCallback(() => {
    if (tierName.trim() && tierName !== tier.tier_name) {
      onTierNameChange(tier.id, tierName.trim())
    } else if (!tierName.trim()) {
      setTierName(tier.tier_name)
    }
  }, [tierName, tier.tier_name, tier.id, onTierNameChange])

  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-resize textarea on mount and when tierName changes
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [tierName])

  const handleColorChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value
    setTierColor(newColor)
    onTierColorChange(tier.id, newColor)
  }, [tier.id, onTierColorChange])

  const handleDeleteClick = useCallback(() => {
    setShowDeleteDialog(true)
  }, [])

  const handleConfirmDelete = useCallback(() => {
    onTierDelete(tier.id)
    setShowDeleteDialog(false)
  }, [tier.id, onTierDelete])

  // Memoiza os IDs dos items para o SortableContext
  const itemIds = useMemo(() => items.map((item) => item.id), [items])

  // Memoiza o style do container
  const containerStyle = useMemo(() => ({
    backgroundColor: tier.color ? `${tier.color}15` : undefined,
    borderColor: tier.color || undefined,
    minHeight: '60px', // Menor no mobile
    // Removido touchAction: 'none' para permitir scroll durante drag
    ...(isDragging && { cursor: 'grabbing' }),
  }), [tier.color, isDragging])

  // Memoiza o style da label section
  const labelStyle = useMemo(() => ({
    borderColor: tier.color || undefined,
    backgroundColor: tier.color ? `${tier.color}30` : undefined,
  }), [tier.color])

  // Memoiza o style do textarea
  const textareaStyle = useMemo(() => ({
    color: tier.color || undefined,
    minHeight: '1.25rem',
    lineHeight: '1.2',
    wordWrap: 'break-word' as const,
    overflowWrap: 'break-word' as const,
  }), [tier.color])

  const handleTextareaChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTierName(e.target.value)
    // Auto-resize on change
    const target = e.target as HTMLTextAreaElement
    target.style.height = 'auto'
    target.style.height = `${target.scrollHeight}px`
  }, [])

  return (
    <div
      ref={setNodeRef}
      className={`flex border-2 rounded-lg transition-all touch-manipulation ${
        isOver ? 'border-primary bg-primary/20 border-4' : 'border-border'
      } ${isDragging ? 'opacity-50 cursor-grabbing' : ''}`}
      style={containerStyle}
    >
      {/* Tier Label Section - Left Side */}
      <div
        className="flex-shrink-0 w-16 sm:w-24 md:w-32 lg:w-48 flex items-center justify-center px-1 sm:px-2 md:px-3 py-1 border-r-2"
        style={labelStyle}
      >
        {/* Tier Name Textarea - No border, looks like writing directly on tier */}
        <textarea
          ref={textareaRef}
          value={tierName}
          onChange={handleTextareaChange}
          onBlur={handleNameBlur}
          className="w-full font-bold text-xs sm:text-sm md:text-base lg:text-xl xl:text-2xl bg-transparent border-0 focus:outline-none resize-none overflow-hidden text-center"
          style={textareaStyle}
          rows={1}
          placeholder="Tier"
        />
      </div>

      {/* Items Section - Middle */}
      <div className="flex-1 p-0.5 sm:p-1 md:p-1.5 lg:p-2 min-h-[60px] sm:min-h-[70px] md:min-h-[88px]">
        <SortableContext
          items={itemIds}
          strategy={rectSortingStrategy}
        >
          {items.length > 0 ? (
            <div className="flex flex-wrap gap-1 sm:gap-1.5 md:gap-2 min-h-[60px] sm:min-h-[70px] md:min-h-[84px]">
              {items.map((item) => (
                <ItemCard key={item.id} item={item} showItemName={showItemName} />
              ))}
            </div>
          ) : (
            <div className="w-full text-center text-muted-foreground py-1 sm:py-2 flex items-center justify-center min-h-[60px] sm:min-h-[70px] md:min-h-[84px]">
              <span className="text-[10px] sm:text-xs">{t('editor.dragItemsHere')}</span>
            </div>
          )}
        </SortableContext>
      </div>

      {/* Controls Section - Right Side */}
      <div
        className="flex-shrink-0 w-16 sm:w-20 md:w-24 lg:w-48 flex items-center justify-center gap-1 sm:gap-2 px-1 sm:px-2 md:px-3 py-1 border-l-2"
        style={labelStyle}
      >
        <input
          type="color"
          value={tierColor}
          onChange={handleColorChange}
          className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 rounded border cursor-pointer touch-manipulation"
          title={t('editor.changeTierColor')}
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleDeleteClick}
          className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10 touch-manipulation"
          title={t('editor.removeTier')}
        >
          <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
        </Button>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('editor.confirmDelete')}</DialogTitle>
            <DialogDescription>
              {t('editor.confirmDeleteMessage', { tierName: tier.tier_name })}
              {items.length > 0 && (
                <span className="block mt-2 text-destructive">
                  {t('editor.itemsWillBeMoved', { count: items.length })}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              {t('common.cancel')}
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleConfirmDelete}
            >
              {t('editor.remove')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}, (prevProps, nextProps) => {
  // Comparação customizada para memo
  if (prevProps.tier.id !== nextProps.tier.id) return false
  if (prevProps.tier.tier_name !== nextProps.tier.tier_name) return false
  if (prevProps.tier.color !== nextProps.tier.color) return false
  if (prevProps.activeId !== nextProps.activeId) return false
  if (prevProps.isDragging !== nextProps.isDragging) return false
  if (prevProps.showItemName !== nextProps.showItemName) return false
  
  // Compara items por IDs
  if (prevProps.items.length !== nextProps.items.length) return false
  const prevIds = prevProps.items.map(item => item.id).join(',')
  const nextIds = nextProps.items.map(item => item.id).join(',')
  if (prevIds !== nextIds) return false
  
  return true
})
