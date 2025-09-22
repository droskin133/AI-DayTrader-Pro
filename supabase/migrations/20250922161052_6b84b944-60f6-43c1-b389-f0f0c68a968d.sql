-- Create only the essential new tables without problematic indexes

-- Core logging table for function errors and audit
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  function_name TEXT NOT NULL,
  error_message TEXT,
  request_id UUID,
  payload_hash TEXT,
  upstream_status INTEGER,
  latency_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User alerts table with natural language conditions
CREATE TABLE IF NOT EXISTS public.user_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ticker TEXT NOT NULL,
  condition TEXT NOT NULL,
  notify_in_app BOOLEAN DEFAULT TRUE,
  notify_discord BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- News cache for performance
CREATE TABLE IF NOT EXISTS public.news_cache (
  id TEXT PRIMARY KEY,
  symbol TEXT,
  headline TEXT,
  url TEXT,
  published_at TIMESTAMPTZ,
  sentiment NUMERIC,
  raw JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Institutional trades cache
CREATE TABLE IF NOT EXISTS public.institutional_trades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol TEXT NOT NULL,
  source TEXT NOT NULL,
  data JSONB NOT NULL,
  reported_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add missing column to watchlist
ALTER TABLE public.watchlist ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;

-- Enable RLS on user_alerts
ALTER TABLE public.user_alerts ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_alerts
DROP POLICY IF EXISTS "alerts_select_own" ON public.user_alerts;
CREATE POLICY "alerts_select_own" ON public.user_alerts FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "alerts_insert_own" ON public.user_alerts;
CREATE POLICY "alerts_insert_own" ON public.user_alerts FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "alerts_update_own" ON public.user_alerts;
CREATE POLICY "alerts_update_own" ON public.user_alerts FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "alerts_delete_own" ON public.user_alerts;
CREATE POLICY "alerts_delete_own" ON public.user_alerts FOR DELETE USING (auth.uid() = user_id);

-- Essential performance indexes only
CREATE INDEX IF NOT EXISTS idx_news_cache_symbol_time ON public.news_cache(symbol, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_inst_trades_symbol_time ON public.institutional_trades(symbol, reported_at DESC);