-- Add cover_image_url column to templates table
ALTER TABLE templates 
ADD COLUMN IF NOT EXISTS cover_image_url TEXT;

