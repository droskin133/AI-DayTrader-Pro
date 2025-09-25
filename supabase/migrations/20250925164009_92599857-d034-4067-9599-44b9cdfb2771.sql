-- Market data cache for reducing rate limit failures
CREATE TABLE IF NOT EXISTS public.market_data_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticker TEXT NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_market_data_cache_ticker_time 
  ON public.market_data_cache(ticker, created_at DESC);

-- AI learning log for capturing all AI outputs and market context
CREATE TABLE IF NOT EXISTS public.ai_learning_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  ticker TEXT,
  mode TEXT NOT NULL,                   -- 'market', 'stock', 'news', 'alert'
  input JSONB NOT NULL,                 -- raw payload sent to ai-analysis
  output JSONB NOT NULL,                -- AI response
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SEC insider trades (separate from existing sec_filings)
CREATE TABLE IF NOT EXISTS public.sec_insider_trades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticker TEXT NOT NULL,
  insider_name TEXT NOT NULL,
  role TEXT,
  transaction_type TEXT,             -- buy, sell
  shares INTEGER,
  price NUMERIC,
  transaction_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sec_insider_ticker_date 
  ON public.sec_insider_trades(ticker, transaction_date DESC);

-- Top movers cache for performance
CREATE TABLE IF NOT EXISTS public.top_movers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,    -- 'gainers', 'losers', 'volume'
  ticker TEXT NOT NULL,
  price NUMERIC,
  percent_change NUMERIC,
  volume BIGINT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_top_movers_category_time 
  ON public.top_movers(category, created_at DESC);

-- Enable RLS on new tables
ALTER TABLE public.market_data_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_learning_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sec_insider_trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.top_movers ENABLE ROW LEVEL SECURITY;

-- Policies for market data cache (public read)
CREATE POLICY "market_data_cache_public_read" ON public.market_data_cache
  FOR SELECT USING (true);

-- Policies for AI learning log (user owns their data)
CREATE POLICY "ai_learning_insert_own" ON public.ai_learning_log
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "ai_learning_select_own" ON public.ai_learning_log
  FOR SELECT USING (auth.uid() = user_id);

-- Policies for SEC insider trades (public read)
CREATE POLICY "sec_insider_trades_public_read" ON public.sec_insider_trades
  FOR SELECT USING (true);

-- Policies for top movers (public read)
CREATE POLICY "top_movers_public_read" ON public.top_movers
  FOR SELECT USING (true);