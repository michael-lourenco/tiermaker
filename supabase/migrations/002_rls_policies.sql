-- Enable Row Level Security
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE tier_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE tier_list_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE tier_list_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Templates RLS Policies
CREATE POLICY "Templates are viewable by everyone if public"
  ON templates FOR SELECT
  USING (is_public = true OR user_id = auth.uid());

CREATE POLICY "Users can create templates"
  ON templates FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own templates"
  ON templates FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own templates"
  ON templates FOR DELETE
  USING (user_id = auth.uid());

-- Template Items RLS Policies
CREATE POLICY "Template items are viewable if template is public or owned"
  ON template_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM templates
      WHERE templates.id = template_items.template_id
      AND (templates.is_public = true OR templates.user_id = auth.uid())
    )
  );

CREATE POLICY "Users can insert template items for their templates"
  ON template_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM templates
      WHERE templates.id = template_items.template_id
      AND templates.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update template items for their templates"
  ON template_items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM templates
      WHERE templates.id = template_items.template_id
      AND templates.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete template items for their templates"
  ON template_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM templates
      WHERE templates.id = template_items.template_id
      AND templates.user_id = auth.uid()
    )
  );

-- Tier Lists RLS Policies
CREATE POLICY "Tier lists are viewable if public or owned"
  ON tier_lists FOR SELECT
  USING (is_public = true OR user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "Anyone can create tier lists"
  ON tier_lists FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their own tier lists"
  ON tier_lists FOR UPDATE
  USING (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "Users can delete their own tier lists"
  ON tier_lists FOR DELETE
  USING (user_id = auth.uid() OR user_id IS NULL);

-- Tier List Items RLS Policies
CREATE POLICY "Tier list items are viewable if tier list is accessible"
  ON tier_list_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM tier_lists
      WHERE tier_lists.id = tier_list_items.tier_list_id
      AND (tier_lists.is_public = true OR tier_lists.user_id = auth.uid() OR tier_lists.user_id IS NULL)
    )
  );

CREATE POLICY "Users can manage tier list items for accessible tier lists"
  ON tier_list_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM tier_lists
      WHERE tier_lists.id = tier_list_items.tier_list_id
      AND (tier_lists.user_id = auth.uid() OR tier_lists.user_id IS NULL)
    )
  );

-- Tier List Tiers RLS Policies
CREATE POLICY "Tier list tiers are viewable if tier list is accessible"
  ON tier_list_tiers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM tier_lists
      WHERE tier_lists.id = tier_list_tiers.tier_list_id
      AND (tier_lists.is_public = true OR tier_lists.user_id = auth.uid() OR tier_lists.user_id IS NULL)
    )
  );

CREATE POLICY "Users can manage tier list tiers for accessible tier lists"
  ON tier_list_tiers FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM tier_lists
      WHERE tier_lists.id = tier_list_tiers.tier_list_id
      AND (tier_lists.user_id = auth.uid() OR tier_lists.user_id IS NULL)
    )
  );

-- Likes RLS Policies
CREATE POLICY "Likes are viewable by everyone"
  ON likes FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create likes"
  ON likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own likes"
  ON likes FOR DELETE
  USING (auth.uid() = user_id);

-- Comments RLS Policies
CREATE POLICY "Comments are viewable if tier list is accessible"
  ON comments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM tier_lists
      WHERE tier_lists.id = comments.tier_list_id
      AND (tier_lists.is_public = true OR tier_lists.user_id = auth.uid())
    )
  );

CREATE POLICY "Authenticated users can create comments"
  ON comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments"
  ON comments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
  ON comments FOR DELETE
  USING (auth.uid() = user_id);

