-- Migration: Fix update_templates_count function to use SECURITY DEFINER
-- This allows the function to bypass RLS when updating subscription_limits

-- Recriar função para atualizar contagem de templates automaticamente
-- SECURITY DEFINER permite que a função execute com privilégios do criador, contornando RLS
CREATE OR REPLACE FUNCTION update_templates_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

-- Adicionar comentário explicativo
COMMENT ON FUNCTION update_templates_count() IS 'Trigger function to automatically update templates_count in subscription_limits when templates are created, deleted, or restored. Uses SECURITY DEFINER to bypass RLS.';
