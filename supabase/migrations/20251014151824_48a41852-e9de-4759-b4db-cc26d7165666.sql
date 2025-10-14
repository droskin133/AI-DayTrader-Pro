-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create app_role enum for user_roles
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('free', 'premium', 'admin');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  display_name text,
  tier text DEFAULT 'free' CHECK (tier IN ('free', 'premium')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- user_watchlist (renamed from watchlist)
CREATE TABLE IF NOT EXISTS public.user_watchlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  symbol text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE (user_id, symbol)
);

-- market_data
CREATE TABLE IF NOT EXISTS public.market_data (
  symbol text PRIMARY KEY,
  last_trade_price numeric,
  percent_change numeric,
  volume bigint,
  pe numeric,
  eps numeric,
  float numeric,
  short_interest numeric,
  updated_at timestamptz DEFAULT now()
);

-- news_feed (renamed from news_events)
CREATE TABLE IF NOT EXISTS public.news_feed (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol text,
  headline text NOT NULL,
  source text NOT NULL,
  url text NOT NULL,
  published_at timestamptz NOT NULL,
  sentiment numeric,
  ingested_at timestamptz DEFAULT now()
);

-- user_roles (separate table for security)
CREATE TABLE IF NOT EXISTS public.user_roles (
  user_id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  role public.app_role NOT NULL DEFAULT 'free',
  updated_at timestamptz DEFAULT now()
);

-- audit_fix_log
CREATE TABLE IF NOT EXISTS public.audit_fix_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  component text NOT NULL,
  change jsonb NOT NULL,
  confidence numeric,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_watchlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_feed ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_learning_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_run_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.error_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_fix_log ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS Policies
DROP POLICY IF EXISTS profiles_self_access ON public.profiles;
CREATE POLICY profiles_self_access ON public.profiles
  FOR ALL USING (id = auth.uid());

DROP POLICY IF EXISTS watchlist_owner_access ON public.user_watchlist;
CREATE POLICY watchlist_owner_access ON public.user_watchlist
  FOR ALL USING (user_id = auth.uid());

DROP POLICY IF EXISTS market_data_public_read ON public.market_data;
CREATE POLICY market_data_public_read ON public.market_data
  FOR SELECT USING (true);

DROP POLICY IF EXISTS news_feed_public_read ON public.news_feed;
CREATE POLICY news_feed_public_read ON public.news_feed
  FOR SELECT USING (true);

DROP POLICY IF EXISTS ai_learning_log_owner ON public.ai_learning_log;
CREATE POLICY ai_learning_log_owner ON public.ai_learning_log
  FOR ALL USING (user_id = auth.uid());

DROP POLICY IF EXISTS ai_run_metrics_owner ON public.ai_run_metrics;
CREATE POLICY ai_run_metrics_owner ON public.ai_run_metrics
  FOR ALL USING (user_id = auth.uid());

DROP POLICY IF EXISTS alerts_owner ON public.alerts;
CREATE POLICY alerts_owner ON public.alerts
  FOR ALL USING (user_id = auth.uid());

DROP POLICY IF EXISTS user_roles_self_read ON public.user_roles;
CREATE POLICY user_roles_self_read ON public.user_roles
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS error_logs_service ON public.error_logs;
CREATE POLICY error_logs_service ON public.error_logs
  FOR ALL USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS audit_fix_log_service ON public.audit_fix_log;
CREATE POLICY audit_fix_log_service ON public.audit_fix_log
  FOR ALL USING (auth.role() = 'service_role');

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_watchlist_user_id ON public.user_watchlist(user_id);
CREATE INDEX IF NOT EXISTS idx_news_feed_published_at ON public.news_feed(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_feed_symbol ON public.news_feed(symbol);
CREATE INDEX IF NOT EXISTS idx_ai_learning_log_user_id ON public.ai_learning_log(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_run_metrics_user_id ON public.ai_run_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_alerts_user_id ON public.alerts(user_id);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
DROP TRIGGER IF EXISTS set_updated_at_profiles ON public.profiles;
CREATE TRIGGER set_updated_at_profiles
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_market_data ON public.market_data;
CREATE TRIGGER set_updated_at_market_data
  BEFORE UPDATE ON public.market_data
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_user_roles ON public.user_roles;
CREATE TRIGGER set_updated_at_user_roles
  BEFORE UPDATE ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Realtime setup
ALTER TABLE public.user_watchlist REPLICA IDENTITY FULL;
ALTER TABLE public.market_data REPLICA IDENTITY FULL;
ALTER TABLE public.news_feed REPLICA IDENTITY FULL;
ALTER TABLE public.alerts REPLICA IDENTITY FULL;
ALTER TABLE public.ai_learning_log REPLICA IDENTITY FULL;