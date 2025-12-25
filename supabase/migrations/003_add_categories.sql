-- ============================================
-- MIGRATION: Adicionar sistema de categorias
-- ============================================
-- Esta migration:
-- 1. Cria a tabela categories
-- 2. Cria a tabela template_categories (many-to-many)
-- 3. Migra dados existentes (se houver)
-- 4. Remove colunas category e tags da tabela templates

-- ============================================
-- PARTE 1: Criar tabela categories
-- ============================================

CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- PARTE 2: Criar tabela template_categories (many-to-many)
-- ============================================

CREATE TABLE IF NOT EXISTS template_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID NOT NULL REFERENCES templates(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(template_id, category_id)
);

-- ============================================
-- PARTE 3: Migrar dados existentes
-- ============================================

-- Criar categorias a partir dos valores únicos de category existentes
INSERT INTO categories (name, slug)
SELECT DISTINCT 
  category as name,
  LOWER(REGEXP_REPLACE(category, '[^a-zA-Z0-9]+', '-', 'g')) as slug
FROM templates
WHERE category IS NOT NULL
ON CONFLICT (slug) DO NOTHING;

-- Associar templates às categorias migradas
INSERT INTO template_categories (template_id, category_id)
SELECT 
  t.id as template_id,
  c.id as category_id
FROM templates t
INNER JOIN categories c ON LOWER(REGEXP_REPLACE(t.category, '[^a-zA-Z0-9]+', '-', 'g')) = c.slug
ON CONFLICT (template_id, category_id) DO NOTHING;

-- ============================================
-- PARTE 4: Remover colunas antigas
-- ============================================

-- Remover índice antigo
DROP INDEX IF EXISTS idx_templates_category;

-- Remover coluna category
ALTER TABLE templates DROP COLUMN IF EXISTS category;

-- Remover coluna tags
ALTER TABLE templates DROP COLUMN IF EXISTS tags;

-- ============================================
-- PARTE 5: Criar índices para performance
-- ============================================

CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_template_categories_template_id ON template_categories(template_id);
CREATE INDEX IF NOT EXISTS idx_template_categories_category_id ON template_categories(category_id);

-- ============================================
-- PARTE 6: Trigger para updated_at em categories
-- ============================================

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- PARTE 7: Inserir categorias padrão
-- ============================================

INSERT INTO categories (name, slug, description) VALUES
  ('Games', 'games', 'Jogos e personagens de jogos'),
  ('Anime', 'anime', 'Animes e personagens de anime'),
  ('Movies', 'movies', 'Filmes e séries'),
  ('Music', 'music', 'Artistas e músicas'),
  ('Sports', 'sports', 'Times e atletas'),
  ('Food', 'food', 'Comidas e restaurantes'),
  ('Characters', 'characters', 'Personagens diversos'),
  ('Other', 'other', 'Outros temas')
ON CONFLICT (slug) DO NOTHING;

