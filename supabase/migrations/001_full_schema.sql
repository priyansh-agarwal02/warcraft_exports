-- ============================================================
-- WARCRAFT EXPORTS — Full Database Migration
-- Run this ONCE in Supabase SQL Editor (warcraft_exports project)
-- ============================================================

-- ── 001 Extensions ──────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Shared trigger function (used by multiple tables) ────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

-- ── 002 Categories ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS categories (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name             text NOT NULL,
  slug             text UNIQUE NOT NULL,
  parent_id        uuid REFERENCES categories(id),
  description      text,
  image_url        text,
  meta_title       text,
  meta_description text,
  sort_order       integer DEFAULT 0,
  is_active        boolean DEFAULT true,
  show_in_nav      boolean DEFAULT true
);

-- ── 003 Products ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sku                 text UNIQUE NOT NULL,
  amazon_sku          text,
  name                text NOT NULL,
  slug                text UNIQUE NOT NULL,
  subtitle            text,
  nation              text NOT NULL CHECK (nation IN ('US','German','British','Japanese','Soviet','French','Italian','Universal')),
  era                 text NOT NULL CHECK (era IN ('WW1','WW2','Cold War','Modern Tactical','Universal')),
  category_id         uuid REFERENCES categories(id),
  material            text,
  style               text,
  price_usd           decimal(10,2) NOT NULL CHECK (price_usd > 0),
  sale_price_usd      decimal(10,2),
  short_description   text,
  description         text,
  historical_quote    text,
  features            jsonb DEFAULT '[]',
  specifications      jsonb DEFAULT '{}',
  variant_label       text,
  weight_kg           decimal(6,3),
  stock_quantity      integer DEFAULT 0 CHECK (stock_quantity >= 0),
  low_stock_threshold integer DEFAULT 5,
  is_active           boolean DEFAULT true,
  is_featured         boolean DEFAULT false,
  is_wholesale_only   boolean DEFAULT false,
  amazon_asin         text,
  meta_title          text,
  meta_description    text,
  tags                text[] DEFAULT '{}',
  model_3d_url        text,
  embedding           vector(384),
  created_at          timestamptz DEFAULT now(),
  updated_at          timestamptz DEFAULT now()
);

CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── 004 Product Images ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS product_images (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  url        text NOT NULL,
  alt_text   text,
  sort_order integer DEFAULT 0,
  is_hero    boolean DEFAULT false,
  is_360     boolean DEFAULT false
);

-- ── 005 Product Variants ────────────────────────────────────
CREATE TABLE IF NOT EXISTS product_variants (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id     uuid REFERENCES products(id) ON DELETE CASCADE,
  color          text,
  size           text,
  sku_suffix     text,
  price_override decimal(10,2),
  stock_quantity integer DEFAULT 0,
  is_active      boolean DEFAULT true
);

-- ── 006 Product Relations ───────────────────────────────────
CREATE TABLE IF NOT EXISTS product_relations (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id         uuid REFERENCES products(id) ON DELETE CASCADE,
  related_product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  relation_type      text NOT NULL CHECK (relation_type IN ('combo','manual')),
  sort_order         integer DEFAULT 0,
  UNIQUE(product_id, related_product_id)
);

-- ── 007 User Profiles ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_profiles (
  id           uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name    text,
  phone        text,
  company_name text,
  role         text DEFAULT 'customer' CHECK (role IN ('customer','admin')),
  notes        text,
  created_at   timestamptz DEFAULT now()
);

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ── 008 Addresses ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS addresses (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  type        text DEFAULT 'shipping' CHECK (type IN ('shipping','billing')),
  full_name   text NOT NULL,
  line1       text NOT NULL,
  line2       text,
  city        text NOT NULL,
  state       text,
  country     text NOT NULL,
  postal_code text NOT NULL,
  is_default  boolean DEFAULT false
);

-- ── 020 Coupons (before orders — orders references it) ──────
CREATE TABLE IF NOT EXISTS coupons (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code            text UNIQUE NOT NULL,
  type            text NOT NULL CHECK (type IN ('percent','fixed','free_shipping')),
  value           decimal(10,2),
  applies_to      text DEFAULT 'all' CHECK (applies_to IN ('all','category','products')),
  applies_ids     uuid[],
  min_order_usd   decimal(10,2),
  usage_limit     integer,
  per_customer    integer DEFAULT 1,
  times_used      integer DEFAULT 0,
  first_time_only boolean DEFAULT false,
  is_active       boolean DEFAULT true,
  expires_at      timestamptz,
  created_at      timestamptz DEFAULT now()
);

-- ── 009 Orders ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number     text UNIQUE NOT NULL,
  user_id          uuid REFERENCES user_profiles(id),
  guest_email      text,
  status           text DEFAULT 'pending' CHECK (status IN
    ('pending','confirmed','processing','shipped','delivered','cancelled','refunded')),
  subtotal_usd     decimal(10,2) NOT NULL,
  shipping_usd     decimal(10,2) DEFAULT 0,
  tax_usd          decimal(10,2) DEFAULT 0,
  discount_usd     decimal(10,2) DEFAULT 0,
  total_usd        decimal(10,2) NOT NULL,
  display_currency text DEFAULT 'USD',
  exchange_rate    decimal(10,6) DEFAULT 1,
  total_display    decimal(10,2),
  shipping_address jsonb NOT NULL,
  billing_address  jsonb,
  payment_method   text CHECK (payment_method IN ('razorpay','paypal')),
  payment_intent_id text,
  coupon_id        uuid REFERENCES coupons(id),
  tracking_number  text,
  tracking_url     text,
  notes            text,
  created_at       timestamptz DEFAULT now(),
  updated_at       timestamptz DEFAULT now()
);

CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE FUNCTION next_order_number()
RETURNS text AS $$
DECLARE
  year text := EXTRACT(YEAR FROM now())::text;
  seq  integer;
BEGIN
  SELECT COUNT(*) + 1 INTO seq FROM orders WHERE order_number LIKE 'WE-' || year || '-%';
  RETURN 'WE-' || year || '-' || LPAD(seq::text, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- ── 010 Order Items ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS order_items (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id         uuid REFERENCES orders(id) ON DELETE CASCADE,
  product_id       uuid REFERENCES products(id),
  variant_id       uuid REFERENCES product_variants(id),
  quantity         integer NOT NULL CHECK (quantity > 0),
  price_usd        decimal(10,2) NOT NULL,
  product_snapshot jsonb NOT NULL
);

-- ── 011 Wishlists ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS wishlists (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- ── 012 Wholesale Inquiries ─────────────────────────────────
CREATE TABLE IF NOT EXISTS wholesale_inquiries (
  id                       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name             text NOT NULL,
  contact_name             text NOT NULL,
  email                    text NOT NULL,
  phone                    text,
  country                  text NOT NULL,
  business_type            text CHECK (business_type IN
    ('retailer','distributor','film_prop','museum','other')),
  estimated_monthly_volume text,
  message                  text,
  status                   text DEFAULT 'pending' CHECK (status IN
    ('pending','in_discussion','closed')),
  admin_notes              text,
  created_at               timestamptz DEFAULT now()
);

-- ── 013 Reviews ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reviews (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id    uuid REFERENCES products(id),
  reviewer_name text NOT NULL,
  rating        integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title         text,
  body          text,
  source        text DEFAULT 'direct' CHECK (source IN ('amazon','ebay','direct')),
  source_url    text,
  verified      boolean DEFAULT false,
  featured      boolean DEFAULT false,
  is_visible    boolean DEFAULT true,
  admin_reply   text,
  created_at    timestamptz DEFAULT now()
);

-- ── 014 Chat ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS chat_sessions (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid REFERENCES user_profiles(id),
  guest_email text,
  status      text DEFAULT 'open' CHECK (status IN ('open','escalated','closed')),
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS chat_messages (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES chat_sessions(id) ON DELETE CASCADE,
  role       text NOT NULL CHECK (role IN ('user','assistant','admin')),
  content    text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- ── 015 Content Blocks ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS content_blocks (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key        text UNIQUE NOT NULL,
  type       text DEFAULT 'text' CHECK (type IN ('text','html','image_url','json')),
  value      text,
  updated_by uuid REFERENCES user_profiles(id),
  updated_at timestamptz DEFAULT now()
);

-- ── 016 Brand Partners ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS brand_partners (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text NOT NULL,
  logo_url   text,
  website    text,
  type       text DEFAULT 'shipping' CHECK (type IN ('shipping','marketplace','partner')),
  sort_order integer DEFAULT 0,
  is_active  boolean DEFAULT true
);

-- ── 017 Brand Stats ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS brand_stats (
  id    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key   text UNIQUE NOT NULL,
  value text NOT NULL,
  label text NOT NULL
);

-- ── 018 Exchange Rates ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS exchange_rates (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  currency   text UNIQUE NOT NULL,
  rate       decimal(10,6) NOT NULL,
  updated_at timestamptz DEFAULT now()
);

-- ── 019 Blog Posts (table ready, feature disabled at launch) ─
CREATE TABLE IF NOT EXISTS blog_posts (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title            text NOT NULL,
  slug             text UNIQUE NOT NULL,
  body             text,
  excerpt          text,
  cover_image_url  text,
  author_id        uuid REFERENCES user_profiles(id),
  published        boolean DEFAULT false,
  published_at     timestamptz,
  meta_title       text,
  meta_description text,
  created_at       timestamptz DEFAULT now(),
  updated_at       timestamptz DEFAULT now()
);

-- ── 021 Discount Campaigns ──────────────────────────────────
CREATE TABLE IF NOT EXISTS discount_campaigns (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  coupon_id   uuid REFERENCES coupons(id),
  starts_at   timestamptz,
  ends_at     timestamptz,
  is_active   boolean DEFAULT true,
  created_at  timestamptz DEFAULT now()
);

-- ── 022 Coupon Uses ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS coupon_uses (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id  uuid REFERENCES coupons(id),
  order_id   uuid REFERENCES orders(id),
  user_id    uuid REFERENCES user_profiles(id),
  used_at    timestamptz DEFAULT now()
);

-- ── 023 Refunds ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS refunds (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id            uuid REFERENCES orders(id),
  amount_usd          decimal(10,2) NOT NULL,
  reason              text,
  status              text DEFAULT 'pending' CHECK (status IN
    ('pending','approved','processed','rejected')),
  payment_refund_id   text,
  processed_by        uuid REFERENCES user_profiles(id),
  rejection_reason    text,
  created_at          timestamptz DEFAULT now(),
  updated_at          timestamptz DEFAULT now()
);

-- ── 024 Newsletter Subscribers ──────────────────────────────
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email      text UNIQUE NOT NULL,
  name       text,
  source     text DEFAULT 'footer' CHECK (source IN ('footer','checkout','popup')),
  is_active  boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- ── 025 Admin Activity Log ──────────────────────────────────
CREATE TABLE IF NOT EXISTS admin_activity_log (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id    uuid REFERENCES user_profiles(id),
  action      text NOT NULL,
  entity_type text,
  entity_id   uuid,
  description text,
  metadata    jsonb,
  created_at  timestamptz DEFAULT now()
);

-- ── 026 Row Level Security Policies ─────────────────────────
ALTER TABLE products              ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories            ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images        ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants      ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_relations     ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles         ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses             ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders                ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items           ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlists             ENABLE ROW LEVEL SECURITY;
ALTER TABLE wholesale_inquiries   ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews               ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions         ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages         ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_blocks        ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_partners        ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_stats           ENABLE ROW LEVEL SECURITY;
ALTER TABLE exchange_rates        ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons               ENABLE ROW LEVEL SECURITY;
ALTER TABLE refunds               ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_activity_log    ENABLE ROW LEVEL SECURITY;

-- Admin check helper
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Products
CREATE POLICY "public_read_active_products" ON products FOR SELECT USING (is_active = true);
CREATE POLICY "admin_all_products" ON products FOR ALL USING (is_admin());

-- Categories
CREATE POLICY "public_read_active_categories" ON categories FOR SELECT USING (is_active = true);
CREATE POLICY "admin_all_categories" ON categories FOR ALL USING (is_admin());

-- Product images / variants / relations
CREATE POLICY "public_read_product_images" ON product_images FOR SELECT USING (true);
CREATE POLICY "admin_all_product_images" ON product_images FOR ALL USING (is_admin());
CREATE POLICY "public_read_product_variants" ON product_variants FOR SELECT USING (true);
CREATE POLICY "admin_all_product_variants" ON product_variants FOR ALL USING (is_admin());
CREATE POLICY "public_read_product_relations" ON product_relations FOR SELECT USING (true);
CREATE POLICY "admin_all_product_relations" ON product_relations FOR ALL USING (is_admin());

-- User profiles
CREATE POLICY "user_read_own_profile" ON user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "user_update_own_profile" ON user_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "admin_all_profiles" ON user_profiles FOR ALL USING (is_admin());

-- Addresses
CREATE POLICY "user_own_addresses" ON addresses FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "admin_all_addresses" ON addresses FOR ALL USING (is_admin());

-- Orders
CREATE POLICY "user_own_orders" ON orders FOR SELECT USING (auth.uid() = user_id OR guest_email = auth.jwt()->>'email');
CREATE POLICY "user_insert_orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "admin_all_orders" ON orders FOR ALL USING (is_admin());

-- Order items
CREATE POLICY "user_own_order_items" ON order_items FOR SELECT
  USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND (orders.user_id = auth.uid() OR orders.guest_email = auth.jwt()->>'email')));
CREATE POLICY "user_insert_order_items" ON order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "admin_all_order_items" ON order_items FOR ALL USING (is_admin());

-- Wishlists
CREATE POLICY "user_own_wishlist" ON wishlists FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "admin_all_wishlists" ON wishlists FOR ALL USING (is_admin());

-- Reviews
CREATE POLICY "public_read_visible_reviews" ON reviews FOR SELECT USING (is_visible = true);
CREATE POLICY "admin_all_reviews" ON reviews FOR ALL USING (is_admin());

-- Wholesale inquiries (anyone can insert, only admin can read)
CREATE POLICY "anyone_insert_wholesale" ON wholesale_inquiries FOR INSERT WITH CHECK (true);
CREATE POLICY "admin_all_wholesale" ON wholesale_inquiries FOR ALL USING (is_admin());

-- Newsletter
CREATE POLICY "anyone_subscribe" ON newsletter_subscribers FOR INSERT WITH CHECK (true);
CREATE POLICY "admin_all_subscribers" ON newsletter_subscribers FOR ALL USING (is_admin());

-- Content blocks, brand_partners, brand_stats, exchange_rates (public read)
CREATE POLICY "public_read_content" ON content_blocks FOR SELECT USING (true);
CREATE POLICY "admin_all_content" ON content_blocks FOR ALL USING (is_admin());
CREATE POLICY "public_read_partners" ON brand_partners FOR SELECT USING (is_active = true);
CREATE POLICY "admin_all_partners" ON brand_partners FOR ALL USING (is_admin());
CREATE POLICY "public_read_stats" ON brand_stats FOR SELECT USING (true);
CREATE POLICY "admin_all_stats" ON brand_stats FOR ALL USING (is_admin());
CREATE POLICY "public_read_rates" ON exchange_rates FOR SELECT USING (true);
CREATE POLICY "admin_all_rates" ON exchange_rates FOR ALL USING (is_admin());

-- Coupons (only admin)
CREATE POLICY "admin_all_coupons" ON coupons FOR ALL USING (is_admin());

-- Refunds
CREATE POLICY "user_own_refunds" ON refunds FOR SELECT
  USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = refunds.order_id AND orders.user_id = auth.uid()));
CREATE POLICY "admin_all_refunds" ON refunds FOR ALL USING (is_admin());

-- Admin activity log (admin read-only)
CREATE POLICY "admin_read_activity" ON admin_activity_log FOR SELECT USING (is_admin());
CREATE POLICY "admin_insert_activity" ON admin_activity_log FOR INSERT WITH CHECK (is_admin());

-- Chat
CREATE POLICY "user_own_chat" ON chat_sessions FOR ALL USING (auth.uid() = user_id OR guest_email = auth.jwt()->>'email');
CREATE POLICY "admin_all_chat" ON chat_sessions FOR ALL USING (is_admin());
CREATE POLICY "user_chat_messages" ON chat_messages FOR ALL
  USING (EXISTS (SELECT 1 FROM chat_sessions WHERE chat_sessions.id = chat_messages.session_id AND (chat_sessions.user_id = auth.uid() OR chat_sessions.guest_email = auth.jwt()->>'email')));
CREATE POLICY "admin_all_chat_messages" ON chat_messages FOR ALL USING (is_admin());

-- ── 027 Performance Indexes ──────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_products_slug       ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_nation     ON products(nation);
CREATE INDEX IF NOT EXISTS idx_products_era        ON products(era);
CREATE INDEX IF NOT EXISTS idx_products_category   ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_featured   ON products(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_products_active     ON products(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_products_sku        ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_fts        ON products USING gin(to_tsvector('english', name || ' ' || COALESCE(description, '')));
CREATE INDEX IF NOT EXISTS idx_orders_user         ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_number       ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_status       ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created      ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order   ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product ON order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_product     ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_featured    ON reviews(featured) WHERE featured = true;

-- ── AI search function ───────────────────────────────────────
CREATE OR REPLACE FUNCTION match_products(
  query_embedding vector(384),
  query_text      text,
  match_threshold float DEFAULT 0.3,
  match_count     int DEFAULT 10
)
RETURNS TABLE (id uuid, name text, slug text, price_usd decimal, similarity float)
LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  SELECT p.id, p.name, p.slug, p.price_usd,
    (1 - (p.embedding <=> query_embedding)) AS similarity
  FROM products p
  WHERE p.is_active = true
    AND (1 - (p.embedding <=> query_embedding)) > match_threshold
  ORDER BY
    (1 - (p.embedding <=> query_embedding)) * 0.7 +
    ts_rank(to_tsvector('english', p.name), plainto_tsquery('english', query_text)) * 0.3 DESC
  LIMIT match_count;
END;
$$;

-- ── 028 Seed Data ────────────────────────────────────────────

-- Categories
INSERT INTO categories (name, slug, sort_order, is_active) VALUES
  ('Holsters',           'holsters',           1, true),
  ('Ammunition Pouches', 'ammunition-pouches',  2, true),
  ('Belts & Straps',     'belts-straps',        3, true),
  ('Slings',             'slings',              4, true),
  ('Grips',              'grips',               5, true),
  ('Canvas Gear',        'canvas-gear',         6, true),
  ('Leather Gear',       'leather-gear',        7, true),
  ('Reenactment Sets',   'reenactment-sets',    8, true),
  ('Uniforms',           'uniforms',            9, true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories (name, slug, parent_id, is_active) VALUES
  ('Hip Holsters',      'hip-holsters',      (SELECT id FROM categories WHERE slug='holsters'), true),
  ('Shoulder Holsters', 'shoulder-holsters', (SELECT id FROM categories WHERE slug='holsters'), true),
  ('Drop-Leg Holsters', 'drop-leg-holsters', (SELECT id FROM categories WHERE slug='holsters'), true)
ON CONFLICT (slug) DO NOTHING;

-- Brand Stats
INSERT INTO brand_stats (key, value, label) VALUES
  ('years_in_business', '10',      'Years in Business'),
  ('countries_served',  '20+',     'Countries Served'),
  ('orders_fulfilled',  '50,000+', 'Orders Fulfilled'),
  ('products',          '300+',    'Products')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, label = EXCLUDED.label;

-- Brand Partners
INSERT INTO brand_partners (name, logo_url, type, sort_order, is_active) VALUES
  ('DHL',         '/images/partners/dhl.svg',         'shipping',    1, true),
  ('FedEx',       '/images/partners/fedex.svg',       'shipping',    2, true),
  ('Ship Global', '/images/partners/ship-global.png', 'shipping',    3, true),
  ('Bombino',     '/images/partners/bombino.png',     'shipping',    4, true),
  ('USPS',        '/images/partners/usps.svg',        'shipping',    5, true),
  ('Amazon',      '/images/partners/amazon.svg',      'marketplace', 1, true),
  ('eBay',        '/images/partners/ebay.svg',        'marketplace', 2, true),
  ('Walmart',     '/images/partners/walmart.svg',     'marketplace', 3, true)
ON CONFLICT DO NOTHING;

-- Exchange Rates (USD base)
INSERT INTO exchange_rates (currency, rate) VALUES
  ('USD', 1.000000),
  ('EUR', 0.920000),
  ('GBP', 0.790000),
  ('JPY', 149.500000),
  ('CAD', 1.360000),
  ('AUD', 1.530000)
ON CONFLICT (currency) DO UPDATE SET rate = EXCLUDED.rate, updated_at = now();

-- Content Blocks
INSERT INTO content_blocks (key, type, value) VALUES
  ('hero_headline',         'text', 'Authentic Gear for History''s Greatest Conflicts'),
  ('hero_subheadline',      'text', 'Manufacturer-direct WW1 & WW2 historical reproduction gear — trusted by collectors, reenactors and film productions across 20+ countries.'),
  ('hero_cta_primary',      'text', 'Shop the Collection'),
  ('hero_cta_secondary',    'text', 'Wholesale Enquiry'),
  ('announcement_1',        'text', 'Worldwide Shipping on All Orders'),
  ('announcement_2',        'text', 'Handcrafted in Kanpur, India Since 2014'),
  ('announcement_3',        'text', '300+ Historical Reproductions In Stock'),
  ('wholesale_headline',    'text', 'Partner Directly with the Manufacturer'),
  ('wholesale_subheadline', 'text', 'Minimum 100 pieces per order. Competitive factory pricing. Serving retailers, museums and film productions worldwide.'),
  ('brand_story_headline',  'text', 'Made in India. Trusted Worldwide.'),
  ('brand_story_body',      'text', 'From our workshop in Kanpur — the leather goods capital of India — we craft every piece using the same techniques and materials as the originals. Each item is made to the same specifications as those carried by soldiers across Europe, Asia and the Pacific.')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- Sample Reviews (5 featured — real Amazon/eBay reviews)
INSERT INTO reviews (reviewer_name, rating, title, body, source, featured, is_visible) VALUES
  ('Laura Golla',   5, 'Beyond expectations', 'Beyond expectations. SO NEW — exact same brass construction, stitching and material as the original. A perfect reproduction.', 'amazon', true, true),
  ('C. Sha.',       5, 'Extraordinary build quality', 'It''s a reproduction — but listen. The build quality is extraordinary. Solid enough for real-world use, not just display. 6 stars if I could.', 'amazon', true, true),
  ('Robert S.',     5, 'Exactly as described', 'Arrived on time, no damage, packed very well. Exactly as described. Fits perfectly on my M-1910 AEF pistol belt. Highly recommend.', 'ebay', true, true),
  ('Brian M.',      5, 'Excellent quality', 'Excellent quality, perfect condition, fair price. Exactly as promised. Well wrapped and shipped securely.', 'ebay', true, true),
  ('Sarah A.',      5, 'Great value for money', 'Received in good time, well packed. Great value for money. Highly recommended seller.', 'ebay', true, true)
ON CONFLICT DO NOTHING;

-- ── Done ─────────────────────────────────────────────────────
SELECT 'Migration complete ✓' AS status,
  (SELECT count(*) FROM categories) AS categories,
  (SELECT count(*) FROM brand_stats) AS brand_stats,
  (SELECT count(*) FROM exchange_rates) AS exchange_rates,
  (SELECT count(*) FROM reviews) AS reviews,
  (SELECT count(*) FROM content_blocks) AS content_blocks;
