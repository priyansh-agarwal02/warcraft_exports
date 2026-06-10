-- ============================================================
-- WARCRAFT EXPORTS — Add ships_from_usa to products table
-- Creates the ships_from_usa column and index.
-- Run this in Supabase SQL Editor (warcraft_exports project)
-- ============================================================

ALTER TABLE public.products ADD COLUMN IF NOT EXISTS ships_from_usa BOOLEAN NOT NULL DEFAULT FALSE;

-- Performance index for filtering by ships_from_usa
CREATE INDEX IF NOT EXISTS idx_products_ships_from_usa ON public.products(ships_from_usa) WHERE ships_from_usa = TRUE;

-- Select statement to verify success
SELECT 'ships_from_usa column added and indexed successfully ✓' AS status;
