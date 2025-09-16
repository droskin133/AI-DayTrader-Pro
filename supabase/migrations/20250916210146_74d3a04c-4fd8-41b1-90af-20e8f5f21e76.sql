-- Fix critical security issues - Step by step approach

-- Step 1: Create security definer function to break infinite recursion
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.user_profiles WHERE user_id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

-- Step 2: Drop ALL existing policies on user_profiles to start fresh
DROP POLICY IF EXISTS "Users can edit own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;  
DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "admin set tier" ON public.user_profiles;
DROP POLICY IF EXISTS "profile admin-read" ON public.user_profiles;
DROP POLICY IF EXISTS "profile self-read" ON public.user_profiles;
DROP POLICY IF EXISTS "profile self-update-nonrole" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;

-- Step 3: Create new non-recursive policies for user_profiles
CREATE POLICY "user_profiles_select_own" ON public.user_profiles
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "user_profiles_update_own" ON public.user_profiles  
FOR UPDATE USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "user_profiles_admin_select_all" ON public.user_profiles
FOR SELECT USING (public.get_current_user_role() IN ('admin', 'president'));

CREATE POLICY "user_profiles_admin_update_tiers" ON public.user_profiles
FOR UPDATE USING (public.get_current_user_role() IN ('admin', 'president'))
WITH CHECK (role IN ('free', 'basic', 'premium', 'admin', 'president'));