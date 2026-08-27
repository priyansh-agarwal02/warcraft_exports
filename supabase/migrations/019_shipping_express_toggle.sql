-- ============================================================
-- WARCRAFT EXPORTS — Add Express Shipping Toggle Migration
-- Adds is_express_enabled column to shipping_rates table
-- ============================================================

ALTER TABLE public.shipping_rates 
ADD COLUMN IF NOT EXISTS is_express_enabled boolean NOT NULL DEFAULT true;

SELECT 'is_express_enabled column added to shipping_rates ✓' AS status;
