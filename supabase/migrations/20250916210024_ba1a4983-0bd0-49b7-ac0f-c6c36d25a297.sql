-- Fix critical security issues

-- Step 1: Create security definer function to break infinite recursion
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.user_profiles WHERE user_id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

-- Step 2: Drop problematic policies on user_profiles that cause infinite recursion
DROP POLICY IF EXISTS "Users can edit own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "admin set tier" ON public.user_profiles;
DROP POLICY IF EXISTS "profile admin-read" ON public.user_profiles;
DROP POLICY IF EXISTS "profile self-read" ON public.user_profiles;
DROP POLICY IF EXISTS "profile self-update-nonrole" ON public.user_profiles;

-- Step 3: Create new non-recursive policies for user_profiles
CREATE POLICY "Users can view own profile" ON public.user_profiles
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update own profile" ON public.user_profiles
FOR UPDATE USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid() AND role = (SELECT role FROM public.user_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Admins can view all profiles" ON public.user_profiles
FOR SELECT USING (public.get_current_user_role() IN ('admin', 'president'));

CREATE POLICY "Admins can update user tiers" ON public.user_profiles
FOR UPDATE USING (public.get_current_user_role() IN ('admin', 'president'))
WITH CHECK (role IN ('free', 'basic', 'premium'));

-- Step 4: Enable RLS and add policies for profiles table (critical - contains personal data)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles
FOR SELECT USING (id = auth.uid());

CREATE POLICY "Users can insert own profile" ON public.profiles
FOR INSERT WITH CHECK (id = auth.uid());

CREATE POLICY "Users can update own profile" ON public.profiles
FOR UPDATE USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Step 5: Enable RLS and add policies for system_config table
ALTER TABLE public.system_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can access system config" ON public.system_config
FOR ALL USING (public.get_current_user_role() IN ('admin', 'president'));

-- Step 6: Enable RLS and add policies for other critical unprotected tables
ALTER TABLE public.annotations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own annotations" ON public.annotations
FOR ALL USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

ALTER TABLE public.ai_autoscan_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All users can view AI scan results" ON public.ai_autoscan_results
FOR SELECT USING (true);

ALTER TABLE public.alerts_fired ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view alerts fired for their alerts" ON public.alerts_fired
FOR SELECT USING (user_id = auth.uid());

ALTER TABLE public.function_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view function logs" ON public.function_logs
FOR SELECT USING (public.get_current_user_role() IN ('admin', 'president'));

ALTER TABLE public.impersonation_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view impersonation logs" ON public.impersonation_logs
FOR SELECT USING (public.get_current_user_role() IN ('admin', 'president'));

ALTER TABLE public.prompt_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All users can view prompt templates" ON public.prompt_templates
FOR SELECT USING (true);

CREATE POLICY "Admins can manage prompt templates" ON public.prompt_templates
FOR ALL USING (public.get_current_user_role() IN ('admin', 'president'));

ALTER TABLE public.stocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All users can view stocks" ON public.stocks
FOR SELECT USING (true);

ALTER TABLE public.user_legal_acceptance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own legal acceptance" ON public.user_legal_acceptance
FOR ALL USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Step 7: Create watchlist table with proper RLS (referenced in other policies but missing)
CREATE TABLE IF NOT EXISTS public.watchlist (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL DEFAULT auth.uid(),
  ticker text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, ticker)
);

ALTER TABLE public.watchlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own watchlist" ON public.watchlist
FOR ALL USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());