-- Migration: Add views tracking system
-- This implements a professional views counting system with:
-- - 30-minute minimum interval between views
-- - Full audit trail for external validation
-- - Support for authenticated and anonymous users
-- - Automatic counter updates

-- ============================================
-- PARTE 1: TABELA DE VISUALIZAÇÕES
-- ============================================

-- Create views table for complete audit trail
CREATE TABLE IF NOT EXISTS views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Identificação do usuário (híbrida)
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT, -- Para usuários não autenticados (UUID v4)
  
  -- Conteúdo visualizado
  content_type TEXT NOT NULL CHECK (content_type IN ('template', 'tier_list')),
  content_id UUID NOT NULL,
  
  -- Metadados para auditoria e prevenção de fraude
  ip_address INET, -- Para detecção de padrões suspeitos
  user_agent TEXT, -- Navegador/dispositivo
  referrer TEXT, -- De onde veio (opcional)
  
  -- Timestamp
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraint: deve ter user_id OU session_id
  CONSTRAINT views_user_or_session CHECK (
    (user_id IS NOT NULL) OR (session_id IS NOT NULL)
  )
);

-- ============================================
-- PARTE 2: ÍNDICES PARA PERFORMANCE
-- ============================================

-- Índice para validação rápida de visualizações recentes por usuário autenticado
CREATE INDEX IF NOT EXISTS idx_views_user_recent 
ON views(user_id, content_type, content_id, viewed_at DESC) 
WHERE user_id IS NOT NULL;

-- Índice para validação rápida de visualizações recentes por sessão
CREATE INDEX IF NOT EXISTS idx_views_session_recent 
ON views(session_id, content_type, content_id, viewed_at DESC) 
WHERE session_id IS NOT NULL;

-- Índice para analytics (consultas por conteúdo)
CREATE INDEX IF NOT EXISTS idx_views_content_analytics 
ON views(content_type, content_id, viewed_at DESC);

-- Índice para analytics temporal
CREATE INDEX IF NOT EXISTS idx_views_temporal 
ON views(viewed_at DESC);

-- ============================================
-- PARTE 3: FUNÇÃO PARA REGISTRAR VISUALIZAÇÃO
-- ============================================

-- Função que registra visualização com validação de intervalo mínimo (30 minutos)
CREATE OR REPLACE FUNCTION register_view(
  p_user_id UUID,
  p_session_id TEXT,
  p_content_type TEXT,
  p_content_id UUID,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_referrer TEXT DEFAULT NULL
) RETURNS TEXT AS $$
DECLARE
  v_last_view TIMESTAMP WITH TIME ZONE;
  v_min_interval INTERVAL := '30 minutes';
  v_result TEXT;
BEGIN
  -- Validar parâmetros
  IF (p_user_id IS NULL AND p_session_id IS NULL) THEN
    RETURN 'error: user_id or session_id required';
  END IF;
  
  IF p_content_type NOT IN ('template', 'tier_list') THEN
    RETURN 'error: invalid content_type';
  END IF;
  
  -- Verificar última visualização
  IF p_user_id IS NOT NULL THEN
    -- Usuário autenticado: verificar por user_id
    SELECT MAX(viewed_at) INTO v_last_view
    FROM views
    WHERE user_id = p_user_id
      AND content_type = p_content_type
      AND content_id = p_content_id;
  ELSE
    -- Usuário não autenticado: verificar por session_id
    SELECT MAX(viewed_at) INTO v_last_view
    FROM views
    WHERE session_id = p_session_id
      AND content_type = p_content_type
      AND content_id = p_content_id;
  END IF;
  
  -- Se não há visualização anterior ou passou o intervalo mínimo
  IF v_last_view IS NULL OR (NOW() - v_last_view) >= v_min_interval THEN
    -- Registrar visualização
    INSERT INTO views (
      user_id, 
      session_id, 
      content_type, 
      content_id,
      ip_address, 
      user_agent, 
      referrer
    ) VALUES (
      p_user_id, 
      p_session_id, 
      p_content_type, 
      p_content_id,
      p_ip_address, 
      p_user_agent, 
      p_referrer
    );
    
    -- Atualizar contador agregado
    IF p_content_type = 'template' THEN
      UPDATE templates 
      SET views_count = views_count + 1 
      WHERE id = p_content_id;
    ELSIF p_content_type = 'tier_list' THEN
      UPDATE tier_lists 
      SET views_count = views_count + 1 
      WHERE id = p_content_id;
    END IF;
    
    RETURN 'counted';
  ELSE
    RETURN 'ignored';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- PARTE 4: COMENTÁRIOS E DOCUMENTAÇÃO
-- ============================================

COMMENT ON TABLE views IS 'Tabela de logs de visualizações para auditoria completa. Cada visualização é registrada com metadados para validação externa e prevenção de fraude.';
COMMENT ON COLUMN views.user_id IS 'ID do usuário autenticado (NULL para usuários não autenticados)';
COMMENT ON COLUMN views.session_id IS 'ID da sessão para usuários não autenticados (UUID v4 armazenado em cookie)';
COMMENT ON COLUMN views.content_type IS 'Tipo de conteúdo: template ou tier_list';
COMMENT ON COLUMN views.content_id IS 'ID do template ou tier_list visualizado';
COMMENT ON COLUMN views.ip_address IS 'Endereço IP do visitante (para detecção de padrões suspeitos)';
COMMENT ON COLUMN views.user_agent IS 'User agent do navegador/dispositivo';
COMMENT ON COLUMN views.referrer IS 'URL de origem (de onde o usuário veio)';
COMMENT ON COLUMN views.viewed_at IS 'Timestamp da visualização';
COMMENT ON FUNCTION register_view IS 'Registra uma visualização com validação de intervalo mínimo de 30 minutos. Retorna counted se contabilizada, ignored se ignorada (dentro do intervalo), ou error em caso de erro.';

