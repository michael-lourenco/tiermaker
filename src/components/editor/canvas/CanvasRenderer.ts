import type { TierListTier } from '@/types/tierList.types'
import type { TemplateItem } from '@/types/template.types'

export class CanvasRenderer {
  private ctx: CanvasRenderingContext2D
  private canvasWidth: number
  private canvasHeight: number
  private imageCache: Map<string, HTMLImageElement> = new Map()

  // Constants
  private readonly TIER_HEIGHT = 120
  private readonly TIER_LABEL_WIDTH = 150
  private readonly ITEM_SIZE = 100
  private readonly ITEM_SPACING = 10
  private readonly TIER_SPACING = 5
  private readonly PADDING = 20
  private readonly UNSASSIGNED_ZONE_HEIGHT = 250
  private readonly BUTTON_HEIGHT = 40
  private readonly BUTTON_WIDTH = 150
  private readonly BUTTON_SPACING = 10

  constructor(ctx: CanvasRenderingContext2D, width: number, height: number) {
    this.ctx = ctx
    this.canvasWidth = width
    this.canvasHeight = height
  }

  clear() {
    this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight)
    this.ctx.fillStyle = '#ffffff'
    this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight)
  }

  renderTiers(
    tiers: TierListTier[],
    itemsByTier: Map<string, TemplateItem[]>,
    draggedItemId: string | null,
    mousePos: { x: number; y: number } | null,
    dragOffset: { x: number; y: number } | null,
    allItems: Map<string, { template_item: TemplateItem; tier_name: string; order: number }>
  ) {
    let currentY = this.PADDING

    tiers.forEach((tier, index) => {
      const tierY = currentY
      const tierItems = itemsByTier.get(tier.tier_name) || []

      // Draw tier background
      const tierColor = tier.color || '#E5E7EB'
      this.ctx.fillStyle = `${tierColor}40`
      this.ctx.fillRect(this.PADDING, tierY, this.canvasWidth - this.PADDING * 2, this.TIER_HEIGHT)

      // Draw tier border
      this.ctx.strokeStyle = tierColor || '#D1D5DB'
      this.ctx.lineWidth = 3
      this.ctx.strokeRect(this.PADDING, tierY, this.canvasWidth - this.PADDING * 2, this.TIER_HEIGHT)

      // Draw tier label area
      this.ctx.fillStyle = `${tierColor}80`
      this.ctx.fillRect(this.PADDING, tierY, this.TIER_LABEL_WIDTH, this.TIER_HEIGHT)

      // Draw tier label border
      this.ctx.strokeStyle = tierColor || '#D1D5DB'
      this.ctx.lineWidth = 2
      this.ctx.strokeRect(this.PADDING, tierY, this.TIER_LABEL_WIDTH, this.TIER_HEIGHT)

      // Draw tier name
      this.ctx.fillStyle = tierColor || '#374151'
      this.ctx.font = 'bold 20px sans-serif'
      this.ctx.textAlign = 'center'
      this.ctx.textBaseline = 'middle'
      this.ctx.fillText(
        tier.tier_name,
        this.PADDING + this.TIER_LABEL_WIDTH / 2,
        tierY + this.TIER_HEIGHT / 2
      )

      // Draw items in tier
      let itemX = this.PADDING + this.TIER_LABEL_WIDTH + this.ITEM_SPACING
      const itemY = tierY + (this.TIER_HEIGHT - this.ITEM_SIZE) / 2

      tierItems.forEach((item) => {
        if (draggedItemId && allItems.get(item.id)?.template_item.id === draggedItemId) {
          // Don't render dragged item here (it's rendered at mouse position)
        } else {
          this.renderItem(item, itemX, itemY, false)
        }
        itemX += this.ITEM_SIZE + this.ITEM_SPACING
      })

      currentY += this.TIER_HEIGHT + this.TIER_SPACING
    })
  }

  renderUnassignedZone(
    unassignedItems: TemplateItem[],
    draggedItemId: string | null,
    mousePos: { x: number; y: number } | null,
    dragOffset: { x: number; y: number } | null,
    allItems: Map<string, { template_item: TemplateItem; tier_name: string; order: number }>
  ) {
    const zoneY = this.canvasHeight - this.UNSASSIGNED_ZONE_HEIGHT - this.BUTTON_HEIGHT - this.PADDING * 2
    
    // Draw unassigned zone background
    this.ctx.fillStyle = '#F3F4F640'
    this.ctx.fillRect(
      this.PADDING,
      zoneY,
      this.canvasWidth - this.PADDING * 2,
      this.UNSASSIGNED_ZONE_HEIGHT
    )

    // Draw unassigned zone border
    this.ctx.strokeStyle = '#D1D5DB'
    this.ctx.lineWidth = 3
    this.ctx.setLineDash([5, 5])
    this.ctx.strokeRect(
      this.PADDING,
      zoneY,
      this.canvasWidth - this.PADDING * 2,
      this.UNSASSIGNED_ZONE_HEIGHT
    )
    this.ctx.setLineDash([])

    // Draw "Unassigned" label
    this.ctx.fillStyle = '#6B7280'
    this.ctx.font = 'bold 18px sans-serif'
    this.ctx.textAlign = 'left'
    this.ctx.textBaseline = 'top'
    this.ctx.fillText('Itens Não Atribuídos', this.PADDING + 10, zoneY + 10)

    // Draw unassigned items in a grid
    const itemsPerRow = Math.max(1, Math.floor((this.canvasWidth - this.PADDING * 2 - this.ITEM_SPACING) / (this.ITEM_SIZE + this.ITEM_SPACING)))
    const startX = this.PADDING + this.ITEM_SPACING
    const startY = zoneY + 40

    unassignedItems.forEach((item, index) => {
      if (draggedItemId && item.id === draggedItemId) {
        // Don't render dragged item here (it's rendered at mouse position)
        return
      }

      const col = index % itemsPerRow
      const row = Math.floor(index / itemsPerRow)
      const itemX = startX + col * (this.ITEM_SIZE + this.ITEM_SPACING)
      const itemY = startY + row * (this.ITEM_SIZE + this.ITEM_SPACING)
      
      this.renderItem(item, itemX, itemY, false)
    })
  }

  renderItem(item: TemplateItem, x: number, y: number, isDragging: boolean) {
    if (isDragging) {
      this.ctx.globalAlpha = 0.7
    }

    // Draw item background
    this.ctx.fillStyle = '#ffffff'
    this.ctx.fillRect(x, y, this.ITEM_SIZE, this.ITEM_SIZE)

    // Draw item border
    this.ctx.strokeStyle = '#D1D5DB'
    this.ctx.lineWidth = 2
    this.ctx.strokeRect(x, y, this.ITEM_SIZE, this.ITEM_SIZE)

    // Draw item image - use cache if available
    let img = this.imageCache.get(item.image_url)
    
    if (img && img.complete && img.naturalWidth > 0) {
      // Image is cached and loaded, draw it
      this.ctx.drawImage(img, x + 5, y + 5, this.ITEM_SIZE - 10, this.ITEM_SIZE - 30)
    } else {
      // Draw placeholder
      this.ctx.fillStyle = '#E5E7EB'
      this.ctx.fillRect(x + 5, y + 5, this.ITEM_SIZE - 10, this.ITEM_SIZE - 30)
      
      // Load image if not in cache or not loaded
      if (!img) {
        img = new Image()
        img.crossOrigin = 'anonymous'
        img.onload = () => {
          this.imageCache.set(item.image_url, img!)
          // Trigger a redraw by dispatching a custom event or using a callback
          // For now, the render loop will pick it up on next frame
        }
        img.onerror = () => {
          // Mark as loaded with error to avoid retrying
          this.imageCache.set(item.image_url, img!)
        }
        img.src = item.image_url
        this.imageCache.set(item.image_url, img)
      }
    }

    // Draw item name
    this.ctx.fillStyle = '#374151'
    this.ctx.font = '12px sans-serif'
    this.ctx.textAlign = 'center'
    this.ctx.textBaseline = 'top'
    const name = item.name.length > 15 ? item.name.substring(0, 15) + '...' : item.name
    this.ctx.fillText(name, x + this.ITEM_SIZE / 2, y + this.ITEM_SIZE - 20)

    this.ctx.globalAlpha = 1.0
  }

  renderDraggedItem(
    item: TemplateItem,
    mouseX: number,
    mouseY: number,
    dragOffset: { x: number; y: number }
  ) {
    const x = mouseX - dragOffset.x
    const y = mouseY - dragOffset.y

    // Draw shadow
    this.ctx.shadowColor = 'rgba(0, 0, 0, 0.3)'
    this.ctx.shadowBlur = 10
    this.ctx.shadowOffsetX = 5
    this.ctx.shadowOffsetY = 5

    this.renderItem(item, x, y, true)

    this.ctx.shadowColor = 'transparent'
    this.ctx.shadowBlur = 0
    this.ctx.shadowOffsetX = 0
    this.ctx.shadowOffsetY = 0
    this.ctx.globalAlpha = 1.0
  }

  renderButtons(tierCount: number) {
    const buttonY = this.canvasHeight - this.BUTTON_HEIGHT - this.PADDING
    const buttonX = this.canvasWidth - this.PADDING - this.BUTTON_WIDTH * 2 - this.BUTTON_SPACING

    // Add Tier button
    this.renderButton('+ Adicionar Tier', buttonX, buttonY, this.BUTTON_WIDTH, this.BUTTON_HEIGHT)

    // Save button
    this.renderButton('Salvar', buttonX + this.BUTTON_WIDTH + this.BUTTON_SPACING, buttonY, this.BUTTON_WIDTH, this.BUTTON_HEIGHT)
  }

  renderButton(text: string, x: number, y: number, width: number, height: number) {
    // Button background
    this.ctx.fillStyle = '#3B82F6'
    this.ctx.fillRect(x, y, width, height)

    // Button border
    this.ctx.strokeStyle = '#2563EB'
    this.ctx.lineWidth = 1
    this.ctx.strokeRect(x, y, width, height)

    // Button text
    this.ctx.fillStyle = '#ffffff'
    this.ctx.font = '14px sans-serif'
    this.ctx.textAlign = 'center'
    this.ctx.textBaseline = 'middle'
    this.ctx.fillText(text, x + width / 2, y + height / 2)
  }

  getTierAtPosition(position: { x: number; y: number }, tiers: TierListTier[]): TierListTier | null {
    let currentY = this.PADDING

    for (const tier of tiers) {
      const tierBounds = {
        x: this.PADDING,
        y: currentY,
        width: this.canvasWidth - this.PADDING * 2,
        height: this.TIER_HEIGHT,
      }

      if (
        position.x >= tierBounds.x &&
        position.x <= tierBounds.x + tierBounds.width &&
        position.y >= tierBounds.y &&
        position.y <= tierBounds.y + tierBounds.height
      ) {
        return tier
      }

      currentY += this.TIER_HEIGHT + this.TIER_SPACING
    }

    return null
  }

  getUnassignedZoneBounds() {
    return {
      x: this.PADDING,
      y: this.canvasHeight - this.UNSASSIGNED_ZONE_HEIGHT - this.BUTTON_HEIGHT - this.PADDING * 2,
      width: this.canvasWidth - this.PADDING * 2,
      height: this.UNSASSIGNED_ZONE_HEIGHT,
    }
  }

  getItemAtPosition(position: { x: number; y: number }, allItems: TemplateItem[], itemsByTier: Map<string, TemplateItem[]>): TemplateItem | null {
    // Check items in tiers
    let currentY = this.PADDING

    for (const [tierName, tierItems] of itemsByTier.entries()) {
      const itemY = currentY + (this.TIER_HEIGHT - this.ITEM_SIZE) / 2
      let itemX = this.PADDING + this.TIER_LABEL_WIDTH + this.ITEM_SPACING

      for (const item of tierItems) {
        if (
          position.x >= itemX &&
          position.x <= itemX + this.ITEM_SIZE &&
          position.y >= itemY &&
          position.y <= itemY + this.ITEM_SIZE
        ) {
          return item
        }
        itemX += this.ITEM_SIZE + this.ITEM_SPACING
      }

      currentY += this.TIER_HEIGHT + this.TIER_SPACING
    }

    // Check unassigned items
    const unassignedBounds = this.getUnassignedZoneBounds()
    if (
      position.x >= unassignedBounds.x &&
      position.x <= unassignedBounds.x + unassignedBounds.width &&
      position.y >= unassignedBounds.y &&
      position.y <= unassignedBounds.y + unassignedBounds.height
    ) {
      // Calculate which unassigned item was clicked
      const itemsPerRow = Math.max(1, Math.floor((unassignedBounds.width - this.PADDING * 2) / (this.ITEM_SIZE + this.ITEM_SPACING)))
      const relativeX = position.x - unassignedBounds.x - this.ITEM_SPACING
      const relativeY = position.y - unassignedBounds.y - 40
      const col = Math.floor(Math.max(0, relativeX) / (this.ITEM_SIZE + this.ITEM_SPACING))
      const row = Math.floor(Math.max(0, relativeY) / (this.ITEM_SIZE + this.ITEM_SPACING))
      const index = row * itemsPerRow + col

      // Filter only unassigned items
      const unassignedItems = allItems.filter(item => {
        // Check if item is in any tier
        for (const tierItems of itemsByTier.values()) {
          if (tierItems.some(ti => ti.id === item.id)) {
            return false
          }
        }
        return true
      })

      if (index >= 0 && index < unassignedItems.length) {
        return unassignedItems[index]
      }
    }

    return null
  }
}
