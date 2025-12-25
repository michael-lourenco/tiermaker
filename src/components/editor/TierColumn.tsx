'use client'

import { useState, useEffect, useRef } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
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

interface TierColumnProps {
  tier: TierListTier
  items: TemplateItem[]
  activeId: string | null
  onTierNameChange: (tierId: string, newName: string) => void
  onTierColorChange: (tierId: string, newColor: string) => void
  onTierDelete: (tierId: string) => void
  isDragging?: boolean
}

export function TierColumn({
  tier,
  items,
  activeId,
  onTierNameChange,
  onTierColorChange,
  onTierDelete,
  isDragging = false,
}: TierColumnProps) {
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

  const handleNameBlur = () => {
    if (tierName.trim() && tierName !== tier.tier_name) {
      onTierNameChange(tier.id, tierName.trim())
    } else if (!tierName.trim()) {
      setTierName(tier.tier_name)
    }
  }

  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-resize textarea on mount and when tierName changes
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [tierName])

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value
    setTierColor(newColor)
    onTierColorChange(tier.id, newColor)
  }

  const handleDeleteClick = () => {
    setShowDeleteDialog(true)
  }

  const handleConfirmDelete = () => {
    onTierDelete(tier.id)
    setShowDeleteDialog(false)
  }

  return (
    <div
      ref={setNodeRef}
      className={`flex border-2 rounded-lg transition-all ${
        isOver ? 'border-primary bg-primary/20 border-4' : 'border-border'
      } ${isDragging ? 'opacity-50' : ''}`}
      style={{
        backgroundColor: tier.color ? `${tier.color}15` : undefined,
        borderColor: tier.color || undefined,
        minHeight: '90px', // Half of previous height
      }}
    >
      {/* Tier Label Section - Left Side */}
      <div
        className="flex-shrink-0 w-48 flex items-center justify-center px-3 py-1 border-r-2"
        style={{
          borderColor: tier.color || undefined,
          backgroundColor: tier.color ? `${tier.color}30` : undefined,
        }}
      >
        {/* Tier Name Textarea - No border, looks like writing directly on tier */}
        <textarea
          ref={textareaRef}
          value={tierName}
          onChange={(e) => {
            setTierName(e.target.value)
            // Auto-resize on change
            const target = e.target as HTMLTextAreaElement
            target.style.height = 'auto'
            target.style.height = `${target.scrollHeight}px`
          }}
          onBlur={handleNameBlur}
          className="w-full font-bold text-xl md:text-2xl bg-transparent border-0 focus:outline-none resize-none overflow-hidden text-center"
          style={{ 
            color: tier.color || undefined,
            minHeight: '1.5rem',
            lineHeight: '1.2',
            wordWrap: 'break-word',
            overflowWrap: 'break-word',
          }}
          rows={1}
          placeholder="Tier"
        />
      </div>

      {/* Items Section - Middle */}
      <div className="flex-1 p-2 min-h-[88px]">
        <SortableContext
          items={items.map((item) => item.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 min-h-[84px]">
            {items.length > 0 ? (
              items.map((item) => (
                <ItemCard key={item.id} item={item} />
              ))
            ) : (
              <div className="col-span-full text-center text-muted-foreground py-2 flex items-center justify-center">
                <span className="text-xs">Arraste itens aqui</span>
              </div>
            )}
          </div>
        </SortableContext>
      </div>

      {/* Controls Section - Right Side */}
      <div
        className="flex-shrink-0 w-48 flex items-center justify-center gap-2 px-3 py-1 border-l-2"
        style={{
          borderColor: tier.color || undefined,
          backgroundColor: tier.color ? `${tier.color}30` : undefined,
        }}
      >
        <input
          type="color"
          value={tierColor}
          onChange={handleColorChange}
          className="w-8 h-8 rounded border cursor-pointer"
          title="Alterar cor do tier"
        />
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDeleteClick}
          className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
          title="Remover tier"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Remoção</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja remover o tier "{tier.tier_name}"? 
              {items.length > 0 && (
                <span className="block mt-2 text-destructive">
                  Todos os {items.length} item(ns) deste tier serão movidos para a área de não atribuídos.
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
            >
              Remover
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
