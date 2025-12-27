# Sistema de Administração de Categorias

## Data: 2025-01-XX

## Objetivo
Criar uma área de administração para gerenciar categorias do sistema, permitindo criar, editar e excluir categorias com upload de imagens. Apenas o usuário com email "kontempler@gmail.com" pode acessar esta área.

## Mudanças Implementadas

### 1. Banco de Dados

#### Migration 008: `supabase/migrations/008_add_category_image.sql`
- Adiciona coluna `image_url` na tabela `categories` para armazenar URL da imagem da categoria
- Cria índice para melhorar performance em buscas por `image_url`

### 2. Tipos TypeScript

#### `src/types/category.types.ts` (ATUALIZADO)
- Adicionado campo `image_url: string | null` na interface `Category`

#### `src/services/category.service.ts` (ATUALIZADO)
- Adicionadas interfaces `CreateCategoryInput` e `UpdateCategoryInput`
- Adicionado campo `image_url` na interface `Category`
- Adicionados métodos:
  - `getCategoryById(id: string)`: Busca categoria por ID
  - `createCategory(input: CreateCategoryInput)`: Cria nova categoria
  - `updateCategory(id: string, input: UpdateCategoryInput)`: Atualiza categoria existente
  - `deleteCategory(id: string)`: Exclui categoria
  - Método privado `generateSlug(name: string)`: Gera slug a partir do nome

### 3. Utilitários de Administração

#### `src/lib/utils/admin.ts` (NOVO)
- Função `isAdminEmail(email: string | null | undefined)`: Verifica se um email é de admin
- Função `isAdmin(supabase: any)`: Verifica se o usuário atual é admin (server-side)
- Constante `ADMIN_EMAIL = 'kontempler@gmail.com'`

### 4. Páginas

#### `src/app/admin/categories/page.tsx` (NOVO)
- Página server-side que verifica autenticação e permissões de admin
- Redireciona para `/login` se não autenticado
- Redireciona para `/` se não for admin
- Carrega categorias e passa para o componente cliente

### 5. Componentes

#### `src/components/admin/AdminCategoriesPageClient.tsx` (NOVO)
- Componente cliente para gerenciar categorias
- Lista todas as categorias em grid
- Exibe imagem, nome e descrição de cada categoria
- Botões para criar, editar e excluir categorias
- Integra com `CategoryFormDialog` para criar/editar
- Integra com `ImageService` para upload de imagens

#### `src/components/admin/CategoryFormDialog.tsx` (NOVO)
- Dialog modal para criar/editar categorias
- Campos: nome (obrigatório), descrição (opcional), imagem (opcional)
- Preview de imagem antes de salvar
- Validação de arquivo de imagem
- Integra com `ImageService` para upload

### 6. Navegação

#### `src/components/layout/Header.tsx` (ATUALIZADO)
- Adicionado link "Admin" no menu para usuários admin
- Link aparece apenas se `isAdminEmail(user.email)` retornar `true`
- Link aponta para `/admin/categories`

## Funcionalidades

### Criar Categoria
1. Acessar `/admin/categories` (apenas admin)
2. Clicar em "Nova Categoria"
3. Preencher nome (obrigatório), descrição (opcional)
4. Fazer upload de imagem (opcional)
5. Salvar

### Editar Categoria
1. Acessar `/admin/categories`
2. Clicar em "Editar" na categoria desejada
3. Modificar campos desejados
4. Trocar imagem se necessário
5. Salvar

### Excluir Categoria
1. Acessar `/admin/categories`
2. Clicar em "Excluir" na categoria desejada
3. Confirmar exclusão
4. Categoria é removida do banco de dados

## Segurança

- Verificação de autenticação no servidor
- Verificação de permissão de admin baseada em email
- Redirecionamento automático se não autorizado
- Apenas usuário com email "kontempler@gmail.com" pode acessar

## Arquivos Criados/Modificados

### Criados:
- `supabase/migrations/008_add_category_image.sql`
- `src/lib/utils/admin.ts`
- `src/app/admin/categories/page.tsx`
- `src/components/admin/AdminCategoriesPageClient.tsx`
- `src/components/admin/CategoryFormDialog.tsx`
- `step-by-step/ADMIN_CATEGORIES.md`

### Modificados:
- `src/types/category.types.ts`
- `src/services/category.service.ts`
- `src/components/layout/Header.tsx`

## Próximos Passos (Opcional)

- Adicionar paginação se houver muitas categorias
- Adicionar busca/filtro de categorias
- Adicionar validação de tamanho máximo de imagem
- Adicionar preview de imagem antes de excluir
- Adicionar confirmação visual ao salvar

