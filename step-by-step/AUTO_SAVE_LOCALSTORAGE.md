# Implementação de Auto-Save com localStorage

## Data: 08/01/2025

## Objetivo
Implementar sistema de salvamento automático no localStorage para prevenir perda de progresso durante a criação de tier lists. O sistema salva automaticamente após cada alteração e permite recuperar o estado ao retornar à página.

---

## Problemas Resolvidos

1. ✅ **Perda ao fechar aba**: Progresso salvo no localStorage
2. ✅ **Perda por erro/conexão**: Estado recuperável ao recarregar
3. ✅ **Limpar rascunho**: Botão para descartar alterações e recomeçar
4. ✅ **Limpar após salvar**: Draft removido após salvamento bem-sucedido

---

## Arquivos Criados

### 1. Hook de Gerenciamento de Draft
**Arquivo**: `/src/hooks/useTierListDraft.ts`

**Funcionalidades**:
- Carrega draft do localStorage na inicialização
- Salva draft com debounce (300ms) após alterações
- Limpa draft quando necessário
- Valida estrutura de dados antes de carregar
- Gerencia timestamp da última modificação

**Chave do localStorage**: `tier-list-draft-{templateId}-{userId}`

**Estrutura de dados**:
```typescript
interface TierListDraft {
  templateId: string
  userId: string
  title: string
  isPublic: boolean
  showItemNames: boolean
  tiers: Array<{
    id: string
    tier_name: string
    tier_order: number
    color: string | null
  }>
  items: Array<{
    template_item_id: string
    tier_name: string
    order: number
  }>
  lastModified: number // timestamp
}
```

**Métodos principais**:
- `loadDraft()`: Carrega draft do localStorage
- `saveDraft()`: Salva draft imediatamente
- `saveDraftDebounced()`: Salva com debounce (300ms)
- `clearDraft()`: Remove draft do localStorage
- `hasDraft`: Indica se existe draft salvo

---

### 2. Componente de Botão Limpar
**Arquivo**: `/src/components/editor/ClearDraftButton.tsx`

**Funcionalidades**:
- Botão que aparece apenas quando há draft
- Modal de confirmação antes de limpar
- Mostra timestamp da última modificação
- Estilo destrutivo (vermelho)

**Mensagem de confirmação**:
"Tem certeza que deseja descartar todas as alterações e voltar do início?"

---

## Arquivos Modificados

### 3. TierListEditorClient.tsx
**Arquivo**: `/src/app/editor/[templateId]/TierListEditorClient.tsx`

**Modificações**:

1. **Integração do Hook**:
   - Importa `useTierListDraft`
   - Carrega draft na inicialização
   - Usa draft para estado inicial se disponível

2. **Estado Inicial do Draft**:
   - `title`: Carrega do draft ou usa template.name
   - `isPublic`: Carrega do draft ou false
   - `showItemNames`: Carrega do draft ou usa preferência

3. **Função `getInitialTiers()`**:
   - Retorna tiers do draft se existir
   - Fallback para tiers do template

4. **Função `getInitialItems()`**:
   - Retorna items do draft se existir
   - Mapeia template_item_id para TemplateItem completo

5. **Callback `handleEditorChange()`**:
   - Chamado após cada alteração no editor
   - Salva draft com debounce (300ms)
   - Preserva IDs dos tiers

6. **Modificação em `handleSave()`**:
   - Limpa draft após salvamento bem-sucedido
   - Mantém draft se salvamento falhar

7. **Função `handleClearDraft()`**:
   - Limpa localStorage
   - Reseta estado para valores padrão
   - Force remount do TierListEditor (via key prop)

8. **Botão ClearDraftButton**:
   - Renderizado apenas se `hasDraft === true`
   - Mostra timestamp da última modificação

---

### 4. TierListEditor.tsx
**Arquivo**: `/src/components/editor/TierListEditor.tsx`

**Modificações**:

1. **Nova Prop `onChange`**:
   - Callback opcional chamado após alterações
   - Recebe tiers (com IDs) e items

2. **Função `notifyChange()`**:
   - Prepara dados no formato correto
   - Inclui todos os items (mesmo não atribuídos)
   - Preserva IDs dos tiers

3. **Chamadas de `notifyChange()` após**:
   - `handleDragEnd`: Após soltar item (com delay de 100ms)
   - `handleTierNameChange`: Após alterar nome
   - `handleTierColorChange`: Após alterar cor
   - `handleTierDelete`: Após deletar tier
   - `handleAddTier`: Após adicionar tier

4. **Delay de 100ms**:
   - Garante que estado React foi atualizado
   - Antes de notificar mudanças

---

## Fluxo de Funcionamento

### Inicialização:
1. Componente `TierListEditorClient` monta
2. Hook `useTierListDraft` verifica localStorage
3. Se draft existe e é válido:
   - Carrega título, isPublic, showItemNames
   - Carrega tiers e items
   - Aplica como estado inicial
4. Se não existe draft:
   - Usa valores padrão do template

### Durante Edição:
1. Usuário arrasta item → drop
2. `handleDragEnd` é chamado
3. Estado é atualizado (setItems, setTiers)
4. Após 100ms, `notifyChange()` é chamado
5. `handleEditorChange` no Client é executado
6. Após 300ms (debounce), `saveDraftDebounced` salva no localStorage
7. Timestamp é atualizado

### Alterações de Configuração:
1. Usuário muda título ou isPublic
2. useEffect detecta mudança
3. Salva draft com debounce (300ms)

### Ao Salvar:
1. Usuário clica "Salvar Tier List"
2. Dados são enviados para servidor
3. Se sucesso:
   - Draft é limpo do localStorage
   - Usuário é redirecionado
4. Se erro:
   - Draft permanece no localStorage
   - Usuário pode tentar novamente

### Ao Limpar:
1. Usuário clica "Limpar Rascunho"
2. Modal de confirmação aparece
3. Se confirmar:
   - Draft é removido do localStorage
   - Estado é resetado
   - TierListEditor é remontado (via key prop)
4. Se cancelar:
   - Nada acontece

---

## Estrutura de Dados no LocalStorage

### Chave:
```
tier-list-draft-{templateId}-{userId}
```

### Exemplo:
```
tier-list-draft-8ede5197-2ff5-485d-8065-bcad3c4c1f87-user123
```

### Valor (JSON):
```json
{
  "templateId": "8ede5197-2ff5-485d-8065-bcad3c4c1f87",
  "userId": "user123",
  "title": "Minha Tier List",
  "isPublic": false,
  "showItemNames": true,
  "tiers": [
    {
      "id": "tier-S-abc123",
      "tier_name": "S",
      "tier_order": 0,
      "color": "#FF6B6B"
    }
  ],
  "items": [
    {
      "template_item_id": "item1",
      "tier_name": "S",
      "order": 0
    },
    {
      "template_item_id": "item2",
      "tier_name": "",
      "order": 0
    }
  ],
  "lastModified": 1704758400000
}
```

---

## Tratamento de Erros

### Validação de Dados:
- Verifica estrutura básica antes de carregar
- Valida templateId e userId correspondem
- Remove draft corrompido automaticamente

### Erros de Armazenamento:
- Try-catch em todas operações de localStorage
- Log de erros no console
- Fallback gracioso (continua sem draft)

### Quota Excedida:
- Detecta erro `QuotaExceededError`
- Loga warning
- (Futuro: poderia implementar limpeza de drafts antigos)

---

## Características Técnicas

### Debounce:
- **300ms** após última alteração
- Evita muitas escritas no localStorage
- Melhora performance

### Delay de Notificação:
- **100ms** após atualização de estado
- Garante que React atualizou completamente
- Antes de notificar mudanças

### Preservação de IDs:
- IDs dos tiers são preservados
- Permite rastrear tiers mesmo após reordenação
- Importante para consistência

### Items Não Atribuídos:
- Items com `tier_name: ''` são salvos
- Permite restaurar lista completa de items não atribuídos
- Ordem é preservada

---

## Funcionalidades Implementadas

### ✅ Salvamento Automático:
- Após cada drag and drop
- Após alterar nome de tier
- Após alterar cor de tier
- Após adicionar/deletar tier
- Ao mudar título ou isPublic

### ✅ Recuperação Automática:
- Ao carregar página
- Restaura estado completo
- Inclui título, configurações, tiers e items

### ✅ Limpar Rascunho:
- Botão com modal de confirmação
- Reset completo do estado
- Remove do localStorage

### ✅ Limpar Após Salvar:
- Após salvamento bem-sucedido
- Não limpa se houver erro
- Permite retry sem perder progresso

### ✅ Feedback de Timestamp:
- Mostra quando foi última alteração
- Formato amigável (há X minutos/horas/dias)

---

## Melhorias Futuras (Opcional)

1. **Limpeza Automática de Drafts Antigos**
   - Remover drafts com mais de 30 dias
   - Ou quando localStorage estiver cheio

2. **Indicador Visual de Salvamento**
   - Badge "Salvando..." durante debounce
   - Badge "Salvo" após salvar
   - Fade out após 2 segundos

3. **Compressão de Dados**
   - Comprimir JSON antes de salvar
   - Descomprimir ao carregar
   - Reduz uso de espaço

4. **Backup Múltiplo**
   - Manter últimos 3 drafts
   - Permite recuperar versões anteriores
   - Rotação automática

5. **Sincronização entre Tabs**
   - BroadcastChannel API
   - Sincronizar draft entre abas abertas
   - Evita conflitos

---

## Testes Recomendados

### 1. Salvamento Básico:
- [ ] Criar tier list, fechar aba, reabrir → deve restaurar
- [ ] Mover items entre tiers → deve salvar automaticamente
- [ ] Alterar título → deve salvar automaticamente

### 2. Recuperação:
- [ ] Fechar durante edição → deve restaurar ao reabrir
- [ ] Recarregar página → deve manter estado
- [ ] Após erro de conexão → deve manter estado

### 3. Limpar Rascunho:
- [ ] Clicar "Limpar" → deve mostrar modal
- [ ] Confirmar limpeza → deve resetar tudo
- [ ] Cancelar limpeza → não deve fazer nada

### 4. Após Salvar:
- [ ] Salvar com sucesso → deve limpar draft
- [ ] Salvar com erro → deve manter draft
- [ ] Após salvar, criar nova → deve começar limpo

### 5. Múltiplos Templates:
- [ ] Criar draft em template A
- [ ] Criar draft em template B
- [ ] Ambos devem ser independentes

### 6. Múltiplos Usuários:
- [ ] Usuário A cria draft
- [ ] Usuário B não vê draft de A
- [ ] Cada usuário tem seu próprio draft

---

## Conclusão

Sistema completo de auto-save implementado com sucesso:

✅ **Hook de gerenciamento** (`useTierListDraft`)
✅ **Componente de limpeza** (`ClearDraftButton`)
✅ **Integração no Client** (`TierListEditorClient`)
✅ **Notificação de mudanças** (`TierListEditor`)

Todas as funcionalidades solicitadas foram implementadas e o sistema está pronto para uso. O progresso do usuário está protegido contra perda acidental.
