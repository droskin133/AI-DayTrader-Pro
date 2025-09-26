-- Create missing tables for production AI DayTrader Pro

-- Options flow table for real-time options data
CREATE TABLE IF NOT EXISTS public.options_flow (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticker TEXT NOT NULL,
  expiry DATE NOT NULL,
  strike NUMERIC NOT NULL,
  option_type TEXT NOT NULL, -- 'call' or 'put'
  open_interest BIGINT,
  implied_volatility NUMERIC,
  gamma_exposure NUMERIC,
  vanna NUMERIC,
  charm NUMERIC,
  volume BIGINT,
  premium NUMERIC,
  max_pain NUMERIC,
  snapshot_time TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Price action levels for support/resistance
CREATE TABLE IF NOT EXISTS public.price_action_levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticker TEXT NOT NULL,
  vwap NUMERIC,
  resistance_1 NUMERIC,
  resistance_2 NUMERIC,
  support_1 NUMERIC,
  support_2 NUMERIC,
  buy_wall_price NUMERIC,
  buy_wall_size BIGINT,
  sell_wall_price NUMERIC,
  sell_wall_size BIGINT,
  snapshot_time TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- News event links for mapping news to tickers/sectors
CREATE TABLE IF NOT EXISTS public.news_event_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES public.news_events(id) ON DELETE CASCADE,
  ticker TEXT,
  sector TEXT,
  macro_factor TEXT,
  relation_type TEXT NOT NULL, -- 'direct', 'sector', 'macro', 'commodity'
  weight NUMERIC DEFAULT 1.0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Market anticipation tracker
CREATE TABLE IF NOT EXISTS public.market_anticipation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticker TEXT NOT NULL,
  factor TEXT NOT NULL, -- 'fed_rate', 'earnings', 'tariffs', 'cms_ruling'
  anticipation_type TEXT NOT NULL, -- 'priced_in', 'surprise', 'partial'
  anticipated_at TIMESTAMPTZ NOT NULL,
  priced_in_percentage NUMERIC DEFAULT 0,
  strength NUMERIC DEFAULT 0, -- 0-100 confidence
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enhance existing news_events table with sentiment and retraction tracking
ALTER TABLE public.news_events 
ADD COLUMN IF NOT EXISTS sentiment NUMERIC,
ADD COLUMN IF NOT EXISTS tickers TEXT[],
ADD COLUMN IF NOT EXISTS mention_count INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS retraction_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS predicted_event_type_id UUID;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_options_flow_ticker_time ON public.options_flow(ticker, snapshot_time DESC);
CREATE INDEX IF NOT EXISTS idx_price_action_levels_ticker_time ON public.price_action_levels(ticker, snapshot_time DESC);
CREATE INDEX IF NOT EXISTS idx_news_event_links_ticker ON public.news_event_links(ticker);
CREATE INDEX IF NOT EXISTS idx_news_event_links_event ON public.news_event_links(event_id);
CREATE INDEX IF NOT EXISTS idx_market_anticipation_ticker ON public.market_anticipation(ticker, anticipated_at DESC);

-- Enable RLS on all new tables
ALTER TABLE public.options_flow ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_action_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_event_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_anticipation ENABLE ROW LEVEL SECURITY;

-- Public read policies for market data
CREATE POLICY "options_flow_public_read" ON public.options_flow FOR SELECT USING (true);
CREATE POLICY "price_action_levels_public_read" ON public.price_action_levels FOR SELECT USING (true);
CREATE POLICY "news_event_links_public_read" ON public.news_event_links FOR SELECT USING (true);
CREATE POLICY "market_anticipation_public_read" ON public.market_anticipation FOR SELECT USING (true);