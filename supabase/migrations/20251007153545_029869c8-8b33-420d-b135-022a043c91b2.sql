-- =============================================================
-- 20251006_fixpack.sql — Main Page + AI Tool, No‑Dummy, Alignments
-- =============================================================

-- 1) Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2) Watchlist: unify to singular table
DROP TABLE IF EXISTS public.watchlists CASCADE;
CREATE TABLE IF NOT EXISTS public.watchlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  ticker text NOT NULL,
  sort_order int,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, ticker)
);
ALTER TABLE public.watchlist ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS watchlist_owner ON public.watchlist;
CREATE POLICY watchlist_owner ON public.watchlist FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 3) Toggle RPC (idempotent)
CREATE OR REPLACE FUNCTION public.toggle_watchlist(ticker text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.watchlist WHERE user_id = auth.uid() AND public.watchlist.ticker = toggle_watchlist.ticker) THEN
    DELETE FROM public.watchlist WHERE user_id = auth.uid() AND public.watchlist.ticker = toggle_watchlist.ticker;
  ELSE
    INSERT INTO public.watchlist (user_id, ticker) VALUES (auth.uid(), toggle_watchlist.ticker);
  END IF;
END;$$;

-- 4) Latest price view + RPC for UI join
DROP VIEW IF EXISTS public.latest_price CASCADE;
CREATE OR REPLACE VIEW public.latest_price AS
SELECT DISTINCT ON (ticker) ticker, price, ts
FROM public.stock_prices
ORDER BY ticker, ts DESC;

DROP FUNCTION IF EXISTS public.get_watchlist_with_prices() CASCADE;
CREATE OR REPLACE FUNCTION public.get_watchlist_with_prices()
RETURNS TABLE(ticker text, price numeric, ts timestamptz)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT w.ticker, lp.price, lp.ts
  FROM public.watchlist w
  LEFT JOIN public.latest_price lp ON lp.ticker = w.ticker
  WHERE w.user_id = auth.uid()
  ORDER BY w.sort_order NULLS LAST, w.ticker;$$;

-- 5) AI Trader Tool: missing tables (lightweight)
CREATE TABLE IF NOT EXISTS public.ai_institutional_signals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticker text NOT NULL,
  signal text,
  confidence numeric,
  ts timestamptz DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.ai_commodity_signals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  commodity text NOT NULL,
  signal text,
  confidence numeric,
  ts timestamptz DEFAULT now()
);
ALTER TABLE public.ai_institutional_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_commodity_signals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS ai_institutional_signals_owner ON public.ai_institutional_signals;
DROP POLICY IF EXISTS ai_commodity_signals_owner ON public.ai_commodity_signals;
CREATE POLICY ai_institutional_signals_owner ON public.ai_institutional_signals FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY ai_commodity_signals_owner ON public.ai_commodity_signals FOR ALL USING (auth.uid() IS NOT NULL);

-- 6) Baseline audit/error tables (idempotent safety)
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id bigserial PRIMARY KEY,
  function_name text,
  action text,
  table_name text,
  record_id text,
  actor uuid,
  payload jsonb,
  created_at timestamptz DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.error_logs (
  id bigserial PRIMARY KEY,
  function_name text,
  error_message text,
  request_id text,
  context jsonb,
  upstream_status int,
  latency_ms int,
  created_at timestamptz DEFAULT now()
);