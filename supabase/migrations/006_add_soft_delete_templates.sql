-- Migration: Add soft delete support for templates
-- This allows templates to be marked as deleted without breaking tier lists that reference them

-- Add deleted_at column to templates table
ALTER TABLE templates 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

-- Create index for better performance when filtering out deleted templates
CREATE INDEX IF NOT EXISTS idx_templates_deleted_at ON templates(deleted_at) 
WHERE deleted_at IS NULL;

-- Create index for counting tier lists by template_id (for validation)
CREATE INDEX IF NOT EXISTS idx_tier_lists_template_id_count ON tier_lists(template_id);

-- Add comment explaining the soft delete strategy
COMMENT ON COLUMN templates.deleted_at IS 'Timestamp when template was soft deleted. NULL means template is active. Soft deleted templates are hidden from public views but tier lists can still reference them.';


