'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { DEFAULT_TIERS, TIER_COLORS } from '@/lib/constants/tiers'
import type { TemplateItem } from '@/types/template.types'
import type { TierListTier, TierListItem } from '@/types/tierList.types'
import { v4 as uuidv4 } from 'uuid'
import { CanvasRenderer } from './CanvasRenderer'
import { CanvasInputHandler } from './CanvasInputHandler'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

interface CanvasTierListEditorProps {
  templateItems: TemplateItem[]
  initialTiers?: TierListTier[]
  initialItems?: (TierListItem & { template_item: TemplateItem })[]
  onSave?: (data: {
    tiers: Array<{ tier_name: string; tier_order: number; color: string | null }>
    items: Array<{ template_item_id: string; tier_name: string; order: number }>
  }) => void
}

export function CanvasTierListEditor({
  templateItems,
  initialTiers,
  initialItems,
  onSave,
}: CanvasTierListEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
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

  const [draggedItemId, setDraggedItemId] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number } | null>(null)
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null)

  // Initialize items
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

  // Canvas dimensions
  const canvasDimensions = useMemo(() => {
    if (typeof window === 'undefined') return { width: 1200, height: 800 }
    return {
      width: Math.min(window.innerWidth - 100, 1400),
      height: Math.max(window.innerHeight - 300, 800),
    }
  }, [])

  // Renderer instance
  const rendererRef = useRef<CanvasRenderer | null>(null)
  const inputHandlerRef = useRef<CanvasInputHandler | null>(null)

  // Helper functions - declare first so they can be used in useEffects
  const getItemsByTier = useCallback(() => {
    const itemsByTier = new Map<string, TemplateItem[]>()
    tiers.forEach((tier) => {
      const tierItems = Array.from(items.entries())
        .filter(([_, item]) => item.tier_name === tier.tier_name)
        .sort(([_, a], [__, b]) => a.order - b.order)
        .map(([id]) => items.get(id)!.template_item)
      itemsByTier.set(tier.tier_name, tierItems)
    })
    return itemsByTier
  }, [tiers, items])

  const getUnassignedItems = useCallback((): TemplateItem[] => {
    return Array.from(items.entries())
      .filter(([_, item]) => !item.tier_name || item.tier_name === '')
      .sort(([_, a], [__, b]) => a.order - b.order)
      .map(([id]) => items.get(id)!.template_item)
  }, [items])

  // Helper functions (will be defined later, stored in refs for stability)
  const handleItemDropRef = useRef<(itemId: string, position: { x: number; y: number }) => void>(() => {})
  const handleAddTierRef = useRef<() => void>(() => {})
  const handleSaveRef = useRef<() => void>(() => {})

  // Store items data for input handler access (initialized with placeholder functions)
  const itemsDataRef = useRef<{ 
    items: Map<string, { template_item: TemplateItem; tier_name: string; order: number }>
    tiers: TierListTier[]
    getItemsByTier: () => Map<string, TemplateItem[]>
    getUnassignedItems: () => TemplateItem[]
  }>({ 
    items: new Map(), 
    tiers: [], 
    getItemsByTier: () => new Map(), 
    getUnassignedItems: () => [] 
  })

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    canvas.width = canvasDimensions.width
    canvas.height = canvasDimensions.height

    // Create renderer
    rendererRef.current = new CanvasRenderer(ctx, canvas.width, canvas.height)
    
    // Create input handler with access to items
    inputHandlerRef.current = new CanvasInputHandler(
      canvas,
      rendererRef.current,
      {
        onItemDragStart: (itemId, offset) => {
          setDraggedItemId(itemId)
          setDragOffset(offset)
        },
        onItemDrag: (itemId, position) => {
          setMousePos(position)
        },
        onItemDragEnd: (itemId, position) => {
          handleItemDropRef.current(itemId, position)
          setDraggedItemId(null)
          setDragOffset(null)
          setMousePos(null)
        },
        onTierDragStart: () => {},
        onTierDrag: () => {},
        onTierDragEnd: () => {},
        onTierClick: () => {},
        onAddTierClick: () => {
          handleAddTierRef.current()
        },
        onSaveClick: () => {
          handleSaveRef.current()
        },
      },
      () => itemsDataRef.current
    )

    return () => {
      inputHandlerRef.current?.cleanup()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvasDimensions])

  // Render loop
  useEffect(() => {
    const renderer = rendererRef.current
    if (!renderer) return

    let animationFrameId: number

    const render = () => {
      renderer.clear()
      
      // Get all items organized by tier
      const itemsByTier = getItemsByTier()
      const unassignedItems = getUnassignedItems()

      // Render tiers and items
      renderer.renderTiers(
        tiers,
        itemsByTier,
        draggedItemId,
        mousePos,
        dragOffset,
        items
      )

      // Render unassigned items area
      renderer.renderUnassignedZone(unassignedItems, draggedItemId, mousePos, dragOffset, items)

      // Render dragged item overlay if dragging
      if (draggedItemId && mousePos && dragOffset) {
        const draggedItem = Array.from(items.values()).find(
          (item) => item.template_item.id === draggedItemId
        )
        if (draggedItem) {
          renderer.renderDraggedItem(draggedItem.template_item, mousePos.x, mousePos.y, dragOffset)
        }
      }

      // Render UI buttons
      renderer.renderButtons(tiers.length)

      animationFrameId = requestAnimationFrame(render)
    }

    animationFrameId = requestAnimationFrame(render)
    
    return () => {
      cancelAnimationFrame(animationFrameId)
    }
  }, [tiers, items, draggedItemId, mousePos, dragOffset, getItemsByTier, getUnassignedItems])

  const handleItemDrop = useCallback((itemId: string, position: { x: number; y: number }) => {
    const renderer = rendererRef.current
    if (!renderer) return

    // Check if dropped on a tier
    const droppedTier = renderer.getTierAtPosition(position, tiers)
    
    if (droppedTier) {
      // Move item to tier
      const newItems = new Map(items)
      const item = newItems.get(itemId)
      if (item) {
        const currentTierName = item.tier_name
        const targetTierName = droppedTier.tier_name
        
        if (currentTierName !== targetTierName) {
          // Get items in target tier to calculate order
          const targetTierItems = Array.from(items.entries())
            .filter(([_, i]) => i.tier_name === targetTierName)
            .sort(([_, a], [__, b]) => a.order - b.order)
          
          newItems.set(itemId, {
            ...item,
            tier_name: targetTierName,
            order: targetTierItems.length,
          })
          setItems(newItems)
        }
      }
    } else {
      // Check if dropped on unassigned zone
      const unassignedBounds = renderer.getUnassignedZoneBounds()
      if (
        position.x >= unassignedBounds.x &&
        position.x <= unassignedBounds.x + unassignedBounds.width &&
        position.y >= unassignedBounds.y &&
        position.y <= unassignedBounds.y + unassignedBounds.height
      ) {
        // Move item to unassigned
        const newItems = new Map(items)
        const item = newItems.get(itemId)
        if (item && item.tier_name !== '') {
          newItems.set(itemId, {
            ...item,
            tier_name: '',
            order: getUnassignedItems().length,
          })
          setItems(newItems)
        }
      }
    }
  }, [items, tiers, getUnassignedItems])

  const handleAddTier = useCallback(() => {
    const newTier: TierListTier = {
      id: `tier-new-${uuidv4()}`,
      tier_list_id: '',
      tier_name: `Tier ${tiers.length + 1}`,
      tier_order: tiers.length,
      color: '#6B7280',
      created_at: '',
    }
    setTiers((prev) => [...prev, newTier])
  }, [tiers.length])

  const handleSave = useCallback(() => {
    if (!onSave) return

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
  }, [tiers, items, onSave])

  // Update refs when callbacks change
  useEffect(() => {
    handleItemDropRef.current = handleItemDrop
    handleAddTierRef.current = handleAddTier
    handleSaveRef.current = handleSave
    itemsDataRef.current = { items, tiers, getItemsByTier, getUnassignedItems }
  }, [handleItemDrop, handleAddTier, handleSave, items, tiers, getItemsByTier, getUnassignedItems])

  return (
    <div className="flex flex-col items-center gap-4">
      <canvas
        ref={canvasRef}
        className="border border-border rounded-lg bg-background cursor-grab active:cursor-grabbing"
        style={{
          maxWidth: '100%',
          height: 'auto',
        }}
      />
      
      {/* Botões de controle abaixo do canvas */}
      <div className="flex gap-4">
        <Button onClick={handleAddTier} variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Tier
        </Button>
        {onSave && (
          <Button onClick={handleSave}>
            Salvar Tier List
          </Button>
        )}
      </div>
    </div>
  )
}
