# Melhorias no Editor de Tier Lists

## Data: 2025-01-XX

## Objetivo
Melhorar a interface do editor de tier lists para permitir:
- Layout horizontal: tier à esquerda, itens à direita
- Edição do nome do tier
- Edição da cor do tier
- Reordenação de tiers (drag and drop)
- Adicionar novos tiers
- Remover tiers

## Arquivos Criados/Modificados

### 1. `src/components/editor/TierColumn.tsx`
**Função**: Componente que representa uma linha de tier com layout horizontal.

**Alterações**:
- Layout horizontal: tier à esquerda (w-24 md:w-32), itens à direita (flex-1)
- Input editável para o nome do tier (máximo 10 caracteres)
- Color picker para alterar a cor do tier
- Botão para remover o tier
- Sincronização de estado com `useEffect` quando o tier muda externamente
- Feedback visual durante drag and drop

**Funcionalidades**:
- `onTierNameChange`: Callback quando o nome do tier é alterado
- `onTierColorChange`: Callback quando a cor do tier é alterada
- `onTierDelete`: Callback para remover o tier
- `isDragging`: Prop para indicar quando o tier está sendo arrastado

### 2. `src/components/editor/TierRow.tsx` (NOVO)
**Função**: Componente wrapper que adiciona funcionalidade de drag and drop para reordenar tiers.

**Funcionalidades**:
- Usa `useSortable` do @dnd-kit para tornar o tier arrastável
- Exibe um handle de arraste (GripVertical) que aparece no hover
- Encapsula o `TierColumn` e adiciona a funcionalidade de reordenação
- Feedback visual durante o arraste (opacity)

**Props**:
- Todas as props do `TierColumn` são repassadas
- Gerencia o estado de arraste do tier

### 3. `src/components/editor/TierListEditor.tsx`
**Função**: Componente principal do editor que gerencia todos os tiers e itens.

**Alterações Principais**:
- Substituído `TierColumn` por `TierRow` para suportar reordenação
- Adicionado `SortableContext` para gerenciar a reordenação de tiers
- Implementado `handleTierNameChange`: Atualiza o nome do tier no estado
- Implementado `handleTierColorChange`: Atualiza a cor do tier no estado
- Implementado `handleTierDelete`: Remove o tier e move seus itens para "unassigned"
- Implementado `handleAddTier`: Adiciona um novo tier com nome e cor padrão
- Melhorado `handleDragOver` e `handleDragEnd` para distinguir entre arrastar tiers e arrastar itens
- Adicionado estado `draggingTierId` para rastrear qual tier está sendo arrastado
- Botão "Adicionar Tier" antes da área de itens não atribuídos

**Lógica de Reordenação**:
- Quando um tier é arrastado sobre outro tier, a ordem é atualizada
- O `tier_order` de todos os tiers é recalculado após a reordenação
- Usa `arrayMove` do @dnd-kit para reordenar o array

**Lógica de Remoção**:
- Ao remover um tier, todos os itens desse tier são movidos para "unassigned"
- Os tiers restantes são reordenados (tier_order atualizado)

## Fluxo de Dados

```
TierListEditor (estado: tiers[])
    ↓
TierRow (gerencia drag and drop do tier)
    ↓
TierColumn (exibe tier + itens, gerencia edição)
    ↓
ItemCard (itens arrastáveis)
```

## Dependências Utilizadas

- `@dnd-kit/core`: Gerenciamento de drag and drop
- `@dnd-kit/sortable`: Funcionalidade de ordenação
- `lucide-react`: Ícones (Trash2, Plus, GripVertical)
- `uuid`: Geração de IDs únicos para novos tiers

## Melhorias de UX

1. **Layout Horizontal**: Tier visível à esquerda, itens à direita - mais intuitivo
2. **Edição Inline**: Nome e cor editáveis diretamente no tier
3. **Feedback Visual**: 
   - Hover mostra o handle de arraste
   - Opacity durante arraste
   - Border destacado quando item está sobre o tier
4. **Ações Rápidas**: Botões de adicionar/remover tiers facilmente acessíveis
5. **Reordenação Intuitiva**: Arraste tiers para reordenar, similar a listas modernas

## Testes Realizados

- ✅ Build TypeScript sem erros
- ✅ Linter sem erros
- ✅ Layout responsivo (mobile, tablet, desktop)
- ✅ Drag and drop de itens funciona
- ✅ Drag and drop de tiers funciona
- ✅ Edição de nome e cor funciona
- ✅ Adicionar/remover tiers funciona

## Próximos Passos Sugeridos

1. Adicionar validação para evitar tiers com nomes duplicados
2. Adicionar confirmação antes de remover tier (se tiver itens)
3. Adicionar atalhos de teclado para ações comuns
4. Melhorar acessibilidade (ARIA labels, keyboard navigation)
5. Adicionar animações suaves para transições

