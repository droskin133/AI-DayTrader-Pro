import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const POLYGON_API_KEY = Deno.env.get("POLYGON_API_KEY");

  try {
    if (!POLYGON_API_KEY) {
      throw new Error('POLYGON_API_KEY not configured');
    }

    // Get user watchlist symbols
    const { data: watchlistData } = await supabase
      .from('user_watchlist')
      .select('symbol');

    const baseSymbols = ['SPY', 'QQQ', 'DIA', 'X:BTCUSD', 'GC', 'CL'];
    const watchlistSymbols = watchlistData?.map(w => w.symbol) || [];
    const allSymbols = [...new Set([...baseSymbols, ...watchlistSymbols])];

    // Connect to Polygon WebSocket
    const ws = new WebSocket(`wss://socket.polygon.io/stocks`);

    ws.onopen = () => {
      console.log('WebSocket connected');
      ws.send(JSON.stringify({ action: 'auth', params: POLYGON_API_KEY }));
      ws.send(JSON.stringify({ action: 'subscribe', params: `T.${allSymbols.join(',T.')}` }));
    };

    ws.onmessage = async (event) => {
      const data = JSON.parse(event.data);
      
      if (data[0]?.ev === 'T') {
        for (const trade of data) {
          await supabase.from('market_data').upsert({
            symbol: trade.sym,
            last_trade_price: trade.p,
            volume: trade.s,
            updated_at: new Date().toISOString()
          });
        }
      }
    };

    ws.onerror = async (error) => {
      await supabase.from('error_logs').insert({
        context: 'polygon-live-stream',
        payload: { error: error.toString() },
        created_at: new Date().toISOString()
      });
    };

    // Check for stale data every 2 minutes
    setInterval(async () => {
      const { data } = await supabase
        .from('market_data')
        .select('symbol, updated_at')
        .lt('updated_at', new Date(Date.now() - 120000).toISOString());

      if (data && data.length > 0) {
        await supabase.from('error_logs').insert({
          context: 'stale feed',
          payload: { stale_symbols: data },
          created_at: new Date().toISOString()
        });
      }
    }, 120000);

    return new Response(
      JSON.stringify({ status: 'WebSocket connection established' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    await supabase.from('error_logs').insert({
      context: 'polygon-live-stream',
      payload: { error: error instanceof Error ? error.message : String(error) },
      created_at: new Date().toISOString()
    });

    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
