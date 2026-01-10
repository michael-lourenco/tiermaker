export interface CanvasInputCallbacks {
  onItemDragStart: (itemId: string, offset: { x: number; y: number }) => void
  onItemDrag: (itemId: string, position: { x: number; y: number }) => void
  onItemDragEnd: (itemId: string, position: { x: number; y: number }) => void
  onTierDragStart: (tierId: string, offset: { x: number; y: number }) => void
  onTierDrag: (tierId: string, position: { x: number; y: number }) => void
  onTierDragEnd: (tierId: string, position: { x: number; y: number }) => void
  onTierClick: (tierId: string, position: { x: number; y: number }) => void
  onAddTierClick: () => void
  onSaveClick: () => void
}

import type { CanvasRenderer } from './CanvasRenderer'
import type { TemplateItem } from '@/types/template.types'
import type { TierListTier } from '@/types/tierList.types'

type ItemsDataGetter = () => {
  items: Map<string, { template_item: TemplateItem; tier_name: string; order: number }>
  tiers: TierListTier[]
  getItemsByTier: () => Map<string, TemplateItem[]>
  getUnassignedItems: () => TemplateItem[]
}

export class CanvasInputHandler {
  private canvas: HTMLCanvasElement
  private renderer: CanvasRenderer
  private callbacks: CanvasInputCallbacks
  private getItemsData: ItemsDataGetter
  private isDragging = false
  private draggedItemId: string | null = null
  private dragStartPos: { x: number; y: number } | null = null
  private dragOffset: { x: number; y: number } | null = null
  private readonly DRAG_THRESHOLD = 5

  // Button bounds (will be calculated based on canvas size)
  private addTierButtonBounds = { x: 0, y: 0, width: 150, height: 40 }
  private saveButtonBounds = { x: 0, y: 0, width: 150, height: 40 }

  constructor(
    canvas: HTMLCanvasElement,
    renderer: CanvasRenderer,
    callbacks: CanvasInputCallbacks,
    getItemsData: ItemsDataGetter
  ) {
    this.canvas = canvas
    this.renderer = renderer
    this.callbacks = callbacks
    this.getItemsData = getItemsData

    this.setupEventListeners()
    this.updateButtonBounds()
  }

  private setupEventListeners() {
    // Mouse events
    this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this))
    this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this))
    this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this))
    this.canvas.addEventListener('mouseleave', this.handleMouseLeave.bind(this))

    // Touch events
    this.canvas.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false })
    this.canvas.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false })
    this.canvas.addEventListener('touchend', this.handleTouchEnd.bind(this))
    this.canvas.addEventListener('touchcancel', this.handleTouchCancel.bind(this))

    // Prevent context menu
    this.canvas.addEventListener('contextmenu', (e) => e.preventDefault())
  }

  private updateButtonBounds() {
    const rect = this.canvas.getBoundingClientRect()
    const scaleX = this.canvas.width / rect.width
    const scaleY = this.canvas.height / rect.height

    const buttonY = this.canvas.height - 40 - 20
    const buttonX = this.canvas.width - 20 - 150 * 2 - 10

    this.addTierButtonBounds = {
      x: buttonX,
      y: buttonY,
      width: 150,
      height: 40,
    }

    this.saveButtonBounds = {
      x: buttonX + 150 + 10,
      y: buttonY,
      width: 150,
      height: 40,
    }
  }

  private getCanvasPosition(clientX: number, clientY: number): { x: number; y: number } {
    const rect = this.canvas.getBoundingClientRect()
    const scaleX = this.canvas.width / rect.width
    const scaleY = this.canvas.height / rect.height

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    }
  }

  private handleMouseDown(e: MouseEvent) {
    const pos = this.getCanvasPosition(e.clientX, e.clientY)
    this.handlePointerDown(pos, e.button === 0)
  }

  private handleMouseMove(e: MouseEvent) {
    const pos = this.getCanvasPosition(e.clientX, e.clientY)
    this.handlePointerMove(pos)
  }

  private handleMouseUp(e: MouseEvent) {
    const pos = this.getCanvasPosition(e.clientX, e.clientY)
    this.handlePointerUp(pos)
  }

  private handleMouseLeave() {
    if (this.isDragging && this.draggedItemId) {
      // Cancel drag if mouse leaves canvas
      this.isDragging = false
      this.draggedItemId = null
      this.dragStartPos = null
      this.dragOffset = null
    }
  }

  private handleTouchStart(e: TouchEvent) {
    if (e.touches.length !== 1) return
    e.preventDefault()
    const touch = e.touches[0]
    const pos = this.getCanvasPosition(touch.clientX, touch.clientY)
    this.handlePointerDown(pos, true)
  }

  private handleTouchMove(e: TouchEvent) {
    if (e.touches.length !== 1 || !this.isDragging) return
    e.preventDefault()
    const touch = e.touches[0]
    const pos = this.getCanvasPosition(touch.clientX, touch.clientY)
    this.handlePointerMove(pos)
  }

  private handleTouchEnd(e: TouchEvent) {
    if (e.changedTouches.length !== 1) return
    e.preventDefault()
    const touch = e.changedTouches[0]
    const pos = this.getCanvasPosition(touch.clientX, touch.clientY)
    this.handlePointerUp(pos)
  }

  private handleTouchCancel() {
    if (this.isDragging && this.draggedItemId) {
      this.isDragging = false
      this.draggedItemId = null
      this.dragStartPos = null
      this.dragOffset = null
    }
  }

  private handlePointerDown(pos: { x: number; y: number }, isPrimary: boolean) {
    if (!isPrimary) return

    // Check if clicking on buttons first
    if (this.isPointInButton(pos, this.addTierButtonBounds)) {
      this.callbacks.onAddTierClick()
      return
    }

    if (this.isPointInButton(pos, this.saveButtonBounds)) {
      this.callbacks.onSaveClick()
      return
    }

    // Get items data
    const { items, tiers, getItemsByTier, getUnassignedItems } = this.getItemsData()
    const itemsByTier = getItemsByTier()
    const allItems = [
      ...Array.from(itemsByTier.values()).flat(),
      ...getUnassignedItems()
    ]

    // Check if clicking on an item
    const clickedItem = this.renderer.getItemAtPosition(pos, allItems, itemsByTier)
    
    if (clickedItem) {
      // Find item in items map to get full data
      const itemEntry = Array.from(items.entries()).find(
        ([_, item]) => item.template_item.id === clickedItem.id
      )
      
      if (itemEntry) {
        // Calculate offset from item position
        // We'll use a default offset for now (center of item)
        const offset = { x: 50, y: 50 } // Half of ITEM_SIZE
        
        this.draggedItemId = clickedItem.id
        this.dragStartPos = pos
        this.dragOffset = offset
        this.isDragging = false // Will become true after threshold
        
        this.callbacks.onItemDragStart(clickedItem.id, offset)
      }
    } else {
      // Start potential drag for tier or other elements
      this.dragStartPos = pos
      this.isDragging = false
    }
  }

  private handlePointerMove(pos: { x: number; y: number }) {
    if (!this.dragStartPos) return

    const dx = pos.x - this.dragStartPos.x
    const dy = pos.y - this.dragStartPos.y
    const distance = Math.sqrt(dx * dx + dy * dy)

    // Check if we've moved enough to start dragging
    if (!this.isDragging && this.draggedItemId && distance > this.DRAG_THRESHOLD) {
      this.isDragging = true
    }

    if (this.isDragging && this.draggedItemId) {
      this.callbacks.onItemDrag(this.draggedItemId, pos)
    }
  }

  private handlePointerUp(pos: { x: number; y: number }) {
    if (this.isDragging && this.draggedItemId) {
      this.callbacks.onItemDragEnd(this.draggedItemId, pos)
    } else if (this.dragStartPos) {
      // Was a click, not a drag
      // Could trigger edit mode or other click actions
    }

    this.isDragging = false
    this.draggedItemId = null
    this.dragStartPos = null
    this.dragOffset = null
  }

  private isPointInButton(pos: { x: number; y: number }, bounds: { x: number; y: number; width: number; height: number }): boolean {
    return (
      pos.x >= bounds.x &&
      pos.x <= bounds.x + bounds.width &&
      pos.y >= bounds.y &&
      pos.y <= bounds.y + bounds.height
    )
  }


  cleanup() {
    // Remove all event listeners
    this.canvas.removeEventListener('mousedown', this.handleMouseDown.bind(this))
    this.canvas.removeEventListener('mousemove', this.handleMouseMove.bind(this))
    this.canvas.removeEventListener('mouseup', this.handleMouseUp.bind(this))
    this.canvas.removeEventListener('mouseleave', this.handleMouseLeave.bind(this))
    this.canvas.removeEventListener('touchstart', this.handleTouchStart.bind(this))
    this.canvas.removeEventListener('touchmove', this.handleTouchMove.bind(this))
    this.canvas.removeEventListener('touchend', this.handleTouchEnd.bind(this))
    this.canvas.removeEventListener('touchcancel', this.handleTouchCancel.bind(this))
  }
}
