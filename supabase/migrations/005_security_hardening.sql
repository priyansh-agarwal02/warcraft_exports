-- =========================================================================
-- WARCRAFT EXPORTS — SECURITY HARDENING MIGRATION
-- Run this in your Supabase SQL Editor (warcraft_exports project)
-- =========================================================================

-- 1. Secure & Complete trigger function for new user registrations
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email,
    'customer' -- Automatically and strictly hardcode role as customer on registration
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
    email = COALESCE(EXCLUDED.email, public.profiles.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-establish the signup trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- 2. Redefine Profile Update RLS policy to strictly prevent privilege escalation
DROP POLICY IF EXISTS "user_update_own_profile" ON public.profiles;

CREATE POLICY "user_update_own_profile" ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND (
      -- 1. Either the role is remaining 'customer' (standard user can update their details)
      (role = 'customer')
      -- 2. Or the user performing the update is already an administrator
      OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
    )
  );

-- 3. Confirm all active roles in the system
SELECT id, email, full_name, role FROM public.profiles;
