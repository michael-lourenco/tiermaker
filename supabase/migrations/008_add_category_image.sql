-- ============================================
-- MIGRATION: Adicionar campo image_url em categories
-- ============================================

-- Adicionar coluna image_url na tabela categories
ALTER TABLE categories 
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Criar índice para melhorar performance em buscas por image_url
CREATE INDEX IF NOT EXISTS idx_categories_image_url ON categories(image_url) WHERE image_url IS NOT NULL;

