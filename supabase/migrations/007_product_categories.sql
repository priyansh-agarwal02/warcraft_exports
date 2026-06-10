-- ============================================================
-- WARCRAFT EXPORTS — Product Categories Join Table Migration
-- Adds a join table to support many-to-many product/category relationships.
-- ============================================================

-- Create join table
CREATE TABLE IF NOT EXISTS product_categories (
  product_id  uuid REFERENCES products(id) ON DELETE CASCADE,
  category_id uuid REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (product_id, category_id)
);

-- Migrate existing data from products.category_id column to the join table
INSERT INTO product_categories (product_id, category_id)
SELECT id, category_id FROM products WHERE category_id IS NOT NULL
ON CONFLICT DO NOTHING;

-- RLS Policies
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_product_categories" 
  ON product_categories FOR SELECT 
  USING (true);

CREATE POLICY "admin_all_product_categories" 
  ON product_categories FOR ALL 
  USING (is_admin());

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_product_categories_product ON product_categories(product_id);
CREATE INDEX IF NOT EXISTS idx_product_categories_category ON product_categories(category_id);
