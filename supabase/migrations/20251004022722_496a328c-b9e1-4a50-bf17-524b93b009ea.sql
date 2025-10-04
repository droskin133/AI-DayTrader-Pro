-- Enable Supabase Realtime for stock_prices table
-- This allows real-time price updates via WebSocket subscriptions

ALTER PUBLICATION supabase_realtime ADD TABLE public.stock_prices;

-- Set replica identity to FULL to get complete row data on updates
ALTER TABLE public.stock_prices REPLICA IDENTITY FULL;