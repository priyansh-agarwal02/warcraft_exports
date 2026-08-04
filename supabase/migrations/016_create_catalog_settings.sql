-- ============================================================
-- WARCRAFT EXPORTS — Distributor Catalog Settings Migration
-- ============================================================

CREATE TABLE IF NOT EXISTS public.catalog_settings (
  id                       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title                    text NOT NULL DEFAULT '2026 WHOLESALE DISTRIBUTOR CATALOG',
  subtitle                 text NOT NULL DEFAULT 'Handcrafted Reproductions & Historical Militaria',
  price_adjustment_percent decimal(5,2) NOT NULL DEFAULT 0.00,
  show_variants            boolean NOT NULL DEFAULT true,
  distributor_notes        text NOT NULL DEFAULT 'Minimum wholesale order: 100 units or USD 1,000 net value. Factory Direct from Kanpur, India.',
  legal_terms              text NOT NULL DEFAULT 'PROPRIETARY & NON-DISCLOSURE NOTICE: Warcraft Exports products are supplied for offline wholesale distribution only. Online sale or marketplace re-listing is strictly prohibited.',
  business_terms           text NOT NULL DEFAULT '1. DISTRIBUTION & BRAND USE
Warcraft Exports products are supplied to approved distributors for offline wholesale and distribution only. Online listing or sale through Amazon, eBay, Walmart, other marketplaces, e-commerce websites, social-media stores, or any other online sales channel is not permitted, whether under the Warcraft Exports name, the distributor’s own name, or any other brand.

All product designs, photographs, descriptions, specifications, trademarks, and catalog content remain the property of Warcraft Exports, a brand of RAAS ENTERPRISES, and may not be reproduced or commercially used without permission.

2. MINIMUM ORDER & SHIPPING
Minimum order: 100 units or USD 1,000 net order value.
Orders are supplied FOB Kanpur, India. Customs duties, import duties, taxes, and destination charges are the buyer’s responsibility.

3. PAYMENT TERMS
50% advance upon order confirmation and 50% balance prior to dispatch. Payment accepted via wire transfer or PayPal.

4. QUALITY & CLAIMS
Our products are handcrafted using solid brass fittings and top-grain leather. Due to their handcrafted nature, minor variations may occur.

Manufacturing defect claims must be submitted within 14 days of receipt, along with photographs and order details, for review and appropriate replacement or credit.

5. ORDER ACCEPTANCE
Placement of an order confirms the buyer’s acceptance of these wholesale and distributor terms.',
  excluded_product_ids     uuid[] NOT NULL DEFAULT '{}',
  excluded_category_ids    uuid[] NOT NULL DEFAULT '{}',
  updated_at               timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.catalog_settings ENABLE ROW LEVEL SECURITY;

-- Security Policies (Strictly Admin Only)
CREATE POLICY "admin_all_catalog_settings" ON public.catalog_settings
  FOR ALL USING (is_admin());

-- Seed default record if not exists
INSERT INTO public.catalog_settings (id, title, price_adjustment_percent)
SELECT '00000000-0000-0000-0000-000000000001', '2026 WHOLESALE DISTRIBUTOR CATALOG', 0.00
ON CONFLICT (id) DO NOTHING;
