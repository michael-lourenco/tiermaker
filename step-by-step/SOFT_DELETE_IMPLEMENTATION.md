# Implementação: Soft Delete + Reference Counting para Templates

## 📋 Resumo

Implementação das soluções **A (Soft Delete)** e **B (Reference Counting)** em conjunto para proteger tier lists quando templates são deletados.

## 🎯 Problema Resolvido

**Antes:**
- Ao deletar um template público, todas as tier lists que o usavam eram deletadas em cascata (`ON DELETE CASCADE`)
- As imagens do template eram deletadas do S3, quebrando tier lists de outros usuários
- Perda de dados dos usuários que criaram tier lists baseadas em templates públicos

**Depois:**
- Templates com tier lists ativas são **soft deleted** (marcados como deletados, mas mantidos no banco)
- Templates sem tier lists são **hard deleted** (deletados completamente, incluindo imagens)
- Tier lists continuam funcionando mesmo após o template ser deletado
- Imagens são preservadas quando há tier lists usando o template

## 🔧 Implementação Técnica

### 1. Migration do Banco de Dados

**Arquivo:** `supabase/migrations/006_add_soft_delete_templates.sql`

- Adiciona coluna `deleted_at TIMESTAMP WITH TIME ZONE` na tabela `templates`
- Cria índice para performance: `idx_templates_deleted_at`
- Cria índice para contagem: `idx_tier_lists_template_id_count`

### 2. TemplateService - Novos Métodos

**Arquivo:** `src/services/template.service.ts`

#### `countTierListsUsingTemplate(templateId: string): Promise<number>`
- Conta quantas tier lists estão usando um template específico
- Usado para decidir entre soft delete ou hard delete

#### `deleteTemplate(templateId: string, userId: string): Promise<{ deleted: boolean, softDeleted: boolean, tierListsCount: number }>`
- **Lógica:**
  1. Verifica se template existe e se usuário é o dono
  2. Conta tier lists usando o template (Reference Counting)
  3. **Se `tierListsCount > 0`:**
     - Soft delete: Marca `deleted_at` com timestamp atual
     - **NÃO deleta imagens do S3** (preservadas para tier lists)
  4. **Se `tierListsCount === 0`:**
     - Hard delete: Deleta imagens do S3 e remove registro do banco

#### `restoreTemplate(templateId: string, userId: string): Promise<Template>`
- Restaura um template soft-deleted
- Define `deleted_at = NULL`

### 3. Filtros em Queries

Todas as queries de templates foram atualizadas para filtrar templates soft-deleted:

- `getPublicTemplates()`: Filtra `deleted_at IS NULL`
- `getTemplateById()`: Aceita parâmetro `includeDeleted` para operações internas
- `getUserTemplates()`: Filtra `deleted_at IS NULL`

### 4. Atualização da UI

**Arquivo:** `src/components/templates/MyTemplatesPageClient.tsx`

- Modal de confirmação agora mostra aviso sobre tier lists
- Tratamento do retorno de `deleteTemplate()` para distinguir soft/hard delete
- Mensagens de sucesso diferenciadas

### 5. Traduções

**Arquivos:** `src/lib/i18n/translations/en.json` e `pt.json`

Novas chaves adicionadas:
- `templates.deleteWarning`: Aviso sobre tier lists
- `templates.softDeleted`: Mensagem quando template é soft deleted
- `templates.hardDeleted`: Mensagem quando template é hard deleted

## 📊 Fluxo de Exclusão

```
Usuário clica em "Deletar Template"
         ↓
Verifica ownership
         ↓
Conta tier lists usando o template
         ↓
    ┌────┴────┐
    │         │
tierLists > 0  tierLists === 0
    │         │
    ↓         ↓
SOFT DELETE  HARD DELETE
    │         │
    │         ├─> Deleta imagens do S3
    │         └─> Remove registro do banco
    │
    └─> Marca deleted_at = NOW()
        └─> Mantém imagens no S3
        └─> Tier lists continuam funcionando
```

## ✅ Benefícios

1. **Proteção de Dados:** Tier lists não são perdidas quando templates são deletados
2. **Otimização de Armazenamento:** Imagens só são deletadas quando não há mais referências
3. **Flexibilidade:** Templates podem ser restaurados se necessário
4. **Transparência:** Usuário é informado sobre o impacto da exclusão
5. **Escalabilidade:** Sistema preparado para múltiplos usuários sem perda de dados

## 🔄 Próximos Passos (Opcional)

1. **Dashboard de Templates Deletados:** Permitir que criadores vejam e restaurem templates soft-deleted
2. **Limpeza Automática:** Job para hard delete templates soft-deleted há mais de X dias (se não houver tier lists)
3. **Notificações:** Avisar usuários quando templates que usam são soft-deleted
4. **Estatísticas:** Mostrar quantas tier lists usam um template antes de deletar

## 📝 Notas Importantes

- Templates soft-deleted **não aparecem** em buscas públicas
- Templates soft-deleted **ainda podem ser acessados** via ID direto (para tier lists funcionarem)
- Imagens do S3 são **preservadas** em soft delete para manter tier lists funcionando
- A constraint `ON DELETE CASCADE` em `tier_lists.template_id` **não é mais um problema** porque templates não são fisicamente deletados quando há tier lists



