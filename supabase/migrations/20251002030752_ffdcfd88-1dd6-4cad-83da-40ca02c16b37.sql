-- Create new tables only (no modifications to existing tables)

-- Stock Prices for live chart data
CREATE TABLE IF NOT EXISTS public.stock_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticker TEXT NOT NULL,
  price NUMERIC NOT NULL,
  ts TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_stock_prices_ticker_ts ON public.stock_prices(ticker, ts DESC);

ALTER TABLE public.stock_prices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS stock_prices_public_read ON public.stock_prices;
CREATE POLICY stock_prices_public_read ON public.stock_prices FOR SELECT USING (true);

-- Ownership Data
CREATE TABLE IF NOT EXISTS public.ownership_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticker TEXT NOT NULL,
  owner TEXT NOT NULL,
  pct_owned NUMERIC,
  last_updated TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.ownership_data ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS ownership_data_public_read ON public.ownership_data;
CREATE POLICY ownership_data_public_read ON public.ownership_data FOR SELECT USING (true);

-- Subscription Status (Stripe live data)
CREATE TABLE IF NOT EXISTS public.subscription_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  plan TEXT NOT NULL CHECK (plan IN ('Free','Basic','Pro','Premium','Admin','President')),
  status TEXT NOT NULL CHECK (status IN ('active','past_due','canceled')),
  renewed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.subscription_status ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS subscription_status_owner_read ON public.subscription_status;
CREATE POLICY subscription_status_owner_read ON public.subscription_status
  FOR SELECT USING (auth.uid() = user_id);

-- Stripe Events (webhook data)
CREATE TABLE IF NOT EXISTS public.stripe_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.stripe_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS stripe_events_admin_read ON public.stripe_events;
CREATE POLICY stripe_events_admin_read ON public.stripe_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'president')
    )
  );

-- Vendor API Keys
CREATE TABLE IF NOT EXISTS public.vendor_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor TEXT NOT NULL,
  scope TEXT,
  api_key TEXT NOT NULL,
  meta JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID,
  UNIQUE(vendor, scope)
);

ALTER TABLE public.vendor_keys ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS vendor_keys_admin_manage ON public.vendor_keys;
CREATE POLICY vendor_keys_admin_manage ON public.vendor_keys
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'president')
    )
  );