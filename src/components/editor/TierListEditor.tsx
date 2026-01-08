'use client'

import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  DragOverlay,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { TierRow } from './TierRow'
import { UnassignedDropZone } from './UnassignedDropZone'
import { ItemCard } from './ItemCard'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { DEFAULT_TIERS, TIER_COLORS } from '@/lib/constants/tiers'
import type { TemplateItem } from '@/types/template.types'
import type { TierListTier, TierListItem } from '@/types/tierList.types'
import { v4 as uuidv4 } from 'uuid'
import { useTranslation } from '@/hooks/useTranslation'
import { useDebounce } from '@/hooks/useDebounce'

interface TierListEditorProps {
  templateItems: TemplateItem[]
  initialTiers?: TierListTier[]
  initialItems?: (TierListItem & { template_item: TemplateItem })[]
  showItemNames?: boolean
  onShowItemNamesChange?: (show: boolean) => void
  onSave?: (data: {
    tiers: Array<{ tier_name: string; tier_order: number; color: string | null }>
    items: Array<{ template_item_id: string; tier_name: string; order: number }>
  }) => void
}

export function TierListEditor({
  templateItems,
  initialTiers,
  initialItems,
  showItemNames = false,
  onShowItemNamesChange,
  onSave,
}: TierListEditorProps) {
  const { t } = useTranslation()
  const [tiers, setTiers] = useState<TierListTier[]>(
    initialTiers ||
      DEFAULT_TIERS.map((name, index) => ({
        id: `tier-${name}-${uuidv4()}`,
        tier_list_id: '',
        tier_name: name,
        tier_order: index,
        color: TIER_COLORS[name] || null,
        created_at: '',
      }))
  )

  const [items, setItems] = useState<
    Map<string, { template_item: TemplateItem; tier_name: string; order: number }>
  >(new Map())

  const [activeId, setActiveId] = useState<string | null>(null)
  const [draggingTierId, setDraggingTierId] = useState<string | null>(null)
  const lastDragOverRef = useRef<{ activeId: string; overId: string; tierName?: string; order?: number } | null>(null)

  // Initialize items from initialItems or templateItems
  useEffect(() => {
    if (initialItems && initialItems.length > 0) {
      const itemsMap = new Map<
        string,
        { template_item: TemplateItem; tier_name: string; order: number }
      >()
      initialItems.forEach((item) => {
        itemsMap.set(item.template_item_id, {
          template_item: item.template_item,
          tier_name: item.tier_name,
          order: item.order,
        })
      })
      setItems(itemsMap)
    } else {
      // Initialize with all template items in "unassigned"
      const itemsMap = new Map<
        string,
        { template_item: TemplateItem; tier_name: string; order: number }
      >()
      templateItems.forEach((item, index) => {
        itemsMap.set(item.id, {
          template_item: item,
          tier_name: '',
          order: index,
        })
      })
      setItems(itemsMap)
    }
  }, [templateItems, initialItems])

  // Configuração de sensors para mobile e desktop
  // Usa apenas tolerance (distância) sem delay para evitar "engasgo"
  // No mobile, tolerance maior ajuda a distinguir drag de scroll
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Distância mínima de 5px antes de iniciar drag (sem delay)
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        distance: 8, // Distância maior para touch ajuda a evitar conflito com scroll
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Memoiza funções auxiliares para evitar recriar
  const getNextOrderForTier = useCallback((tierName: string): number => {
    const tierItems = Array.from(items.values()).filter(
      (item) => item.tier_name === tierName
    )
    return tierItems.length
  }, [items])

  const getItemsForTier = useCallback((tierName: string): TemplateItem[] => {
    return Array.from(items.entries())
      .filter(([_, item]) => item.tier_name === tierName)
      .sort(([_, a], [__, b]) => a.order - b.order)
      .map(([id]) => items.get(id)!.template_item)
  }, [items])

  const getUnassignedItems = useCallback((): TemplateItem[] => {
    return Array.from(items.entries())
      .filter(([_, item]) => !item.tier_name || item.tier_name === '')
      .sort(([_, a], [__, b]) => a.order - b.order)
      .map(([id]) => items.get(id)!.template_item)
  }, [items])

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string)
    lastDragOverRef.current = null // Reset drag over tracking
    
    // Adicionar classe ao body para cursor grabbing em qualquer drag
    document.body.classList.add('dragging-item')
    
    // Check if we're dragging a tier
    const tier = tiers.find((t) => t.id === event.active.id)
    if (tier) {
      setDraggingTierId(tier.id)
      document.body.classList.add('dragging-tier')
    }
    
    // Prevenir scroll durante drag no mobile
    // Salvar scroll position antes de fixar
    const scrollY = window.scrollY
    const viewportHeight = window.innerHeight
    
    // Encontrar elementos importantes para garantir visibilidade
    const titleElement = document.getElementById('tier-list-title')
    const firstTierElement = tiers.length > 0 
      ? document.querySelector(`[data-tier-id="${tiers[0].id}"]`) as HTMLElement
      : null
    
    // Calcular a posição mínima necessária para manter conteúdo visível
    let minVisibleTop = 0
    
    if (titleElement) {
      const titleRect = titleElement.getBoundingClientRect()
      const titleTop = scrollY + titleRect.top
      // Se o título está acima da viewport, ajustar para mantê-lo visível
      if (titleRect.top < 0) {
        minVisibleTop = Math.max(minVisibleTop, titleTop - 20) // 20px de padding
      }
    }
    
    if (firstTierElement) {
      const tierRect = firstTierElement.getBoundingClientRect()
      const tierTop = scrollY + tierRect.top
      // Se a primeira tier está acima da viewport, ajustar para mantê-la visível
      if (tierRect.top < 0) {
        minVisibleTop = Math.max(minVisibleTop, tierTop - 20) // 20px de padding
      }
    }
    
    // Calcular o top ajustado
    // Se minVisibleTop > 0, significa que precisamos ajustar para mostrar conteúdo
    const adjustedScrollY = minVisibleTop > 0 ? minVisibleTop : scrollY
    
    // Fixar body com posição ajustada
    document.body.style.position = 'fixed'
    document.body.style.top = `-${adjustedScrollY}px`
    document.body.style.width = '100%'
    document.body.style.overflow = 'hidden'
    // Salvar a posição original para restaurar depois
    document.body.setAttribute('data-scroll-y', scrollY.toString())
    // Salvar também a posição ajustada se diferente
    if (adjustedScrollY !== scrollY) {
      document.body.setAttribute('data-adjusted-scroll-y', adjustedScrollY.toString())
    }
  }, [tiers])

  // Handler interno de dragOver (não debounced) - usado para lógica crítica
  const handleDragOverInternal = useCallback((event: DragOverEvent) => {
    const { active, over } = event

    if (!over) {
      lastDragOverRef.current = null
      return
    }

    const activeId = active.id as string
    const overId = over.id as string

    // Check if this is the same drag operation to avoid unnecessary updates
    if (lastDragOverRef.current?.activeId === activeId && lastDragOverRef.current?.overId === overId) {
      return
    }

    // If dragging a tier over another tier, handle reordering
    const activeTier = tiers.find((t) => t.id === activeId)
    const overTier = tiers.find((t) => t.id === overId)
    
    if (activeTier && overTier && activeId !== overId) {
      const oldIndex = tiers.findIndex((t) => t.id === activeId)
      const newIndex = tiers.findIndex((t) => t.id === overId)
      
      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        const newTiers = arrayMove(tiers, oldIndex, newIndex)
        // Update tier_order for all tiers
        const updatedTiers = newTiers.map((tier, index) => ({
          ...tier,
          tier_order: index,
        }))
        setTiers(updatedTiers)
        lastDragOverRef.current = { activeId, overId }
      }
      return
    }

    // If dragging an item (not a tier)
    if (!activeTier) {
      const activeItem = items.get(activeId)
      if (!activeItem) return

      // Check if overId is another item (reordering within same tier or moving between tiers)
      const overItem = items.get(overId)
      if (overItem) {
        // Both are items - handle reordering
        const overItemTierName = overItem.tier_name
        const activeItemTierName = activeItem.tier_name

        // If moving within the same tier, reorder items
        // This includes reordering within unassigned items (both tier_name === '')
        if (activeItemTierName === overItemTierName) {
          // Get all items in this tier/unassigned, sorted by order
          const tierItemsEntries = Array.from(items.entries())
            .filter(([_, item]) => item.tier_name === activeItemTierName)
            .sort(([_, a], [__, b]) => a.order - b.order)

          const activeIndex = tierItemsEntries.findIndex(([id]) => id === activeId)
          const overIndex = tierItemsEntries.findIndex(([id]) => id === overId)

          if (activeIndex !== -1 && overIndex !== -1 && activeIndex !== overIndex) {
            // Check if order would actually change
            const currentItem = items.get(activeId)
            const targetOrder = tierItemsEntries[overIndex]?.[1]?.order
            if (currentItem && targetOrder !== undefined && currentItem.order !== targetOrder) {
              // Reorder using arrayMove
              const reorderedEntries = arrayMove(tierItemsEntries, activeIndex, overIndex)
              const newItems = new Map(items)
              
              // Update order for all items in this tier/unassigned based on new positions
              reorderedEntries.forEach(([itemId], newOrder) => {
                const item = newItems.get(itemId)
                if (item && item.order !== newOrder) {
                  newItems.set(itemId, {
                    ...item,
                    order: newOrder,
                  })
                }
              })
              setItems(newItems)
              lastDragOverRef.current = { activeId, overId, order: targetOrder }
            }
          }
        } else if (activeItemTierName !== overItemTierName) {
          // Moving to a different tier - only update if tier actually changed
          if (activeItem.tier_name !== overItemTierName) {
            const newItems = new Map(items)
            
            // Get all items in the target tier, sorted by order
            const targetTierItemsEntries = Array.from(items.entries())
              .filter(([_, item]) => item.tier_name === overItemTierName)
              .sort(([_, a], [__, b]) => a.order - b.order)
            
            // Find the position of the over item in its tier
            const overItemIndex = targetTierItemsEntries.findIndex(([id]) => id === overId)
            
            // Update the active item to the new tier and position
            newItems.set(activeId, {
              ...activeItem,
              tier_name: overItemTierName,
              order: overItemIndex >= 0 ? overItemIndex : targetTierItemsEntries.length,
            })
            
            // Shift orders of items after the insertion point in the target tier
            targetTierItemsEntries.forEach(([itemId, item]) => {
              if (itemId !== activeId && item.order >= overItemIndex) {
                newItems.set(itemId, {
                  ...item,
                  order: item.order + 1,
                })
              }
            })
            
            setItems(newItems)
            lastDragOverRef.current = { activeId, overId, tierName: overItemTierName }
          }
        }
        return
      }

      // Check if overId is a tier row ID
      const overTier = tiers.find((t) => t.id === overId)
      if (overTier) {
        // It's a tier row, so we want to drop the item on that tier
        const tierName = overTier.tier_name
        if (activeItem.tier_name !== tierName) {
          // Only update if tier actually changed
          const newItems = new Map(items)
          newItems.set(activeId, {
            ...activeItem,
            tier_name: tierName,
            order: getNextOrderForTier(tierName),
          })
          setItems(newItems)
          lastDragOverRef.current = { activeId, overId, tierName }
        }
        return
      }

      // Check if overId is a droppable ID (tier.id)
      const tierFromDroppable = tiers.find((t) => t.id === overId || `tier-${t.tier_name}` === overId)
      if (tierFromDroppable) {
        const tierName = tierFromDroppable.tier_name
        if (activeItem.tier_name !== tierName) {
          // Only update if tier actually changed
          const newItems = new Map(items)
          newItems.set(activeId, {
            ...activeItem,
            tier_name: tierName,
            order: getNextOrderForTier(tierName),
          })
          setItems(newItems)
          lastDragOverRef.current = { activeId, overId, tierName }
        }
        return
      }
    }

    if (overId === 'unassigned' && !activeTier) {
      const item = items.get(activeId)
      if (item && item.tier_name !== '') {
        // Only update if actually moving to unassigned
        const newItems = new Map(items)
        newItems.set(activeId, {
          ...item,
          tier_name: '',
          order: getUnassignedItems().length,
        })
        setItems(newItems)
        lastDragOverRef.current = { activeId, overId }
      }
    }
  }, [tiers, items, getNextOrderForTier, getUnassignedItems])

  // Debounced version do dragOver para operações não-críticas (50ms)
  // Isso reduz drasticamente as atualizações durante drag rápido
  const handleDragOver = useDebounce(handleDragOverInternal, 50)

  // Para operações críticas (como reordenação de tiers), processamos imediatamente
  // Para items, usamos versão debounced para melhor performance
  const handleDragOverCritical = useCallback((event: DragOverEvent) => {
    const { active, over } = event

    if (!over) {
      lastDragOverRef.current = null
      // Usar versão debounced para limpar estado
      handleDragOverInternal(event)
      return
    }

    const activeId = active.id as string
    const overId = over.id as string

    // Para reordenação de tiers, processar imediatamente (sem debounce)
    const activeTier = tiers.find((t) => t.id === activeId)
    const overTier = tiers.find((t) => t.id === overId)
    
    if (activeTier && overTier && activeId !== overId) {
      // Check if this is the same drag operation
      if (lastDragOverRef.current?.activeId === activeId && lastDragOverRef.current?.overId === overId) {
        return
      }

      const oldIndex = tiers.findIndex((t) => t.id === activeId)
      const newIndex = tiers.findIndex((t) => t.id === overId)
      
      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        const newTiers = arrayMove(tiers, oldIndex, newIndex)
        const updatedTiers = newTiers.map((tier, index) => ({
          ...tier,
          tier_order: index,
        }))
        setTiers(updatedTiers)
        lastDragOverRef.current = { activeId, overId }
      }
    } else {
      // Para items, usar versão debounced para melhor performance
      handleDragOver(event)
    }
  }, [tiers, handleDragOver, handleDragOverInternal])

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event

    // Restaurar scroll após drag
    const scrollY = document.body.getAttribute('data-scroll-y')
    document.body.style.overflow = ''
    document.body.style.position = ''
    document.body.style.width = ''
    document.body.style.top = ''
    document.body.classList.remove('dragging-item', 'dragging-tier')
    document.body.removeAttribute('data-scroll-y')
    document.body.removeAttribute('data-adjusted-scroll-y')
    
    // Restaurar posição de scroll original (não a ajustada)
    if (scrollY) {
      window.scrollTo(0, parseInt(scrollY))
    }

    lastDragOverRef.current = null // Reset drag over tracking

    if (!over) {
      setActiveId(null)
      setDraggingTierId(null)
      return
    }

    const activeId = active.id as string
    const overId = over.id as string

    // Check if we're dragging a tier
    const activeTier = tiers.find((t) => t.id === activeId)
    const overTier = tiers.find((t) => t.id === overId)

    if (activeTier && overTier && activeId !== overId) {
      // Tier reordering is already handled in handleDragOver
      setActiveId(null)
      setDraggingTierId(null)
      return
    }

    // If dropping an item (not a tier)
    if (!activeTier) {
      const activeItem = items.get(activeId)
      if (!activeItem) {
        setActiveId(null)
        setDraggingTierId(null)
        return
      }

      // Check if overId is another item (reordering within same tier or moving between tiers)
      const overItem = items.get(overId)
      if (overItem) {
        // Both are items - reordering is already handled in handleDragOver
        setActiveId(null)
        setDraggingTierId(null)
        return
      }

      // Check if overId is a tier row ID
      const overTier = tiers.find((t) => t.id === overId)
      if (overTier) {
        // It's a tier row, so we want to drop the item on that tier
        const tierName = overTier.tier_name
        const newItems = new Map(items)
        newItems.set(activeId, {
          ...activeItem,
          tier_name: tierName,
          order: getNextOrderForTier(tierName),
        })
        setItems(newItems)
        setActiveId(null)
        setDraggingTierId(null)
        return
      }

      // Check if overId is a droppable ID (tier.id)
      const tierFromDroppable = tiers.find((t) => t.id === overId || `tier-${t.tier_name}` === overId)
      if (tierFromDroppable) {
        const tierName = tierFromDroppable.tier_name
        const newItems = new Map(items)
        newItems.set(activeId, {
          ...activeItem,
          tier_name: tierName,
          order: getNextOrderForTier(tierName),
        })
        setItems(newItems)
        setActiveId(null)
        setDraggingTierId(null)
        return
      }
    }

    if (overId === 'unassigned' && !activeTier) {
      // If dropping back to unassigned
      const item = items.get(activeId)
      if (item) {
        const newItems = new Map(items)
        newItems.set(activeId, {
          ...item,
          tier_name: '',
          order: getUnassignedItems().length,
        })
        setItems(newItems)
      }
    }

    setActiveId(null)
    setDraggingTierId(null)
    // Restaurar scroll após cancel (final do handleDragOver)
    const savedScrollY = document.body.getAttribute('data-scroll-y')
    document.body.style.overflow = ''
    document.body.style.position = ''
    document.body.style.width = ''
    document.body.style.top = ''
    document.body.classList.remove('dragging-item', 'dragging-tier')
    document.body.removeAttribute('data-scroll-y')
    
    // Restaurar posição de scroll
    if (savedScrollY) {
      window.scrollTo(0, parseInt(savedScrollY))
    }
  }, [tiers, items, getNextOrderForTier, getUnassignedItems])

  const handleTierNameChange = useCallback((tierId: string, newName: string) => {
    // Find the tier to get the old name
    const tier = tiers.find((t) => t.id === tierId)
    if (!tier) return

    const oldName = tier.tier_name
    
    // Don't update if name hasn't changed
    if (oldName === newName) return

    // Update the tier name and items in a single batch to avoid multiple renders
    setTiers((prevTiers) =>
      prevTiers.map((t) =>
        t.id === tierId ? { ...t, tier_name: newName } : t
      )
    )

    // Update all items that belong to this tier to use the new tier name
    setItems((prevItems) => {
      const newItems = new Map(prevItems)
      let hasChanges = false
      Array.from(newItems.entries()).forEach(([itemId, item]) => {
        if (item.tier_name === oldName) {
          newItems.set(itemId, {
            ...item,
            tier_name: newName,
          })
          hasChanges = true
        }
      })
      return hasChanges ? newItems : prevItems
    })
  }, [items])

  const handleTierColorChange = useCallback((tierId: string, newColor: string) => {
    setTiers((prevTiers) =>
      prevTiers.map((tier) =>
        tier.id === tierId ? { ...tier, color: newColor } : tier
      )
    )
  }, [])

  const handleTierDelete = useCallback((tierId: string) => {
    const tier = tiers.find((t) => t.id === tierId)
    if (!tier) return

    // Move all items from this tier back to unassigned
    const newItems = new Map(items)
    Array.from(items.entries()).forEach(([itemId, item]) => {
      if (item.tier_name === tier.tier_name) {
        newItems.set(itemId, {
          ...item,
          tier_name: '',
          order: getUnassignedItems().length,
        })
      }
    })
    setItems(newItems)

    // Remove the tier and reorder remaining tiers
    const filteredTiers = tiers.filter((t) => t.id !== tierId)
    const reorderedTiers = filteredTiers.map((tier, index) => ({
      ...tier,
      tier_order: index,
    }))
    setTiers(reorderedTiers)
  }, [items, getUnassignedItems, tiers])

  const handleAddTier = useCallback(() => {
    const newTier: TierListTier = {
      id: `tier-new-${uuidv4()}`,
      tier_list_id: '',
      tier_name: `Tier ${tiers.length + 1}`,
      tier_order: tiers.length,
      color: '#6B7280',
      created_at: '',
    }
    setTiers((prevTiers) => [...prevTiers, newTier])
  }, [tiers.length])

  const handleSave = useCallback(() => {
    if (onSave) {
      // Only send the data needed to create tiers (no id, tier_list_id, created_at)
      const tierData = tiers.map((tier) => ({
        tier_name: tier.tier_name,
        tier_order: tier.tier_order,
        color: tier.color || null,
      }))

      const itemData = Array.from(items.entries())
        .filter(([_, item]) => item.tier_name && item.tier_name !== '')
        .map(([template_item_id, item]) => ({
          template_item_id,
          tier_name: item.tier_name,
          order: item.order,
        }))

      onSave({
        tiers: tierData,
        items: itemData,
      })
    }
  }, [onSave, tiers, items])

  // Memoiza tierIds para evitar recriar array
  const tierIds = useMemo(() => tiers.map((tier) => tier.id), [tiers])

  // Get the active item being dragged (if it's an item, not a tier) - memoizado
  const activeItem = useMemo(() => {
    if (!activeId) return null
    const isTier = tiers.some((t) => t.id === activeId)
    if (isTier) return null
    return items.get(activeId)?.template_item || null
  }, [activeId, tiers, items])

  // Check if a tier is being dragged - memoizado
  const isDraggingTier = useMemo(() => draggingTierId !== null, [draggingTierId])

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOverCritical}
      onDragEnd={handleDragEnd}
    >
      <div className={`space-y-0 ${isDraggingTier ? 'cursor-grabbing' : ''}`}>
        {/* Tiers - Sortable */}
        <SortableContext items={tierIds} strategy={verticalListSortingStrategy}>
          {tiers.map((tier) => (
            <TierRow
              key={tier.id}
              tier={tier}
              items={getItemsForTier(tier.tier_name)}
              activeId={activeId}
              showItemName={showItemNames}
              isDragging={draggingTierId === tier.id}
              onTierNameChange={handleTierNameChange}
              onTierColorChange={handleTierColorChange}
              onTierDelete={handleTierDelete}
            />
          ))}
        </SortableContext>

        {/* Add Tier Button */}
        <div className="flex justify-center px-2 sm:px-4">
            <Button
              onClick={handleAddTier}
              variant="outline"
              className="flex items-center gap-2 w-full sm:w-auto touch-manipulation text-sm sm:text-base"
            >
              <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              {t('editor.addTier')}
            </Button>
        </div>

        {/* Botão Salvar acima da lista de imagens */}
        {onSave && (
          <div className="flex justify-center px-2 sm:px-4 pt-4 sm:pt-6 pb-3 sm:pb-4">
            <Button onClick={handleSave} className="px-4 sm:px-6 py-2 w-full sm:w-auto touch-manipulation text-sm sm:text-base">
              {t('editor.saveTierList')}
            </Button>
          </div>
        )}

        {/* Unassigned items - always show, even when empty */}
        <UnassignedDropZone 
          items={getUnassignedItems()} 
          showItemName={showItemNames}
          onShowItemNameChange={onShowItemNamesChange}
        />

        {/* Botão Salvar centralizado no final */}
        {onSave && (
          <div className="flex justify-center px-2 sm:px-4 pt-4 sm:pt-6 pb-3 sm:pb-4">
            <Button onClick={handleSave} className="px-4 sm:px-6 py-2 w-full sm:w-auto touch-manipulation text-sm sm:text-base">
              {t('editor.saveTierList')}
            </Button>
          </div>
        )}
      </div>

      {/* Drag Overlay - Shows the item being dragged following the cursor */}
      <DragOverlay>
        {activeItem ? (
          <div className="rotate-3 opacity-90">
            <ItemCard item={activeItem} showItemName={showItemNames} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
