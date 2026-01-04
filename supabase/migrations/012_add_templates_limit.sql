-- ============================================
-- MIGRATION: Adicionar Limite de Templates
-- ============================================
-- Esta migration adiciona o limite de templates_count
-- aos usuários existentes e atualiza a estrutura

-- Inicializar limite de templates para todos os usuários existentes
-- Contar templates existentes de cada usuário e criar/atualizar limite
DO $$
DECLARE
  user_record RECORD;
  template_count INTEGER;
  is_premium BOOLEAN;
  max_templates INTEGER;
BEGIN
  -- Para cada usuário
  FOR user_record IN SELECT DISTINCT user_id FROM templates WHERE user_id IS NOT NULL
  LOOP
    -- Contar templates do usuário
    SELECT COUNT(*) INTO template_count
    FROM templates
    WHERE user_id = user_record.user_id
      AND deleted_at IS NULL;
    
    -- Verificar se é premium
    SELECT EXISTS(
      SELECT 1 FROM subscriptions
      WHERE user_id = user_record.user_id
        AND status = 'active'
        AND plan_type = 'premium'
    ) INTO is_premium;
    
    -- Definir limite máximo baseado no plano
    IF is_premium THEN
      max_templates := -1; -- Ilimitado
    ELSE
      max_templates := 3; -- Básico: 3 templates
    END IF;
    
    -- Criar ou atualizar limite
    INSERT INTO subscription_limits (user_id, limit_type, current_count, max_count)
    VALUES (user_record.user_id, 'templates_count', template_count, max_templates)
    ON CONFLICT (user_id, limit_type)
    DO UPDATE SET
      current_count = template_count,
      max_count = max_templates,
      updated_at = NOW();
  END LOOP;
  
  -- Para usuários que não têm templates mas têm subscription_limits
  -- Adicionar templates_count se não existir
  INSERT INTO subscription_limits (user_id, limit_type, current_count, max_count)
  SELECT 
    sl.user_id,
    'templates_count',
    0,
    CASE 
      WHEN EXISTS(
        SELECT 1 FROM subscriptions s
        WHERE s.user_id = sl.user_id
          AND s.status = 'active'
          AND s.plan_type = 'premium'
      ) THEN -1
      ELSE 3
    END
  FROM subscription_limits sl
  WHERE sl.limit_type = 'tier_lists_count'
    AND NOT EXISTS(
      SELECT 1 FROM subscription_limits sl2
      WHERE sl2.user_id = sl.user_id
        AND sl2.limit_type = 'templates_count'
    )
  ON CONFLICT (user_id, limit_type) DO NOTHING;
END $$;

-- Criar função para atualizar contagem de templates automaticamente
CREATE OR REPLACE FUNCTION update_templates_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Atualizar contagem quando template é criado
  IF TG_OP = 'INSERT' AND NEW.user_id IS NOT NULL THEN
    -- Garantir que o limite existe antes de atualizar
    INSERT INTO subscription_limits (user_id, limit_type, current_count, max_count)
    SELECT 
      NEW.user_id,
      'templates_count',
      (SELECT COUNT(*) FROM templates WHERE user_id = NEW.user_id AND deleted_at IS NULL),
      CASE 
        WHEN EXISTS(
          SELECT 1 FROM subscriptions s
          WHERE s.user_id = NEW.user_id
            AND s.status = 'active'
            AND s.plan_type = 'premium'
        ) THEN -1
        ELSE 3
      END
    ON CONFLICT (user_id, limit_type)
    DO UPDATE SET
      current_count = (SELECT COUNT(*) FROM templates WHERE user_id = NEW.user_id AND deleted_at IS NULL),
      updated_at = NOW();
    
    RETURN NEW;
  END IF;
  
  -- Atualizar contagem quando template é deletado (soft delete)
  IF TG_OP = 'UPDATE' AND OLD.deleted_at IS NULL AND NEW.deleted_at IS NOT NULL THEN
    UPDATE subscription_limits
    SET current_count = (
      SELECT COUNT(*) FROM templates
      WHERE user_id = NEW.user_id
        AND deleted_at IS NULL
    ),
    updated_at = NOW()
    WHERE user_id = NEW.user_id
      AND limit_type = 'templates_count';
    
    RETURN NEW;
  END IF;
  
  -- Atualizar contagem quando template é restaurado (soft delete revertido)
  IF TG_OP = 'UPDATE' AND OLD.deleted_at IS NOT NULL AND NEW.deleted_at IS NULL THEN
    UPDATE subscription_limits
    SET current_count = (
      SELECT COUNT(*) FROM templates
      WHERE user_id = NEW.user_id
        AND deleted_at IS NULL
    ),
    updated_at = NOW()
    WHERE user_id = NEW.user_id
      AND limit_type = 'templates_count';
    
    RETURN NEW;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para atualizar contagem automaticamente
DROP TRIGGER IF EXISTS trigger_update_templates_count ON templates;
CREATE TRIGGER trigger_update_templates_count
  AFTER INSERT OR UPDATE OF deleted_at ON templates
  FOR EACH ROW
  EXECUTE FUNCTION update_templates_count();
