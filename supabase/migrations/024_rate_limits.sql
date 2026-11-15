-- ==============================================================================
-- Migration: 024_rate_limits.sql
-- Purpose: Shared request counter for rate limiting (orders, payments, chat, forms,
--          registration, newsletter, coupons, order tracking). Vercel runs many
--          short-lived server instances, so in-memory counters reset constantly;
--          this table holds the count across all of them.
-- Security: RLS on with NO policies → the table is invisible to the public API.
--           Only the server (service role) may call check_rate_limit().
-- Safe to skip: until this is run, the site falls back to the old in-memory limiter.
-- Rollback:
--   DROP FUNCTION IF EXISTS public.check_rate_limit(text, integer, integer);
--   DROP TABLE IF EXISTS public.rate_limits;
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.rate_limits (
  key          text PRIMARY KEY,
  window_start timestamptz NOT NULL DEFAULT now(),
  count        integer     NOT NULL DEFAULT 0
);

ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;
-- (intentionally no policies)

CREATE INDEX IF NOT EXISTS rate_limits_window_start_idx ON public.rate_limits (window_start);

CREATE OR REPLACE FUNCTION public.check_rate_limit(p_key text, p_limit integer, p_window_seconds integer)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count integer;
BEGIN
  INSERT INTO public.rate_limits AS r (key, window_start, count)
  VALUES (left(p_key, 200), now(), 1)
  ON CONFLICT (key) DO UPDATE SET
    count = CASE WHEN r.window_start < now() - make_interval(secs => p_window_seconds) THEN 1 ELSE r.count + 1 END,
    window_start = CASE WHEN r.window_start < now() - make_interval(secs => p_window_seconds) THEN now() ELSE r.window_start END
  RETURNING count INTO v_count;

  -- Occasional housekeeping so the table stays small
  IF random() < 0.01 THEN
    DELETE FROM public.rate_limits WHERE window_start < now() - interval '1 day';
  END IF;

  RETURN v_count <= p_limit;
END;
$$;

REVOKE ALL ON FUNCTION public.check_rate_limit(text, integer, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.check_rate_limit(text, integer, integer) TO service_role;
