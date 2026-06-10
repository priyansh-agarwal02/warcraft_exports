-- ── Quantity-Based Promotions ─────────────────────────────────────────────────
-- Supports tiered "Buy X get Y% off" promotions site-wide or per product.
-- Run this in Supabase SQL Editor → then use the Admin > Promotions page to manage.

CREATE TABLE IF NOT EXISTS quantity_promotions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name            text NOT NULL,                              -- e.g. "Buy 2+ Save 10%"
  description     text NOT NULL DEFAULT '',
  min_quantity    integer NOT NULL CHECK (min_quantity >= 2), -- minimum items in cart
  discount_percent decimal(5,2) NOT NULL CHECK (discount_percent > 0 AND discount_percent <= 100),
  applies_to      text NOT NULL DEFAULT 'all' CHECK (applies_to IN ('all', 'products')),
  product_ids     uuid[] NOT NULL DEFAULT '{}',               -- empty = all products
  is_active       boolean NOT NULL DEFAULT true,
  expires_at      timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- Index for fast lookup of active promotions
CREATE INDEX IF NOT EXISTS idx_qty_promos_active ON quantity_promotions (is_active, expires_at);

-- Demo promotions (buy 2 get 10% off, buy 3 get 15% off)
INSERT INTO quantity_promotions (name, description, min_quantity, discount_percent, applies_to, is_active)
VALUES
  ('Buy 2+ Save 10%', 'Add any 2 or more items to your cart and save 10% on your entire order.', 2, 10.00, 'all', true),
  ('Buy 3+ Save 15%', 'Add any 3 or more items to your cart and save 15% on your entire order.', 3, 15.00, 'all', true)
ON CONFLICT DO NOTHING;

SELECT 'quantity_promotions table created ✓' AS status,
  count(*) AS demo_promotions FROM quantity_promotions;
