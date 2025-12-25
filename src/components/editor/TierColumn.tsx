'use client'

import { useState, useEffect, useRef } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { ItemCard } from './ItemCard'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
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

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value
    setTierColor(newColor)
    onTierColorChange(tier.id, newColor)
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
      }}
    >
      {/* Tier Label Section - Left Side */}
      <div
        className="flex-shrink-0 w-24 md:w-32 flex flex-col items-center justify-center p-4 border-r-2"
        style={{
          borderColor: tier.color || undefined,
          backgroundColor: tier.color ? `${tier.color}30` : undefined,
        }}
      >
        <div className="flex flex-col items-center gap-2 w-full">
          <Input
            type="text"
            value={tierName}
            onChange={(e) => setTierName(e.target.value)}
            onBlur={handleNameBlur}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.currentTarget.blur()
              }
            }}
            className="text-center font-bold text-lg md:text-xl w-full bg-transparent border-2 focus:border-primary"
            style={{ color: tier.color || undefined }}
            maxLength={10}
          />
          <div className="flex items-center gap-2">
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
              onClick={() => onTierDelete(tier.id)}
              className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
              title="Remover tier"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Items Section - Right Side */}
      <div className="flex-1 p-4 min-h-[150px]">
        <SortableContext
          items={items.map((item) => item.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 min-h-[120px]">
            {items.length > 0 ? (
              items.map((item) => (
                <ItemCard key={item.id} item={item} />
              ))
            ) : (
              <div className="col-span-full text-center text-muted-foreground py-8 flex items-center justify-center">
                <span className="text-sm">Arraste itens aqui</span>
              </div>
            )}
          </div>
        </SortableContext>
      </div>
    </div>
  )
}
