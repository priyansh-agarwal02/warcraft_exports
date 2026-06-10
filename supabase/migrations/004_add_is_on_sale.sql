-- Add is_on_sale flag to products
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_on_sale BOOLEAN NOT NULL DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_products_is_on_sale ON products (is_on_sale) WHERE is_on_sale = TRUE;

-- Seed sale banner settings in content_blocks
INSERT INTO content_blocks (key, type, value)
VALUES (
  'sale_banner',
  'json',
  '{"enabled":false,"title":"SALE","subtitle":"Special discounts on selected items","countdownTo":null,"bgColor":"#18181B","textColor":"#FFFFFF","accentColor":"#BBAC48"}'
)
ON CONFLICT (key) DO NOTHING;
