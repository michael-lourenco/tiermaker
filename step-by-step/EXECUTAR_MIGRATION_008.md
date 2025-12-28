# Executar Migration 008 - Adicionar image_url em categories

## Problema
Erro: `Could not find the 'image_url' column of 'categories' in the schema cache`

## Solução

### Passo 1: Acesse o Supabase Dashboard
1. Vá para [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Faça login na sua conta
3. Selecione seu projeto

### Passo 2: Abra o SQL Editor
1. No menu lateral, clique em **SQL Editor**
2. Clique em **New Query**

### Passo 3: Execute a Migration
1. Copie e cole o seguinte SQL:

```sql
-- ============================================
-- MIGRATION: Adicionar campo image_url em categories
-- ============================================

-- Adicionar coluna image_url na tabela categories
ALTER TABLE categories 
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Criar índice para melhorar performance em buscas por image_url
CREATE INDEX IF NOT EXISTS idx_categories_image_url ON categories(image_url) WHERE image_url IS NOT NULL;
```

2. Clique em **Run** (ou pressione Ctrl+Enter / Cmd+Enter)
3. Aguarde a confirmação de sucesso

### Passo 4: Verificar
Execute esta query para verificar se a coluna foi criada:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'categories' 
AND table_schema = 'public'
ORDER BY ordinal_position;
```

Você deve ver a coluna `image_url` do tipo `text` na lista.

### Passo 5: Recarregar a Página
1. Volte para a aplicação
2. Recarregue a página `/admin/categories`
3. Tente editar uma categoria novamente

## Alternativa: Via Arquivo
Se preferir, você pode:
1. Abrir o arquivo `supabase/migrations/008_add_category_image.sql`
2. Copiar todo o conteúdo
3. Colar no SQL Editor do Supabase
4. Executar


