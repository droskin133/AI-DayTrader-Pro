-- Enable RLS on new tables to fix security warnings
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_cache ENABLE ROW LEVEL SECURITY; 
ALTER TABLE public.institutional_trades ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for audit_logs (admin only access)
CREATE POLICY "audit_logs_admin_only" ON public.audit_logs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'president')
    )
  );

-- Create RLS policies for news_cache (public read access for caching)
CREATE POLICY "news_cache_public_read" ON public.news_cache 
  FOR SELECT USING (true);

-- Create RLS policies for institutional_trades (public read access for market data)
CREATE POLICY "institutional_trades_public_read" ON public.institutional_trades
  FOR SELECT USING (true);