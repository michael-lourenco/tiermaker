-- ============================================
-- RLS POLICIES PARA CATEGORIES
-- ============================================

-- Enable RLS on categories
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Enable RLS on template_categories
ALTER TABLE template_categories ENABLE ROW LEVEL SECURITY;

-- ============================================
-- POLICIES PARA CATEGORIES
-- ============================================

-- Todos podem ver categorias
CREATE POLICY "Categories are viewable by everyone"
  ON categories FOR SELECT
  USING (true);

-- Apenas usuários autenticados podem criar categorias
CREATE POLICY "Authenticated users can create categories"
  ON categories FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Apenas usuários autenticados podem atualizar categorias
CREATE POLICY "Authenticated users can update categories"
  ON categories FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Apenas usuários autenticados podem deletar categorias
CREATE POLICY "Authenticated users can delete categories"
  ON categories FOR DELETE
  USING (auth.role() = 'authenticated');

-- ============================================
-- POLICIES PARA TEMPLATE_CATEGORIES
-- ============================================

-- Todos podem ver associações template-categoria
CREATE POLICY "Template categories are viewable by everyone"
  ON template_categories FOR SELECT
  USING (true);

-- Usuários autenticados podem criar associações para seus próprios templates
CREATE POLICY "Users can create template categories for their templates"
  ON template_categories FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM templates
      WHERE templates.id = template_categories.template_id
      AND templates.user_id = auth.uid()
    )
  );

-- Usuários autenticados podem atualizar associações de seus próprios templates
CREATE POLICY "Users can update template categories for their templates"
  ON template_categories FOR UPDATE
  USING (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM templates
      WHERE templates.id = template_categories.template_id
      AND templates.user_id = auth.uid()
    )
  );

-- Usuários autenticados podem deletar associações de seus próprios templates
CREATE POLICY "Users can delete template categories for their templates"
  ON template_categories FOR DELETE
  USING (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM templates
      WHERE templates.id = template_categories.template_id
      AND templates.user_id = auth.uid()
    )
  );

