# Implementação de Tiers Padrão para Templates

## Data: 2026-01-07

## Objetivo
Permitir que templates tenham tiers padrão (nomes e cores) pré-configurados que são usados quando alguém cria uma tier list a partir do template. O usuário pode visualizar e manipular essas tiers durante a criação do template.

## Requisitos
1. Na criação do template, poder adicionar tiers com nomes e cores
2. Exibir as tiers visualmente durante a criação
3. Salvar as tiers junto com o template
4. Quando criar tier list, usar as tiers do template como padrão (mas permitir alteração)

## Alterações Realizadas

### 1. Migration: `supabase/migrations/014_add_template_tiers.sql`

**Nova tabela `template_tiers`:**
- `id`: UUID (PK)
- `template_id`: UUID (FK para templates)
- `tier_name`: TEXT (nome da tier)
- `tier_order`: INTEGER (ordem da tier)
- `color`: TEXT (cor da tier, opcional)
- `created_at`: TIMESTAMP

**Índices:**
- `idx_template_tiers_template_id`: Para buscar tiers por template
- `idx_template_tiers_order`: Para ordenar tiers corretamente

**RLS Policies:**
- SELECT: Usuários podem ver tiers de templates públicos ou seus próprios templates
- ALL: Usuários podem gerenciar tiers de seus próprios templates

### 2. Tipos TypeScript: `src/types/template.types.ts`

**Novas interfaces:**
```typescript
export interface TemplateTier {
  id: string
  template_id: string
  tier_name: string
  tier_order: number
  color: string | null
  created_at: string
}

export interface CreateTemplateInput {
  // ... campos existentes
  tiers?: Array<{ tier_name: string; tier_order: number; color: string | null }>
}

export interface TemplateWithTiers extends TemplateWithItems {
  tiers?: TemplateTier[]
}
```

### 3. Componente: `src/components/templates/TemplateTiersVisualEditor.tsx` (Novo)

**Funcionalidades:**
- Exibe tiers visualmente IGUAL ao editor de tier list (`/editor/[templateId]`)
- Usa os mesmos componentes `TierRow` e `TierColumn` do editor
- Drag and drop para reordenar tiers
- Editar nome da tier (textarea inline)
- Editar cor da tier (color picker no lado direito)
- Deletar tiers (botão trash)
- Adicionar novas tiers
- Tiers padrão (S, A, B, C, D) pré-preenchidas automaticamente

**Interface Visual:**
- Linhas de tiers exibidas como no editor
- Mesmo layout e comportamento
- Drag and drop funcional
- Edição inline de nomes e cores

### 4. Formulário de Criação: `src/components/templates/CreateTemplateForm.tsx`

**Alterações:**
- Adicionado estado `tiers` inicializado com tiers padrão (S, A, B, C, D)
- Novo Card "Tiers Padrão" com `TemplateTiersVisualEditor`
- Envio de tiers na requisição de criação

**Inicialização com tiers padrão:**
```typescript
const [tiers, setTiers] = useState<TemplateTier[]>(
  DEFAULT_TIERS.map((name, index) => ({
    id: `tier-${name}-${Date.now()}-${index}`,
    tier_name: name,
    tier_order: index,
    color: TIER_COLORS[name] || null,
  }))
)

// No onSubmit:
const tiersToSend = tiers.map((tier) => ({
  tier_name: tier.tier_name,
  tier_order: tier.tier_order,
  color: tier.color,
}))
```

### 5. Formulário de Edição: `src/components/templates/EditTemplateForm.tsx`

**Alterações:**
- Adicionado estado `tiers` para gerenciar tiers do template
- Carregamento de tiers existentes do template
- Novo Card "Tiers Padrão" com `TemplateTiersVisualEditor`
- Se template não tem tiers, inicializa com tiers padrão (S, A, B, C, D)
- Envio de tiers na atualização

**Carregamento de tiers:**
```typescript
if ('tiers' in template && template.tiers && Array.isArray(template.tiers)) {
  const existingTiers: TemplateTier[] = template.tiers.map((tier: any) => ({
    id: tier.id,
    tier_name: tier.tier_name,
    tier_order: tier.tier_order,
    color: tier.color,
  }))
  setTiers(existingTiers)
}
```

### 6. Service: `src/services/template.service.ts`

**Método `createTemplate`:**
- Salva tiers na tabela `template_tiers` após criar template e items
- Tiers são opcionais (só salva se fornecidos)

**Método `getTemplateById`:**
- Busca tiers do template junto com items e categories
- Retorna tiers ordenados por `tier_order`
- Tratamento de erro gracioso se tabela não existir

**Método `updateTemplateComplete`:**
- Deleta todas as tiers existentes
- Insere novas tiers fornecidas
- Permite remover todas as tiers (passando array vazio)

### 7. API Route: `src/app/api/templates/create/route.ts`

**Alterações:**
- Aceita `tiers` no body da requisição
- Passa tiers para `templateService.createTemplate`

### 8. Editor de Tier List: `src/app/editor/[templateId]/TierListEditorClient.tsx`

**Alterações:**
- Recebe `tiers` do template como prop
- Converte tiers do template para formato `TierListTier`
- Passa como `initialTiers` para `TierListEditor`

**Conversão:**
```typescript
initialTiers={
  template.tiers && Array.isArray(template.tiers) && template.tiers.length > 0
    ? template.tiers.map((tier) => ({
        id: `tier-${tier.id}`,
        tier_list_id: '',
        tier_name: tier.tier_name,
        tier_order: tier.tier_order,
        color: tier.color,
        created_at: tier.created_at,
      }))
    : undefined
}
```

## Fluxo de Uso

### Criar Template com Tiers:
1. Usuário acessa `/create-template`
2. Preenche informações básicas (nome, descrição, categoria)
3. Adiciona items do template
4. **NOVO**: Configura tiers padrão (nome e cor)
5. Salva template
6. Tiers são salvas junto com o template

### Criar Tier List a partir de Template:
1. Usuário acessa `/editor/[templateId]`
2. Sistema busca template com tiers
3. **NOVO**: Se template tem tiers, elas são carregadas como `initialTiers`
4. Usuário pode editar/adicionar/remover tiers se quiser
5. Usuário organiza items nas tiers
6. Salva tier list

### Editar Template:
1. Usuário acessa `/edit-template/[id]`
2. Sistema carrega template com tiers existentes
3. **NOVO**: Tiers são exibidas no `TemplateTiersEditor`
4. Usuário pode editar/adicionar/remover tiers
5. Salva alterações

## Estrutura de Dados

### TemplateTier (no banco):
```sql
CREATE TABLE template_tiers (
  id UUID PRIMARY KEY,
  template_id UUID REFERENCES templates(id),
  tier_name TEXT NOT NULL,
  tier_order INTEGER NOT NULL,
  color TEXT,
  created_at TIMESTAMP
);
```

### TemplateTier (no frontend):
```typescript
interface TemplateTier {
  id: string
  tier_name: string
  tier_order: number
  color: string | null
}
```

## Arquivos Criados/Modificados

### Criados:
1. `supabase/migrations/014_add_template_tiers.sql` - Migration
2. `src/components/templates/TemplateTiersVisualEditor.tsx` - Componente visual de edição de tiers (usa TierRow/TierColumn)

### Modificados:
1. `src/types/template.types.ts` - Tipos adicionados
2. `src/components/templates/CreateTemplateForm.tsx` - Interface de tiers
3. `src/components/templates/EditTemplateForm.tsx` - Edição de tiers
4. `src/services/template.service.ts` - Salvar/buscar tiers
5. `src/app/api/templates/create/route.ts` - Aceitar tiers
6. `src/app/editor/[templateId]/TierListEditorClient.tsx` - Usar tiers do template

## Benefícios

1. **Experiência do Usuário**: Templates podem ter tiers pré-configuradas, facilitando criação de tier lists
2. **Consistência**: Tiers padrão garantem que tier lists criadas a partir do mesmo template tenham estrutura similar
3. **Flexibilidade**: Usuário ainda pode editar/adicionar/remover tiers ao criar tier list
4. **Visual**: Cores pré-configuradas tornam as tier lists mais atraentes desde o início

## Testes Recomendados

1. **Criar template com tiers:**
   - Adicionar múltiplas tiers
   - Definir nomes e cores
   - Reordenar tiers
   - Salvar e verificar no banco

2. **Criar tier list com tiers do template:**
   - Criar template com tiers
   - Criar tier list a partir do template
   - Verificar que tiers aparecem pré-configuradas
   - Editar tiers e verificar que funciona

3. **Editar template:**
   - Editar tiers existentes
   - Adicionar novas tiers
   - Remover tiers
   - Salvar e verificar

4. **Template sem tiers:**
   - Criar template sem tiers
   - Verificar que tier list usa tiers padrão (S, A, B, C, D)

5. **RLS e Permissões:**
   - Verificar que usuários só veem tiers de templates públicos ou seus próprios
   - Verificar que usuários só podem editar tiers de seus próprios templates
