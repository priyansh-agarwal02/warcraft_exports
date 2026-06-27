-- Create site_settings table for global key-value store (SEO, keys, etc.)
CREATE TABLE IF NOT EXISTS public.site_settings (
  key        text PRIMARY KEY,
  value      text,
  updated_at timestamptz DEFAULT now()
);

-- Create page_seo table for per-page title/description overrides
CREATE TABLE IF NOT EXISTS public.page_seo (
  page             text PRIMARY KEY,
  meta_title       text,
  meta_description text,
  updated_at       timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_seo ENABLE ROW LEVEL SECURITY;

-- Helper admin checker function is_admin() is already defined, let's use it:
-- Public Read access
CREATE POLICY "public_read_site_settings" ON public.site_settings
  FOR SELECT USING (true);

CREATE POLICY "public_read_page_seo" ON public.page_seo
  FOR SELECT USING (true);

-- Admin Full access
CREATE POLICY "admin_all_site_settings" ON public.site_settings
  FOR ALL USING (public.is_admin());

CREATE POLICY "admin_all_page_seo" ON public.page_seo
  FOR ALL USING (public.is_admin());
