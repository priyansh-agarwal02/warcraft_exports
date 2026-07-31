-- ── 015 Add image_url to product_variants ─────────────────────
-- Allows variants (e.g. Olive Drab, Tan, Black) to have dedicated hero images (Amazon-style cataloging)

ALTER TABLE product_variants ADD COLUMN IF NOT EXISTS image_url text;
