-- ============================================================
-- WARCRAFT EXPORTS — Shipping Rates Migration
-- Creates the shipping_rates table, adds performance indexes,
-- and configures RLS security policies.
-- Run this in Supabase SQL Editor (warcraft_exports project)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.shipping_rates (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  country_code    text UNIQUE NOT NULL,
  country_name    text NOT NULL,
  standard_days   text NOT NULL,
  standard_price  decimal(10,2) NOT NULL DEFAULT 0.00,
  express_days    text NOT NULL,
  express_price   decimal(10,2) NOT NULL DEFAULT 0.00,
  free_threshold  decimal(10,2) NOT NULL DEFAULT 0.00,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- Index for country queries
CREATE INDEX IF NOT EXISTS idx_shipping_rates_country ON public.shipping_rates(country_code);

-- Trigger to update updated_at automatically
CREATE OR REPLACE TRIGGER shipping_rates_updated_at
  BEFORE UPDATE ON public.shipping_rates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Enable Row Level Security (RLS)
ALTER TABLE public.shipping_rates ENABLE ROW LEVEL SECURITY;

-- 1. Public Read Policy (anyone can view shipping rates for cart/checkout calculations)
CREATE POLICY "public_read_shipping_rates" ON public.shipping_rates
  FOR SELECT USING (true);

-- 2. Admin All Policy (only admin users can insert, update, or delete rates)
CREATE POLICY "admin_all_shipping_rates" ON public.shipping_rates
  FOR ALL USING (is_admin());

SELECT 'shipping_rates table created and secured ✓' AS status;
