-- Enable UUID extension
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

-- Create indexes for better performance
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

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_templates_updated_at BEFORE UPDATE ON templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tier_lists_updated_at BEFORE UPDATE ON tier_lists
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


