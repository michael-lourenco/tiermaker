-- Public listings require templates with a cover image
-- Updates generate_tier_lists_cache to exclude templates without cover_image_url

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
  DELETE FROM tier_lists_cache WHERE cache_date = CURRENT_DATE;

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
      AND t.cover_image_url IS NOT NULL
      AND btrim(t.cover_image_url) <> ''
  LOOP
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

  RAISE NOTICE 'Tier lists cache generated for % tier lists on %',
    (SELECT COUNT(*) FROM tier_lists_cache WHERE cache_date = CURRENT_DATE),
    CURRENT_DATE;
END;
$$;
