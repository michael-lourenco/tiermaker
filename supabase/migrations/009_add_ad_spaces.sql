-- ============================================
-- MIGRATION: Sistema de Espaços de Publicidade
-- ============================================
-- Esta migration cria a tabela ad_spaces para gerenciar
-- espaços de publicidade (manuais e Google AdSense)

-- Criar tabela ad_spaces
CREATE TABLE IF NOT EXISTS ad_spaces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  position TEXT NOT NULL,
  device_type TEXT NOT NULL DEFAULT 'all' CHECK (device_type IN ('all', 'desktop', 'mobile')),
  ad_type TEXT NOT NULL CHECK (ad_type IN ('manual', 'google')),
  
  -- Para publicidades manuais
  manual_image_url TEXT,
  manual_link_url TEXT,
  manual_alt_text TEXT,
  
  -- Para publicidades do Google
  google_ad_client TEXT,
  google_ad_slot TEXT,
  google_ad_format TEXT,
  
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_ad_spaces_position ON ad_spaces(position, device_type, is_active);
CREATE INDEX IF NOT EXISTS idx_ad_spaces_active ON ad_spaces(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_ad_spaces_type ON ad_spaces(ad_type, is_active);

-- Criar trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_ad_spaces_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Remover trigger se já existir e criar novamente
DROP TRIGGER IF EXISTS update_ad_spaces_updated_at ON ad_spaces;
CREATE TRIGGER update_ad_spaces_updated_at
  BEFORE UPDATE ON ad_spaces
  FOR EACH ROW
  EXECUTE FUNCTION update_ad_spaces_updated_at();

-- ============================================
-- RLS POLICIES
-- ============================================

-- Habilitar RLS
ALTER TABLE ad_spaces ENABLE ROW LEVEL SECURITY;

-- Remover políticas se já existirem
DROP POLICY IF EXISTS "Ad spaces are viewable by everyone" ON ad_spaces;
DROP POLICY IF EXISTS "Only admins can manage ad spaces" ON ad_spaces;
DROP POLICY IF EXISTS "Authenticated users can manage ad spaces" ON ad_spaces;

-- Política: Todos podem ver espaços ativos
CREATE POLICY "Ad spaces are viewable by everyone"
  ON ad_spaces FOR SELECT
  USING (is_active = true);

-- Política: Usuários autenticados podem gerenciar espaços
-- A verificação de admin é feita no código da aplicação (server-side)
CREATE POLICY "Authenticated users can manage ad spaces"
  ON ad_spaces FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

