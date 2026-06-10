-- ============================================================
-- WARCRAFT EXPORTS — Schema Alignment Migration
-- Adds columns expected by the frontend but missing from 001
-- Run in Supabase SQL Editor
-- ============================================================

-- Products: add missing columns
ALTER TABLE products ADD COLUMN IF NOT EXISTS max_price_usd decimal(10,2);
ALTER TABLE products ADD COLUMN IF NOT EXISTS compare_at_price decimal(10,2);
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_new boolean DEFAULT false;
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_in_stock boolean DEFAULT true;
ALTER TABLE products ADD COLUMN IF NOT EXISTS avg_rating decimal(3,2);
ALTER TABLE products ADD COLUMN IF NOT EXISTS review_count integer DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS has_variations boolean DEFAULT false;
ALTER TABLE products ADD COLUMN IF NOT EXISTS full_description text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS finish text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS dimensions text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS care_instructions text;

SELECT 'Schema alignment complete ✓' AS status;
