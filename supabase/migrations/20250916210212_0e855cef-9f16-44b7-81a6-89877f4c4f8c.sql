-- Continue security fixes - Part 2: Secure critical unprotected tables

-- Step 4: Enable RLS and add policies for profiles table (critical - contains personal data)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_own" ON public.profiles
FOR SELECT USING (id = auth.uid());

CREATE POLICY "profiles_insert_own" ON public.profiles
FOR INSERT WITH CHECK (id = auth.uid());

CREATE POLICY "profiles_update_own" ON public.profiles
FOR UPDATE USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Step 5: Enable RLS and add policies for system_config table
ALTER TABLE public.system_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "system_config_admin_only" ON public.system_config
FOR ALL USING (public.get_current_user_role() IN ('admin', 'president'));

-- Step 6: Enable RLS for other critical unprotected tables
ALTER TABLE public.annotations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "annotations_user_own" ON public.annotations
FOR ALL USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

ALTER TABLE public.ai_autoscan_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ai_autoscan_results_public_read" ON public.ai_autoscan_results
FOR SELECT USING (true);

ALTER TABLE public.alerts_fired ENABLE ROW LEVEL SECURITY;

CREATE POLICY "alerts_fired_user_own" ON public.alerts_fired
FOR SELECT USING (user_id = auth.uid());

ALTER TABLE public.function_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "function_logs_admin_only" ON public.function_logs
FOR SELECT USING (public.get_current_user_role() IN ('admin', 'president'));

ALTER TABLE public.impersonation_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "impersonation_logs_admin_only" ON public.impersonation_logs
FOR SELECT USING (public.get_current_user_role() IN ('admin', 'president'));

ALTER TABLE public.prompt_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "prompt_templates_public_read" ON public.prompt_templates
FOR SELECT USING (true);

CREATE POLICY "prompt_templates_admin_manage" ON public.prompt_templates
FOR ALL USING (public.get_current_user_role() IN ('admin', 'president'));

ALTER TABLE public.stocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "stocks_public_read" ON public.stocks
FOR SELECT USING (true);

ALTER TABLE public.user_legal_acceptance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_legal_acceptance_own" ON public.user_legal_acceptance
FOR ALL USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());