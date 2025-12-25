# Migração para Sistema de Categorias

## Data: 2025-01-XX

## Objetivo
Reformular o sistema de categorias de templates, substituindo o campo `category` (string) e `tags` (array) por um sistema robusto de categorias com tabela dedicada e relacionamento many-to-many.

## Mudanças Implementadas

### 1. Banco de Dados

#### Migration 003: `supabase/migrations/003_add_categories.sql`
- Cria tabela `categories` com campos: id, name, slug, description, icon
- Cria tabela `template_categories` (many-to-many) para relacionar templates e categorias
- Migra dados existentes de `category` para o novo sistema
- Remove colunas `category` e `tags` da tabela `templates`
- Insere categorias padrão (Games, Anime, Movies, Music, Sports, Food, Characters, Other)

#### Migration 004: `supabase/migrations/004_categories_rls.sql`
- RLS policies para `categories`: todos podem ver, autenticados podem criar/atualizar/deletar
- RLS policies para `template_categories`: todos podem ver, usuários podem gerenciar associações de seus próprios templates

### 2. Tipos TypeScript

#### `src/types/category.types.ts` (NOVO)
- `Category`: interface para categoria
- `TemplateCategory`: interface para relacionamento
- `CategoryWithCount`: categoria com contagem de templates

#### `src/types/template.types.ts` (ATUALIZADO)
- Removido `category: string` e `tags: string[]` de `Template`
- Adicionado `categories?: Category[]` em `TemplateWithItems`
- `CreateTemplateInput` agora usa `category_ids: string[]` em vez de `category` e `tags`

### 3. Serviços

#### `src/services/category.service.ts` (NOVO)
- `getAllCategories()`: busca todas as categorias
- `getCategoriesWithCount()`: busca categorias com contagem de templates
- `getCategoryBySlug()`: busca categoria por slug
- `getCategoryById()`: busca categoria por ID
- `createCategory()`: cria nova categoria
- `getOrCreateCategory()`: busca ou cria categoria (útil para forms)

#### `src/services/template.service.ts` (ATUALIZADO)
- `getPublicTemplates()`: agora filtra por `category_id` ou `category_slug` usando join
- `getTemplateById()`: agora retorna templates com suas categorias
- `createTemplate()`: agora aceita `category_ids` e cria associações
- `updateTemplate()`: agora aceita `categoryIds` opcional para atualizar categorias

### 4. Componentes e Páginas

#### `src/components/templates/TemplateCard.tsx` (ATUALIZADO)
- Agora recebe `TemplateWithItems` em vez de `Template`
- Mostra múltiplas categorias como badges em vez de uma única categoria

#### `src/app/page.tsx` (ATUALIZADO)
- Busca templates completos com categorias
- Mostra categorias como badges

#### `src/app/(public)/templates/[id]/page.tsx` (ATUALIZADO)
- Mostra categorias em vez de category e tags

#### `src/components/templates/CreateTemplateForm.tsx` (PENDENTE)
- Precisa ser atualizado para:
  - Carregar categorias do banco
  - Permitir seleção múltipla de categorias
  - Permitir criar nova categoria se não existir
  - Enviar `category_ids` em vez de `category` e `tags`

## Próximos Passos

1. ✅ Criar migrations
2. ✅ Criar tipos TypeScript
3. ✅ Criar CategoryService
4. ✅ Atualizar TemplateService
5. ✅ Atualizar componentes de visualização
6. ⏳ Atualizar CreateTemplateForm
7. ⏳ Atualizar página de templates para mostrar categorias primeiro
8. ⏳ Executar migrations no Supabase

## Como Executar as Migrations

1. Acesse o Supabase Dashboard
2. Vá em SQL Editor
3. Execute `supabase/migrations/003_add_categories.sql`
4. Execute `supabase/migrations/004_categories_rls.sql`
5. Verifique se as tabelas foram criadas corretamente

## Notas Importantes

- A migration migra automaticamente dados existentes de `category` para o novo sistema
- Categorias padrão são criadas automaticamente
- O sistema suporta múltiplas categorias por template (many-to-many)
- Categorias podem ser criadas dinamicamente pelos usuários

