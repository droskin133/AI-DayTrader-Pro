-- Drop plural table if it exists
DROP TABLE IF EXISTS public.watchlists CASCADE;

-- Ensure singular table is authoritative
CREATE TABLE IF NOT EXISTS public.watchlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  ticker text NOT NULL,
  sort_order int,
  created_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_watchlist_user_id ON public.watchlist(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_watchlist_user_ticker ON public.watchlist(user_id, ticker);

-- RLS
ALTER TABLE public.watchlist ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS watchlist_owner ON public.watchlist;
CREATE POLICY watchlist_owner ON public.watchlist FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Update toggle_watchlist function
CREATE OR REPLACE FUNCTION public.toggle_watchlist(ticker text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'pg_catalog', 'public' AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.watchlist WHERE user_id = auth.uid() AND public.watchlist.ticker = toggle_watchlist.ticker) THEN
    DELETE FROM public.watchlist WHERE user_id = auth.uid() AND public.watchlist.ticker = toggle_watchlist.ticker;
  ELSE
    INSERT INTO public.watchlist (user_id, ticker) VALUES (auth.uid(), toggle_watchlist.ticker);
  END IF;
END;
$$;

-- Create view for latest prices
CREATE OR REPLACE VIEW public.latest_price AS
SELECT DISTINCT ON (ticker) ticker, price, ts
FROM public.stock_prices
ORDER BY ticker, ts DESC;

-- Create helper function for watchlist with prices
CREATE OR REPLACE FUNCTION public.get_watchlist_with_prices()
RETURNS TABLE(ticker text, price numeric, ts timestamptz)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = 'public' AS
$$
  SELECT w.ticker, lp.price, lp.ts
  FROM public.watchlist w
  LEFT JOIN public.latest_price lp ON lp.ticker = w.ticker
  WHERE w.user_id = auth.uid()
  ORDER BY w.sort_order NULLS LAST, w.ticker;
$$;