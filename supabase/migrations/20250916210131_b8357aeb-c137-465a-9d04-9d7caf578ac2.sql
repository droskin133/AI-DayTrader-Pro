-- Fix remaining security issues from linter

-- Step 1: Enable RLS on remaining tables without protection
ALTER TABLE public.ai_scan_top_scores_view ENABLE ROW LEVEL SECURITY;
CREATE POLICY "All users can view AI scan top scores" ON public.ai_scan_top_scores_view
FOR SELECT USING (true);

ALTER TABLE public.user_alerts_view ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own alerts" ON public.user_alerts_view
FOR SELECT USING (user_id = auth.uid());

-- Step 2: Add missing RLS for vendor_keys table
ALTER TABLE public.vendor_keys ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage vendor keys" ON public.vendor_keys
FOR ALL USING (public.get_current_user_role() IN ('admin', 'president'));

-- Step 3: Fix all database functions to have proper search_path (security requirement)
CREATE OR REPLACE FUNCTION public.admin_set_role(p_user uuid, p_role text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  UPDATE public.profiles SET role = p_role WHERE id = p_user;
END$function$;

CREATE OR REPLACE FUNCTION public.toggle_watchlist(ticker text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
begin
  if exists (
    select 1 from public.watchlist where user_id = auth.uid() and ticker = toggle_watchlist.ticker
  ) then
    delete from public.watchlist where user_id = auth.uid() and ticker = toggle_watchlist.ticker;
  else
    insert into public.watchlist (user_id, ticker) values (auth.uid(), toggle_watchlist.ticker);
  end if;
end;
$function$;

CREATE OR REPLACE FUNCTION public.reset_throttle()
RETURNS void
LANGUAGE plpgsql
SET search_path = public
AS $function$
begin
  update public.api_usage set request_count = 0, last_reset = now();
end;
$function$;

CREATE OR REPLACE FUNCTION public.export_logger(type text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
begin
  insert into public.export_logs (user_id, export_type)
  values (auth.uid(), type);
end;
$function$;

CREATE OR REPLACE FUNCTION public.send_push_notification(title text, body text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
begin
  insert into public.push_notifications (user_id, title, body)
  values (auth.uid(), title, body);
end;
$function$;

CREATE OR REPLACE FUNCTION public.audit_impersonation(target_user uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
begin
  insert into public.impersonation_logs (admin_user, target_user)
  values (auth.uid(), target_user);
end;
$function$;

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
begin
  new.updated_at = now();
  return new;
end;
$function$;

CREATE OR REPLACE FUNCTION public.process_alerts(alert_json jsonb, alert_type alert_type_enum)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
begin
  insert into public.alerts (user_id, logic, alert_type)
  values (auth.uid(), alert_json, alert_type);
end;
$function$;

CREATE OR REPLACE FUNCTION public.flag_set(_key text, _is_enabled boolean, _value jsonb DEFAULT '{}'::jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.user_profiles WHERE user_id=auth.uid() AND role='president') THEN
    RAISE EXCEPTION 'Only President can change feature flags';
  END IF;
  INSERT INTO public.feature_flags(key,value,is_enabled,updated_by,updated_at)
  VALUES (_key,_value,_is_enabled,auth.uid(),now())
  ON CONFLICT (key) DO UPDATE
  SET value=EXCLUDED.value, is_enabled=EXCLUDED.is_enabled, updated_by=EXCLUDED.updated_by, updated_at=now();
  PERFORM public.audit_write('flag_set', NULL, jsonb_build_object('key',_key,'enabled',_is_enabled));
END $function$;

CREATE OR REPLACE FUNCTION public.throttle_set(_plan text, _rpm integer, _rpd integer, _max_alerts integer, _max_backtests integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.user_profiles WHERE user_id=auth.uid() AND role='president') THEN
    RAISE EXCEPTION 'Only President can set throttles';
  END IF;
  INSERT INTO public.plan_throttles(plan,rpm,rpd,max_alerts,max_backtests)
  VALUES (_plan,_rpm,_rpd,_max_alerts,_max_backtests)
  ON CONFLICT (plan) DO UPDATE
  SET rpm=EXCLUDED.rpm, rpd=EXCLUDED.rpd, max_alerts=EXCLUDED.max_alerts, max_backtests=EXCLUDED.max_backtests;
  PERFORM public.audit_write('throttle_set', NULL, jsonb_build_object('plan',_plan,'rpm',_rpm,'rpd',_rpd));
END $function$;

CREATE OR REPLACE FUNCTION public.trigger_alerts()
RETURNS void
LANGUAGE plpgsql
SET search_path = public
AS $function$
begin
  -- placeholder for checking logic vs real-time data
  insert into public.alerts_fired (alert_id, fired_at)
  select id, now() from public.alerts where logic @> '{"mock":true}';
end;
$function$;

CREATE OR REPLACE FUNCTION public.run_backtest(alert_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SET search_path = public
AS $function$
declare
  result jsonb;
begin
  -- placeholder for simulation result
  select jsonb_build_object('win_rate', 0.75, 'avg_return', 12.5) into result;
  return result;
end;
$function$;

CREATE OR REPLACE FUNCTION public.legal_acceptance()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
begin
  insert into public.legal_acceptances (user_id)
  values (auth.uid())
  on conflict (user_id) do update set accepted_at = now();
end;
$function$;

CREATE OR REPLACE FUNCTION public.rating_handler(prompt_id uuid, rating integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
begin
  insert into public.ai_feedback (user_id, prompt_id, rating)
  values (auth.uid(), prompt_id, rating);
end;
$function$;

CREATE OR REPLACE FUNCTION public.autonomous_ai_scan()
RETURNS void
LANGUAGE plpgsql
SET search_path = public
AS $function$
begin
  insert into public.ai_autoscan_results (symbol, pattern, confidence)
  values ('AAPL', 'Cup and Handle', 95);
end;
$function$;

CREATE OR REPLACE FUNCTION public.prompt_optimizer()
RETURNS void
LANGUAGE plpgsql
SET search_path = public
AS $function$
begin
  -- placeholder for improving future GPT prompts
  update public.prompt_templates set last_tuned = now();
end;
$function$;

CREATE OR REPLACE FUNCTION public.expire_alerts()
RETURNS void
LANGUAGE plpgsql
SET search_path = public
AS $function$
begin
  update public.alerts set is_active = false where expires_at < now();
end;
$function$;

CREATE OR REPLACE FUNCTION public.rbac_revoke_admin(target uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.user_profiles WHERE user_id = auth.uid() AND role='president') THEN
    RAISE EXCEPTION 'Only President can revoke admin';
  END IF;
  UPDATE public.user_profiles SET role='premium' WHERE user_id=target;
  PERFORM public.audit_write('revoke_admin', target, jsonb_build_object('by',auth.uid()));
END $function$;

CREATE OR REPLACE FUNCTION public.rbac_transfer_presidency(new_president uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE current_president uuid;
BEGIN
  SELECT user_id INTO current_president FROM public.user_profiles WHERE role='president' LIMIT 1;
  IF current_president IS NULL OR current_president <> auth.uid() THEN
    RAISE EXCEPTION 'Only current President can transfer presidency';
  END IF;
  UPDATE public.user_profiles SET role='admin' WHERE user_id=current_president;
  UPDATE public.user_profiles SET role='president' WHERE user_id=new_president;
  PERFORM public.audit_write('transfer_presidency', new_president, jsonb_build_object('from',current_president,'to',new_president));
END $function$;

CREATE OR REPLACE FUNCTION public.legal_upsert(_kind text, _content text, _activate boolean DEFAULT true)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE next_version int;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.user_profiles WHERE user_id=auth.uid() AND role='president') THEN
    RAISE EXCEPTION 'Only President can change legal text';
  END IF;
  SELECT COALESCE(MAX(version),0)+1 INTO next_version FROM public.legal_texts WHERE kind=_kind;
  IF _activate THEN
    UPDATE public.legal_texts SET is_active=false WHERE kind=_kind AND is_active=true;
  END IF;
  INSERT INTO public.legal_texts(kind,version,content,is_active,created_by)
  VALUES (_kind,next_version,_content,_activate,auth.uid());
  PERFORM public.audit_write('legal_upsert', NULL, jsonb_build_object('kind',_kind,'version',next_version,'activated',_activate));
END $function$;

CREATE OR REPLACE FUNCTION public.export_approve_full(_export_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE caller_role public.user_role_enum;
BEGIN
  SELECT role INTO caller_role FROM public.user_profiles WHERE user_id=auth.uid();
  IF caller_role <> 'president' THEN
    RAISE EXCEPTION 'Only President can approve full export';
  END IF;
  UPDATE public.export_requests
  SET token = encode(gen_random_bytes(16),'hex'), status='approved'
  WHERE id = _export_id AND scope='full';
  PERFORM public.audit_write('export_approve_full', NULL, jsonb_build_object('export_id',_export_id));
END $function$;

CREATE OR REPLACE FUNCTION public.ai_config_set(_key text, _value jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.user_profiles WHERE user_id=auth.uid() AND role='president') THEN
    RAISE EXCEPTION 'Only President can change AI config';
  END IF;
  INSERT INTO public.ai_configs(key,value,updated_by,updated_at)
  VALUES (_key,_value,auth.uid(),now())
  ON CONFLICT (key) DO UPDATE
  SET value=EXCLUDED.value, updated_by=EXCLUDED.updated_by, updated_at=now();
  PERFORM public.audit_write('ai_config_set', NULL, jsonb_build_object('key',_key));
END $function$;

CREATE OR REPLACE FUNCTION public.audit_write(_action text, _target uuid, _meta jsonb DEFAULT '{}'::jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  INSERT INTO public.audit_log(actor, action, target, meta)
  VALUES (auth.uid(), _action, _target, COALESCE(_meta,'{}'::jsonb));
END $function$;

CREATE OR REPLACE FUNCTION public.rbac_grant_admin(target uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.user_profiles WHERE user_id = auth.uid() AND role='president') THEN
    RAISE EXCEPTION 'Only President can grant admin';
  END IF;
  UPDATE public.user_profiles SET role='admin' WHERE user_id=target;
  PERFORM public.audit_write('grant_admin', target, jsonb_build_object('by',auth.uid()));
END $function$;

CREATE OR REPLACE FUNCTION public.set_user_id()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  IF (NEW.user_id IS NULL) THEN
    NEW.user_id := auth.uid();
  END IF;
  RETURN NEW;
END $function$;

CREATE OR REPLACE FUNCTION public.prevent_role_change()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    RAISE EXCEPTION 'Direct role updates are not allowed';
  END IF;
  RETURN NEW;
END $function$;

CREATE OR REPLACE FUNCTION public.vendor_set(_vendor text, _scope text, _api_key text, _meta jsonb DEFAULT '{}'::jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.user_profiles WHERE user_id=auth.uid() AND role='president') THEN
    RAISE EXCEPTION 'Only President can set vendor keys';
  END IF;
  INSERT INTO public.vendor_configs(vendor,scope,api_key,meta,created_by)
  VALUES (_vendor,_scope,_api_key,COALESCE(_meta,'{}'::jsonb),auth.uid())
  ON CONFLICT (vendor,scope) DO UPDATE
  SET api_key=EXCLUDED.api_key, meta=EXCLUDED.meta, updated_at=now();
  PERFORM public.audit_write('vendor_set', NULL, jsonb_build_object('vendor',_vendor,'scope',_scope));
END $function$;