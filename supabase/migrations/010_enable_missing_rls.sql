-- 1. Enable RLS on the missing tables
ALTER TABLE coupon_uses ENABLE ROW LEVEL SECURITY;
ALTER TABLE discount_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE quantity_promotions ENABLE ROW LEVEL SECURITY;

-- 2. Create Policies for coupon_uses
-- Admins can do anything
CREATE POLICY "admin_all_coupon_uses" ON coupon_uses FOR ALL USING (is_admin());
-- Users can read their own coupon uses (important for checking if they already used a coupon)
CREATE POLICY "user_own_coupon_uses" ON coupon_uses FOR SELECT USING (auth.uid() = user_id);
-- Anyone can insert a coupon use (required during checkout processing)
CREATE POLICY "anyone_insert_coupon_uses" ON coupon_uses FOR INSERT WITH CHECK (true);

-- 3. Create Policies for discount_campaigns
CREATE POLICY "admin_all_discount_campaigns" ON discount_campaigns FOR ALL USING (is_admin());
-- Public can read active discount campaigns for the website display
CREATE POLICY "public_read_discount_campaigns" ON discount_campaigns FOR SELECT USING (is_active = true);

-- 4. Create Policies for blog_posts
CREATE POLICY "admin_all_blog_posts" ON blog_posts FOR ALL USING (is_admin());
-- Public can only read published blog posts
CREATE POLICY "public_read_blog_posts" ON blog_posts FOR SELECT USING (published = true);

-- 5. Create Policies for quantity_promotions
CREATE POLICY "admin_all_quantity_promotions" ON quantity_promotions FOR ALL USING (is_admin());
-- Public can read active promotions for cart calculations
CREATE POLICY "public_read_quantity_promotions" ON quantity_promotions FOR SELECT USING (is_active = true);
