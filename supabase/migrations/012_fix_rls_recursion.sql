-- REDEFINE IS_ADMIN TO PREVENT RLS INLINE RECURSION
-- Changing this function from LANGUAGE sql to LANGUAGE plpgsql SECURITY DEFINER
-- prevents Postgres from inlining the subquery, thereby bypassing RLS recursion.
-- Rollback:
-- CREATE OR REPLACE FUNCTION is_admin()
-- RETURNS boolean AS $$
--   SELECT EXISTS (
--     SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
--   );
-- $$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
DECLARE
  is_admin_user boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  ) INTO is_admin_user;
  RETURN is_admin_user;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
