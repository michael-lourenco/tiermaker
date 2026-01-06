-- Migration: Add tier lists cache system for optimized public tier lists page
-- This creates a daily cache table that pre-computes tier lists data to avoid expensive joins

-- Create tier_lists_cache table
CREATE TABLE IF NOT EXISTS tier_lists_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tier_list_id UUID NOT NULL REFERENCES tier_lists(id) ON DELETE CASCADE,
  template_id UUID NOT NULL REFERENCES templates(id) ON DELETE CASCADE,
  template_name TEXT NOT NULL,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  category_name TEXT,
  category_slug TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email TEXT,
  title TEXT NOT NULL,
  views_count INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL,
  -- Cached tier list data (tiers + items) as JSONB for fast retrieval
  tier_list_data JSONB NOT NULL,
  -- Cache metadata
  cached_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  cache_date DATE NOT NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_tier_lists_cache_date ON tier_lists_cache(cache_date);
CREATE INDEX IF NOT EXISTS idx_tier_lists_cache_template_id ON tier_lists_cache(template_id);
CREATE INDEX IF NOT EXISTS idx_tier_lists_cache_category_id ON tier_lists_cache(category_id);
CREATE INDEX IF NOT EXISTS idx_tier_lists_cache_user_id ON tier_lists_cache(user_id);
CREATE INDEX IF NOT EXISTS idx_tier_lists_cache_views_count ON tier_lists_cache(views_count DESC);
CREATE INDEX IF NOT EXISTS idx_tier_lists_cache_likes_count ON tier_lists_cache(likes_count DESC);
CREATE INDEX IF NOT EXISTS idx_tier_lists_cache_created_at ON tier_lists_cache(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tier_lists_cache_title ON tier_lists_cache USING gin(to_tsvector('portuguese', title));

-- Index for today's cache lookup (most common query)
-- Note: Cannot use CURRENT_DATE in partial index (not immutable)
-- Instead, we'll rely on the general cache_date index and query optimization
-- CREATE INDEX IF NOT EXISTS idx_tier_lists_cache_today ON tier_lists_cache(cache_date) 
-- WHERE cache_date = CURRENT_DATE;

-- Function to set cache_date from cached_at (must be before generate function)
CREATE OR REPLACE FUNCTION set_cache_date()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.cache_date := (NEW.cached_at AT TIME ZONE 'UTC')::date;
  RETURN NEW;
END;
$$;

-- Trigger to automatically set cache_date
CREATE TRIGGER tier_lists_cache_set_date_trigger
BEFORE INSERT OR UPDATE OF cached_at ON tier_lists_cache
FOR EACH ROW
EXECUTE FUNCTION set_cache_date();

-- Function to generate cache for current day
CREATE OR REPLACE FUNCTION generate_tier_lists_cache()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  cache_entry RECORD;
  tier_list_full_data JSONB;
BEGIN
  -- Delete existing cache for today
  DELETE FROM tier_lists_cache WHERE cache_date = CURRENT_DATE;
  
  -- Generate cache for all public tier lists
  FOR cache_entry IN
    SELECT 
      tl.id as tier_list_id,
      tl.template_id,
      tl.user_id,
      tl.title,
      tl.views_count,
      tl.likes_count,
      tl.created_at,
      t.name as template_name,
      cat.id as category_id,
      cat.name as category_name,
      cat.slug as category_slug,
      NULL::TEXT as user_email
    FROM tier_lists tl
    INNER JOIN templates t ON t.id = tl.template_id
    LEFT JOIN LATERAL (
      SELECT tc.category_id, c.id, c.name, c.slug
      FROM template_categories tc
      INNER JOIN categories c ON c.id = tc.category_id
      WHERE tc.template_id = t.id
      LIMIT 1
    ) cat ON true
    WHERE tl.is_public = true
      AND t.deleted_at IS NULL
      AND t.is_public = true
  LOOP
    -- Build tier list data (tiers + items) as JSONB
    SELECT jsonb_build_object(
      'tiers', (
        SELECT jsonb_agg(
          jsonb_build_object(
            'id', tlt.id,
            'tier_name', tlt.tier_name,
            'tier_order', tlt.tier_order,
            'color', tlt.color
          ) ORDER BY tlt.tier_order
        )
        FROM tier_list_tiers tlt
        WHERE tlt.tier_list_id = cache_entry.tier_list_id
      ),
      'items', (
        SELECT jsonb_agg(
          jsonb_build_object(
            'id', tli.id,
            'template_item_id', tli.template_item_id,
            'tier_name', tli.tier_name,
            'order', tli.order,
            'template_item', (
              SELECT jsonb_build_object(
                'id', ti.id,
                'name', ti.name,
                'image_url', ti.image_url
              )
              FROM template_items ti
              WHERE ti.id = tli.template_item_id
            )
          ) ORDER BY tli.order
        )
        FROM tier_list_items tli
        WHERE tli.tier_list_id = cache_entry.tier_list_id
      )
    ) INTO tier_list_full_data;
    
    -- Insert into cache (cache_date will be set by trigger)
    INSERT INTO tier_lists_cache (
      tier_list_id,
      template_id,
      template_name,
      category_id,
      category_name,
      category_slug,
      user_id,
      user_email,
      title,
      views_count,
      likes_count,
      created_at,
      tier_list_data,
      cache_date
    ) VALUES (
      cache_entry.tier_list_id,
      cache_entry.template_id,
      cache_entry.template_name,
      cache_entry.category_id,
      cache_entry.category_name,
      cache_entry.category_slug,
      cache_entry.user_id,
      cache_entry.user_email,
      cache_entry.title,
      cache_entry.views_count,
      cache_entry.likes_count,
      cache_entry.created_at,
      tier_list_full_data,
      CURRENT_DATE
    );
  END LOOP;
  
  -- Log cache generation
  RAISE NOTICE 'Tier lists cache generated for % tier lists on %', 
    (SELECT COUNT(*) FROM tier_lists_cache WHERE cache_date = CURRENT_DATE),
    CURRENT_DATE;
END;
$$;

-- Function to check if cache exists for today
CREATE OR REPLACE FUNCTION tier_lists_cache_exists()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  cache_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO cache_count
  FROM tier_lists_cache
  WHERE cache_date = CURRENT_DATE;
  
  RETURN cache_count > 0;
END;
$$;

-- Function to ensure cache exists (check and generate if needed)
CREATE OR REPLACE FUNCTION ensure_tier_lists_cache()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  IF NOT tier_lists_cache_exists() THEN
    PERFORM generate_tier_lists_cache();
  END IF;
END;
$$;

-- Function to clean old cache (older than 7 days)
CREATE OR REPLACE FUNCTION clean_old_tier_lists_cache()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM tier_lists_cache
  WHERE cache_date < CURRENT_DATE - INTERVAL '7 days';
  
  RAISE NOTICE 'Old tier lists cache cleaned';
END;
$$;

-- Trigger to update cache when tier list is updated (views, likes, etc)
CREATE OR REPLACE FUNCTION update_tier_lists_cache_on_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update cache entry if it exists for today
  UPDATE tier_lists_cache
  SET 
    views_count = NEW.views_count,
    likes_count = NEW.likes_count,
    title = NEW.title
  WHERE tier_list_id = NEW.id 
    AND cache_date = CURRENT_DATE;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER tier_lists_cache_update_trigger
AFTER UPDATE OF views_count, likes_count, title, is_public ON tier_lists
FOR EACH ROW
WHEN (OLD.is_public = true OR NEW.is_public = true)
EXECUTE FUNCTION update_tier_lists_cache_on_change();

-- Trigger to remove from cache when tier list is deleted or made private
CREATE OR REPLACE FUNCTION remove_tier_list_from_cache()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM tier_lists_cache
  WHERE tier_list_id = COALESCE(NEW.id, OLD.id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER tier_lists_cache_delete_trigger
AFTER DELETE ON tier_lists
FOR EACH ROW
EXECUTE FUNCTION remove_tier_list_from_cache();

CREATE TRIGGER tier_lists_cache_private_trigger
AFTER UPDATE OF is_public ON tier_lists
FOR EACH ROW
WHEN (OLD.is_public = true AND NEW.is_public = false)
EXECUTE FUNCTION remove_tier_list_from_cache();

-- RLS Policies for cache table (read-only for everyone, no writes from client)
CREATE POLICY "Cache is readable by everyone"
  ON tier_lists_cache FOR SELECT
  USING (true);

-- Initial cache generation (optional - can be called manually or via API)
-- PERFORM ensure_tier_lists_cache();

COMMENT ON TABLE tier_lists_cache IS 'Daily cache of public tier lists with pre-computed data for optimized queries';
COMMENT ON COLUMN tier_lists_cache.tier_list_data IS 'JSONB containing full tier list structure (tiers + items)';
COMMENT ON COLUMN tier_lists_cache.cache_date IS 'Date of cache generation (automatically set by trigger from cached_at)';
