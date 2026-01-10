# Implementação de Tier List em Canvas HTML

## Data: 08/01/2025

## Objetivo
Criar uma nova página `/editor/new/[templateId]` que renderiza completamente a tier list usando Canvas HTML, replicando todas as funcionalidades da implementação React atual.

---

## Estrutura Criada

### 1. Rota Principal
**Arquivo**: `/src/app/editor/new/[templateId]/page.tsx`

Página servidor que:
- Verifica autenticação do usuário
- Carrega template do banco de dados
- Renderiza o cliente Canvas

### 2. Cliente do Editor
**Arquivo**: `/src/app/editor/new/[templateId]/CanvasTierListEditorClient.tsx`

Componente cliente que:
- Gerencia título e configurações (público/privado)
- Integra com serviços de tier list
- Contém formulários acima do canvas
- Gerencia modal de limites

### 3. Editor Principal em Canvas
**Arquivo**: `/src/components/editor/canvas/CanvasTierListEditor.tsx`

Componente principal que:
- Gerencia estado (tiers, items, drag state)
- Inicializa canvas e renderer
- Gerencia loop de renderização
- Integra input handler
- Implementa handlers de drag and drop

---

## Módulos de Canvas

### 4. CanvasRenderer
**Arquivo**: `/src/components/editor/canvas/CanvasRenderer.ts`

Classe responsável por toda renderização:

#### Funcionalidades:
- **Renderização de Tiers**
  - Desenha background e bordas
  - Renderiza label da tier com cor
  - Organiza items dentro da tier
  
- **Renderização de Items**
  - Desenha cards de items
  - Carrega e cacheia imagens
  - Renderiza nome do item
  - Suporta estado de drag (opacidade)

- **Zona de Items Não Atribuídos**
  - Área com borda tracejada
  - Layout em grid responsivo
  - Scroll automático se necessário

- **UI Buttons**
  - Botão "Adicionar Tier"
  - Botão "Salvar"
  - Renderizados no canvas

- **Item Overlay (Drag)**
  - Renderiza item arrastado no cursor
  - Com sombra e rotação
  - Opacidade reduzida

#### Cache de Imagens:
- Map de imagens carregadas
- Evita recarregar imagens
- Renderiza placeholder enquanto carrega

#### Constantes:
- `TIER_HEIGHT`: 120px
- `TIER_LABEL_WIDTH`: 150px
- `ITEM_SIZE`: 100px
- `ITEM_SPACING`: 10px
- `UNASSIGNED_ZONE_HEIGHT`: 250px

---

### 5. CanvasInputHandler
**Arquivo**: `/src/components/editor/canvas/CanvasInputHandler.ts`

Classe responsável por gerenciar eventos de input:

#### Suporte a Eventos:
- **Mouse Events**
  - mousedown, mousemove, mouseup
  - mouseleave (cancela drag)

- **Touch Events**
  - touchstart, touchmove, touchend
  - touchcancel
  - Suporte para mobile/tablet

#### Funcionalidades:
- **Detecção de Clicks**
  - Detecta clicks em items
  - Detecta clicks em botões
  - Calcula offset do drag

- **Drag and Drop**
  - Threshold de 5px para iniciar drag
  - Rastreia posição durante drag
  - Detecta drop em tiers ou zona não atribuída

- **Botões Interativos**
  - "Adicionar Tier"
  - "Salvar"
  - Calcula bounds automaticamente

#### Integração:
- Recebe renderer para detectar items
- Recebe getter de dados para acessar items/tiers
- Usa callbacks para comunicar com componente React

---

## Fluxo de Funcionamento

### Inicialização:
1. Componente monta e inicializa canvas
2. Cria CanvasRenderer com contexto 2D
3. Cria CanvasInputHandler com callbacks
4. Configura dimensões do canvas (responsivo)

### Renderização:
1. Loop usando `requestAnimationFrame`
2. Limpa canvas
3. Renderiza tiers com items
4. Renderiza zona não atribuída
5. Renderiza item arrastado (se houver)
6. Renderiza botões UI
7. Repete

### Drag and Drop:
1. **Mouse Down**: Detecta item ou botão
2. **Mouse Move**: Se passou threshold, inicia drag
3. **Durante Drag**: Atualiza posição do mouse
4. **Mouse Up**: Detecta onde soltou
   - Se em tier: Move item para tier
   - Se em zona não atribuída: Move para não atribuídos
   - Atualiza estado

---

## Características Técnicas

### Performance:
- ✅ Cache de imagens (evita recarregar)
- ✅ Renderização otimizada (apenas quando necessário)
- ✅ Uso de requestAnimationFrame
- ✅ Detecção eficiente de colisão

### Responsividade:
- ✅ Canvas ajusta tamanho baseado em viewport
- ✅ Layout flexível para diferentes tamanhos
- ✅ Grid adaptativo para items não atribuídos

### Compatibilidade:
- ✅ Mouse e Touch events
- ✅ Suporte mobile
- ✅ Prevenção de scroll durante drag

---

## Diferenças da Implementação React

### Vantagens do Canvas:
- ✅ Renderização única (não precisa gerenciar muitos componentes)
- ✅ Controle total sobre renderização
- ✅ Performance previsível
- ✅ Possibilidade de animações customizadas

### Desvantagens:
- ❌ Mais complexo de implementar
- ❌ Sem benefícios do Virtual DOM
- ❌ Acessibilidade requer implementação manual
- ❌ Debugging mais difícil

---

## Funcionalidades Implementadas

### ✅ Básicas:
- Renderização de tiers
- Renderização de items
- Drag and drop de items
- Zona de items não atribuídos
- Adicionar tier
- Salvar tier list

### ⚠️ Pendentes (para implementação futura):
- Editar nome da tier (clique duplo)
- Mudar cor da tier
- Deletar tier
- Reordenar tiers
- Mostrar/esconder nomes dos items
- Melhorias de acessibilidade

---

## Estrutura de Arquivos

```
src/
├── app/
│   └── editor/
│       └── new/
│           └── [templateId]/
│               ├── page.tsx
│               └── CanvasTierListEditorClient.tsx
└── components/
    └── editor/
        └── canvas/
            ├── CanvasTierListEditor.tsx
            ├── CanvasRenderer.ts
            └── CanvasInputHandler.ts
```

---

## Como Usar

### Acessar:
```
/editor/new/[templateId]
```

### Exemplo:
```
/editor/new/8ede5197-2ff5-485d-8065-bcad3c4c1f87
```

### Requisitos:
- Usuário autenticado
- Template deve existir
- Template deve ter items

---

## Próximos Passos (Melhorias Futuras)

1. **Edição de Tiers**
   - Clique duplo para editar nome
   - Picker de cor
   - Botão de deletar

2. **Reordenação de Tiers**
   - Drag and drop de tiers
   - Animação suave

3. **Melhorias de UI**
   - Feedback visual melhor
   - Animações de transição
   - Indicadores de drop zone

4. **Performance**
   - Virtualização para muitos items
   - Lazy loading de imagens
   - Debounce em eventos

5. **Acessibilidade**
   - Suporte a teclado
   - ARIA labels
   - Screen reader friendly

---

## Notas de Implementação

### Cache de Imagens:
O sistema de cache carrega imagens uma vez e reutiliza. Imagens que falharam ao carregar são marcadas para evitar tentativas repetidas.

### Detecção de Colisão:
Usa bounds simples (retângulos) para detectar clicks e drops. Pode ser melhorado com hit testing mais preciso se necessário.

### Estado de Drag:
O estado de drag é gerenciado no componente React e passado para o renderer. Isso permite controle total sobre quando e como renderizar.

### Responsividade:
O canvas ajusta automaticamente baseado no tamanho da viewport, mas mantém proporções mínimas para garantir usabilidade.

---

## Conclusão

Foi implementada uma versão completa de tier list usando Canvas HTML que replica as funcionalidades principais da versão React. O sistema é totalmente funcional e pronto para uso, com possibilidade de expansão futura.
