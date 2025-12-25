# Correção do Drag and Drop de Itens

## Data: 2025-01-XX

## Problema
Após implementar a funcionalidade de reordenação de tiers, o drag and drop de itens para os tiers parou de funcionar.

## Causa Raiz
O problema ocorreu porque agora temos dois tipos de drag and drop:
1. **Drag de tiers**: Para reordenar os tiers (usando `tier.id` como ID)
2. **Drag de itens**: Para colocar itens nos tiers (usando `tier-${tier.tier_name}` como ID do droppable)

Quando um item era arrastado sobre um tier, o `overId` poderia ser:
- O ID do tier row (`tier.id`) - quando arrastado sobre o `TierRow`
- O ID do droppable (`tier-${tier.tier_name}`) - quando arrastado sobre o `TierColumn`

A lógica original só verificava se `overId.startsWith('tier-')`, mas não distinguia entre esses dois casos.

## Solução Implementada

### 1. Atualização do `TierListEditor.tsx`

**Mudanças em `handleDragOver`**:
- Agora verifica primeiro se `overId` é um ID de tier (está na lista de tiers)
- Se for, encontra o tier correspondente e move o item para esse tier
- Se não for, verifica se é um ID de droppable (`tier-${tier.tier_name}`)
- Isso garante que itens possam ser soltos tanto no `TierRow` quanto no `TierColumn`

**Mudanças em `handleDragEnd`**:
- Mesma lógica aplicada para garantir que o drop funcione corretamente
- Adicionado `return` após processar o drop para evitar processamento duplicado

### 2. Atualização do `TierRow.tsx`

**Mudanças**:
- Adicionado `useDroppable` para tornar o `TierRow` também um droppable
- Usa o mesmo ID do tier (`tier.id`) como ID do droppable
- Isso permite que itens sejam soltos diretamente no `TierRow`
- Combinado os refs do `useSortable` e `useDroppable` para que o mesmo elemento seja tanto sortable quanto droppable

## Código Modificado

### `TierListEditor.tsx` - `handleDragOver`

```typescript
// If dragging over a tier (item drop)
// Check if overId is a tier ID or a droppable ID
if (!activeTier) {
  // First, check if overId is a tier row ID (for tier reordering)
  const overTier = tiers.find((t) => t.id === overId)
  if (overTier) {
    // It's a tier row, so we want to drop the item on that tier
    const tierName = overTier.tier_name
    const item = items.get(activeId)
    if (item && item.tier_name !== tierName) {
      // Update item's tier preview (visual feedback only)
      const newItems = new Map(items)
      newItems.set(activeId, {
        ...item,
        tier_name: tierName,
        order: getNextOrderForTier(tierName),
      })
      setItems(newItems)
    }
    return
  }

  // Check if overId is a droppable ID (tier-${tier_name})
  const tierFromDroppable = tiers.find((t) => `tier-${t.tier_name}` === overId)
  if (tierFromDroppable) {
    const tierName = tierFromDroppable.tier_name
    const item = items.get(activeId)
    if (item && item.tier_name !== tierName) {
      // Update item's tier preview (visual feedback only)
      const newItems = new Map(items)
      newItems.set(activeId, {
        ...item,
        tier_name: tierName,
        order: getNextOrderForTier(tierName),
      })
      setItems(newItems)
    }
    return
  }
}
```

### `TierRow.tsx` - Adicionado Droppable

```typescript
import { useDroppable } from '@dnd-kit/core'

// ...

const {
  attributes,
  listeners,
  setNodeRef: setSortableRef,
  transform,
  transition,
  isDragging,
} = useSortable({ id: tier.id })

// Also make the row droppable for items (when not dragging the tier itself)
const { setNodeRef: setDroppableRef, isOver } = useDroppable({
  id: tier.id, // Use tier.id as droppable ID so items can be dropped on the row
})

// Combine refs
const setNodeRef = (node: HTMLElement | null) => {
  setSortableRef(node)
  setDroppableRef(node)
}
```

## Fluxo de Detecção

1. **Item arrastado sobre TierRow**:
   - `overId` = `tier.id` (ex: `tier-S-uuid`)
   - Detectado como tier row ID
   - Item movido para o tier correspondente

2. **Item arrastado sobre TierColumn**:
   - `overId` = `tier-${tier.tier_name}` (ex: `tier-S`)
   - Detectado como droppable ID
   - Item movido para o tier correspondente

3. **Tier arrastado sobre outro Tier**:
   - `overId` = `tier.id` de outro tier
   - Detectado como tier row ID
   - Reordenação de tiers executada

## Testes Realizados

- ✅ Build TypeScript sem erros
- ✅ Linter sem erros
- ✅ Drag and drop de itens funciona corretamente
- ✅ Drag and drop de tiers continua funcionando
- ✅ Não há conflito entre os dois tipos de drag and drop

## Resultado

Agora os itens podem ser arrastados e soltos tanto no `TierRow` quanto no `TierColumn`, e a reordenação de tiers continua funcionando normalmente. O sistema distingue corretamente entre arrastar tiers e arrastar itens.

