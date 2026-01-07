-- Migration: Add template_tiers table
-- Allows templates to have default tiers (names and colors) that are used when creating tier lists

-- Create template_tiers table
CREATE TABLE IF NOT EXISTS template_tiers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID NOT NULL REFERENCES templates(id) ON DELETE CASCADE,
  tier_name TEXT NOT NULL,
  tier_order INTEGER NOT NULL,
  color TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(template_id, tier_order)
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_template_tiers_template_id ON template_tiers(template_id);
CREATE INDEX IF NOT EXISTS idx_template_tiers_order ON template_tiers(template_id, tier_order);

-- Enable RLS
ALTER TABLE template_tiers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for template_tiers
-- Users can view tiers for public templates or their own templates
CREATE POLICY "Template tiers are viewable for public templates or owner"
  ON template_tiers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM templates
      WHERE templates.id = template_tiers.template_id
      AND (
        templates.is_public = true
        OR templates.user_id = auth.uid()
      )
    )
  );

-- Users can manage tiers for their own templates
CREATE POLICY "Users can manage tiers for their own templates"
  ON template_tiers FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM templates
      WHERE templates.id = template_tiers.template_id
      AND templates.user_id = auth.uid()
    )
  );

-- Add comment
COMMENT ON TABLE template_tiers IS 'Default tiers (names and colors) for templates. These are used as initial tiers when creating a tier list from a template.';
