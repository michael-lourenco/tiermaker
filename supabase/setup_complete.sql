-- ============================================
-- TIERMAKER - SETUP COMPLETO DO BANCO DE DADOS
-- ============================================
-- Execute este script completo no SQL Editor do Supabase
-- Ele cria todas as tabelas, índices, triggers e políticas RLS

-- ============================================
-- PARTE 1: SCHEMA E TABELAS
-- ============================================

-- Enable UUID extension (já habilitado por padrão no Supabase, mas seguro incluir)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create templates table
CREATE TABLE IF NOT EXISTS templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  tags TEXT[],
  is_public BOOLEAN DEFAULT true,
  views_count INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create template_items table
CREATE TABLE IF NOT EXISTS template_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID NOT NULL REFERENCES templates(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  image_url TEXT NOT NULL,
  "order" INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tier_lists table
CREATE TABLE IF NOT EXISTS tier_lists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  template_id UUID NOT NULL REFERENCES templates(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  is_public BOOLEAN DEFAULT false,
  share_token TEXT UNIQUE,
  views_count INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tier_list_items table
CREATE TABLE IF NOT EXISTS tier_list_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tier_list_id UUID NOT NULL REFERENCES tier_lists(id) ON DELETE CASCADE,
  template_item_id UUID NOT NULL REFERENCES template_items(id) ON DELETE CASCADE,
  tier_name TEXT NOT NULL,
  "order" INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tier_list_tiers table
CREATE TABLE IF NOT EXISTS tier_list_tiers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tier_list_id UUID NOT NULL REFERENCES tier_lists(id) ON DELETE CASCADE,
  tier_name TEXT NOT NULL,
  tier_order INTEGER NOT NULL,
  color TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create likes table
CREATE TABLE IF NOT EXISTS likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tier_list_id UUID REFERENCES tier_lists(id) ON DELETE CASCADE,
  template_id UUID REFERENCES templates(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT check_like_target CHECK (
    (tier_list_id IS NOT NULL AND template_id IS NULL) OR
    (tier_list_id IS NULL AND template_id IS NOT NULL)
  )
);

-- Create unique constraint for likes
CREATE UNIQUE INDEX IF NOT EXISTS unique_user_tier_list_like 
ON likes(user_id, tier_list_id) 
WHERE tier_list_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS unique_user_template_like 
ON likes(user_id, template_id) 
WHERE template_id IS NOT NULL;

-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tier_list_id UUID NOT NULL REFERENCES tier_lists(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- PARTE 2: ÍNDICES PARA PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_templates_user_id ON templates(user_id);
CREATE INDEX IF NOT EXISTS idx_templates_category ON templates(category);
CREATE INDEX IF NOT EXISTS idx_templates_is_public ON templates(is_public);
CREATE INDEX IF NOT EXISTS idx_template_items_template_id ON template_items(template_id);
CREATE INDEX IF NOT EXISTS idx_tier_lists_user_id ON tier_lists(user_id);
CREATE INDEX IF NOT EXISTS idx_tier_lists_template_id ON tier_lists(template_id);
CREATE INDEX IF NOT EXISTS idx_tier_lists_share_token ON tier_lists(share_token);
CREATE INDEX IF NOT EXISTS idx_tier_list_items_tier_list_id ON tier_list_items(tier_list_id);
CREATE INDEX IF NOT EXISTS idx_tier_list_tiers_tier_list_id ON tier_list_tiers(tier_list_id);
CREATE INDEX IF NOT EXISTS idx_likes_user_id ON likes(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_tier_list_id ON comments(tier_list_id);

-- ============================================
-- PARTE 3: TRIGGERS PARA updated_at
-- ============================================

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_templates_updated_at ON templates;
CREATE TRIGGER update_templates_updated_at BEFORE UPDATE ON templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_tier_lists_updated_at ON tier_lists;
CREATE TRIGGER update_tier_lists_updated_at BEFORE UPDATE ON tier_lists
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_comments_updated_at ON comments;
CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- PARTE 4: ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable Row Level Security
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE tier_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE tier_list_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE tier_list_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (para evitar erros ao re-executar)
DROP POLICY IF EXISTS "Templates are viewable by everyone if public" ON templates;
DROP POLICY IF EXISTS "Users can create templates" ON templates;
DROP POLICY IF EXISTS "Users can update their own templates" ON templates;
DROP POLICY IF EXISTS "Users can delete their own templates" ON templates;

-- Templates RLS Policies
CREATE POLICY "Templates are viewable by everyone if public"
  ON templates FOR SELECT
  USING (is_public = true OR user_id = auth.uid());

CREATE POLICY "Users can create templates"
  ON templates FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own templates"
  ON templates FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own templates"
  ON templates FOR DELETE
  USING (user_id = auth.uid());

-- Template Items RLS Policies
DROP POLICY IF EXISTS "Template items are viewable if template is public or owned" ON template_items;
DROP POLICY IF EXISTS "Users can insert template items for their templates" ON template_items;
DROP POLICY IF EXISTS "Users can update template items for their templates" ON template_items;
DROP POLICY IF EXISTS "Users can delete template items for their templates" ON template_items;

CREATE POLICY "Template items are viewable if template is public or owned"
  ON template_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM templates
      WHERE templates.id = template_items.template_id
      AND (templates.is_public = true OR templates.user_id = auth.uid())
    )
  );

CREATE POLICY "Users can insert template items for their templates"
  ON template_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM templates
      WHERE templates.id = template_items.template_id
      AND templates.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update template items for their templates"
  ON template_items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM templates
      WHERE templates.id = template_items.template_id
      AND templates.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete template items for their templates"
  ON template_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM templates
      WHERE templates.id = template_items.template_id
      AND templates.user_id = auth.uid()
    )
  );

-- Tier Lists RLS Policies
DROP POLICY IF EXISTS "Tier lists are viewable if public or owned" ON tier_lists;
DROP POLICY IF EXISTS "Anyone can create tier lists" ON tier_lists;
DROP POLICY IF EXISTS "Users can update their own tier lists" ON tier_lists;
DROP POLICY IF EXISTS "Users can delete their own tier lists" ON tier_lists;

CREATE POLICY "Tier lists are viewable if public or owned"
  ON tier_lists FOR SELECT
  USING (is_public = true OR user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "Anyone can create tier lists"
  ON tier_lists FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their own tier lists"
  ON tier_lists FOR UPDATE
  USING (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "Users can delete their own tier lists"
  ON tier_lists FOR DELETE
  USING (user_id = auth.uid() OR user_id IS NULL);

-- Tier List Items RLS Policies
DROP POLICY IF EXISTS "Tier list items are viewable if tier list is accessible" ON tier_list_items;
DROP POLICY IF EXISTS "Users can manage tier list items for accessible tier lists" ON tier_list_items;

CREATE POLICY "Tier list items are viewable if tier list is accessible"
  ON tier_list_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM tier_lists
      WHERE tier_lists.id = tier_list_items.tier_list_id
      AND (tier_lists.is_public = true OR tier_lists.user_id = auth.uid() OR tier_lists.user_id IS NULL)
    )
  );

CREATE POLICY "Users can manage tier list items for accessible tier lists"
  ON tier_list_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM tier_lists
      WHERE tier_lists.id = tier_list_items.tier_list_id
      AND (tier_lists.user_id = auth.uid() OR tier_lists.user_id IS NULL)
    )
  );

-- Tier List Tiers RLS Policies
DROP POLICY IF EXISTS "Tier list tiers are viewable if tier list is accessible" ON tier_list_tiers;
DROP POLICY IF EXISTS "Users can manage tier list tiers for accessible tier lists" ON tier_list_tiers;

CREATE POLICY "Tier list tiers are viewable if tier list is accessible"
  ON tier_list_tiers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM tier_lists
      WHERE tier_lists.id = tier_list_tiers.tier_list_id
      AND (tier_lists.is_public = true OR tier_lists.user_id = auth.uid() OR tier_lists.user_id IS NULL)
    )
  );

CREATE POLICY "Users can manage tier list tiers for accessible tier lists"
  ON tier_list_tiers FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM tier_lists
      WHERE tier_lists.id = tier_list_tiers.tier_list_id
      AND (tier_lists.user_id = auth.uid() OR tier_lists.user_id IS NULL)
    )
  );

-- Likes RLS Policies
DROP POLICY IF EXISTS "Likes are viewable by everyone" ON likes;
DROP POLICY IF EXISTS "Authenticated users can create likes" ON likes;
DROP POLICY IF EXISTS "Users can delete their own likes" ON likes;

CREATE POLICY "Likes are viewable by everyone"
  ON likes FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create likes"
  ON likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own likes"
  ON likes FOR DELETE
  USING (auth.uid() = user_id);

-- Comments RLS Policies
DROP POLICY IF EXISTS "Comments are viewable if tier list is accessible" ON comments;
DROP POLICY IF EXISTS "Authenticated users can create comments" ON comments;
DROP POLICY IF EXISTS "Users can update their own comments" ON comments;
DROP POLICY IF EXISTS "Users can delete their own comments" ON comments;

CREATE POLICY "Comments are viewable if tier list is accessible"
  ON comments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM tier_lists
      WHERE tier_lists.id = comments.tier_list_id
      AND (tier_lists.is_public = true OR tier_lists.user_id = auth.uid())
    )
  );

CREATE POLICY "Authenticated users can create comments"
  ON comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments"
  ON comments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
  ON comments FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- FIM DO SETUP
-- ============================================
-- Verifique se todas as tabelas foram criadas:
-- SELECT table_name FROM information_schema.tables 
-- WHERE table_schema = 'public' 
-- ORDER BY table_name;

