-- Production Cleanup Migration: Fix enum/view errors, remove test data, harden RLS (final)

-- 1. Drop dependent view and recreate with proper enum
DROP VIEW IF EXISTS public.current_user_plan CASCADE;

-- Ensure plan_t enum exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'plan_t') THEN
    CREATE TYPE public.plan_t AS ENUM ('Free', 'Basic', 'Premium', 'Admin', 'President');
  END IF;
END$$;

-- Fix user_plans.plan column
DO $$
BEGIN
  -- Only alter if the column exists and is not already the correct type
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_plans' 
    AND column_name = 'plan' 
    AND table_schema = 'public'
  ) THEN
    ALTER TABLE public.user_plans
      ALTER COLUMN plan DROP DEFAULT,
      ALTER COLUMN plan TYPE public.plan_t USING plan::text::public.plan_t,
      ALTER COLUMN plan SET DEFAULT 'Free'::public.plan_t;
  END IF;
END$$;

-- Recreate current_user_plan view
CREATE OR REPLACE VIEW public.current_user_plan AS
SELECT u.id AS user_id, p.plan, p.is_admin
FROM auth.users u
LEFT JOIN public.user_plans p ON p.user_id = u.id;

-- 2. Drop test/unused functions and triggers
DROP FUNCTION IF EXISTS public.f_news_hash CASCADE;
DROP FUNCTION IF EXISTS public.f_horizon_days CASCADE;
DROP TRIGGER IF EXISTS trg_news_events_mention ON public.news_events CASCADE;
DROP TRIGGER IF EXISTS trg_touch_updated ON public.news_events CASCADE;

-- 3. Create production audit touch function
CREATE OR REPLACE FUNCTION public.audit_touch()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply audit triggers to key tables if they exist
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'news_events' AND table_schema = 'public') THEN
    DROP TRIGGER IF EXISTS trg_touch_updated_news ON public.news_events;
    CREATE TRIGGER trg_touch_updated_news
      BEFORE UPDATE ON public.news_events
      FOR EACH ROW
      EXECUTE FUNCTION public.audit_touch();
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'alerts' AND table_schema = 'public') THEN
    DROP TRIGGER IF EXISTS trg_touch_updated_alerts ON public.alerts;
    CREATE TRIGGER trg_touch_updated_alerts
      BEFORE UPDATE ON public.alerts
      FOR EACH ROW
      EXECUTE FUNCTION public.audit_touch();
  END IF;
END$$;

-- 4. Create error_logs table for edge function monitoring
CREATE TABLE IF NOT EXISTS public.error_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  function_name text NOT NULL,
  error_message text NOT NULL,
  user_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  request_id uuid,
  metadata jsonb DEFAULT '{}'::jsonb
);

-- Enable RLS on error_logs
ALTER TABLE public.error_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view error logs
DROP POLICY IF EXISTS "Admins can view error logs" ON public.error_logs;
CREATE POLICY "Admins can view error logs" ON public.error_logs
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_id = auth.uid() 
    AND role = ANY(ARRAY['admin'::user_role_enum, 'president'::user_role_enum])
  ));

-- 5. Add columns to existing sp500 table
ALTER TABLE public.sp500 
  ADD COLUMN IF NOT EXISTS name text,
  ADD COLUMN IF NOT EXISTS sector text,
  ADD COLUMN IF NOT EXISTS market_cap bigint,
  ADD COLUMN IF NOT EXISTS added_at timestamp with time zone DEFAULT now();

-- Insert basic S&P 500 tickers for scanning
INSERT INTO public.sp500 (ticker, name, sector) VALUES
  ('AAPL', 'Apple Inc.', 'Technology'),
  ('MSFT', 'Microsoft Corp.', 'Technology'),
  ('AMZN', 'Amazon.com Inc.', 'Consumer Discretionary'),
  ('GOOGL', 'Alphabet Inc.', 'Communication Services'),
  ('TSLA', 'Tesla Inc.', 'Consumer Discretionary'),
  ('NVDA', 'NVIDIA Corp.', 'Technology'),
  ('META', 'Meta Platforms Inc.', 'Communication Services'),
  ('BRK.B', 'Berkshire Hathaway Inc.', 'Financials'),
  ('UNH', 'UnitedHealth Group Inc.', 'Health Care'),
  ('JNJ', 'Johnson & Johnson', 'Health Care')
ON CONFLICT (ticker) DO UPDATE SET
  name = EXCLUDED.name,
  sector = EXCLUDED.sector;

-- Enable public read for SP500 reference
ALTER TABLE public.sp500 ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "SP500 public read" ON public.sp500;
CREATE POLICY "SP500 public read" ON public.sp500 FOR SELECT USING (true);

-- 6. Enhance audit_write function to handle text parameters
CREATE OR REPLACE FUNCTION public.audit_write(_action text, _target text, _meta jsonb DEFAULT '{}'::jsonb)
RETURNS void
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.audit_log(actor, action, target, meta)
  VALUES (auth.uid(), _action, _target::uuid, COALESCE(_meta,'{}'::jsonb));
EXCEPTION WHEN OTHERS THEN
  -- If target is not a valid UUID, log anyway with null target
  INSERT INTO public.audit_log(actor, action, target, meta)
  VALUES (auth.uid(), _action, null, jsonb_build_object('target_text', _target, 'meta', COALESCE(_meta,'{}'::jsonb)));
END;
$$;