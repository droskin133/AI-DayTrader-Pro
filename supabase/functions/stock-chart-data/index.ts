import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { supabase } from "../_shared/supabase.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ChartRequest {
  symbol: string;
  interval: string;
  range: {
    from: string;
    to: string;
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  const requestId = crypto.randomUUID();

  try {
    const { symbol, interval, range }: ChartRequest = await req.json();
    
    if (!symbol || !interval || !range) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }), 
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const finnhubApiKey = Deno.env.get("FINNHUB_API_KEY");
    if (!finnhubApiKey) {
      throw new Error('FINNHUB_API_KEY not configured');
    }

    // Convert dates to timestamps
    const fromTimestamp = Math.floor(new Date(range.from).getTime() / 1000);
    const toTimestamp = Math.floor(new Date(range.to).getTime() / 1000);

    // Fallback chain: try 1s first, then 1m if rate limited
    let url = `https://finnhub.io/api/v1/stock/candle?symbol=${symbol}&resolution=1&from=${fromTimestamp}&to=${toTimestamp}&token=${finnhubApiKey}`;
    let fallbackUsed = false;

    let response = await fetch(url);
    
    if (!response.ok) {
      if (response.status === 429) {
        // Rate limited, fallback to 1m resolution
        url = `https://finnhub.io/api/v1/stock/candle?symbol=${symbol}&resolution=1&from=${fromTimestamp}&to=${toTimestamp}&token=${finnhubApiKey}`;
        response = await fetch(url);
        fallbackUsed = true;
      }
      
      if (!response.ok) {
        throw new Error(`Finnhub API error: ${response.status} ${response.statusText}`);
      }
    }

    const data = await response.json();

    // Get latest quote for real-time data
    const quoteUrl = `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${finnhubApiKey}`;
    const quoteResponse = await fetch(quoteUrl);
    const quoteData = quoteResponse.ok ? await quoteResponse.json() : null;

    // Transform candle data
    const candles = data.c ? data.c.map((close: number, index: number) => ({
      t: new Date(data.t[index] * 1000).toISOString(),
      o: data.o[index],
      h: data.h[index],
      l: data.l[index],
      c: close,
      v: data.v[index]
    })) : [];

    const result = {
      symbol,
      interval: fallbackUsed ? "1m" : interval,
      last_quote: quoteData ? {
        p: quoteData.c,
        v: quoteData.v || 0,
        t: new Date().toISOString()
      } : null,
      candles,
      source: "finnhub",
      fallback_used: fallbackUsed
    };

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    const latencyMs = Date.now() - startTime;
    
    // Log error to audit_logs
    await supabase.from('audit_logs').insert({
      function_name: 'stock-chart-data',
      error_message: (error as Error).message,
      request_id: requestId,
      payload_hash: 'error',
      upstream_status: 500,
      latency_ms: latencyMs
    });

    console.error('Error in stock-chart-data:', error);
    
    return new Response(
      JSON.stringify({ error: 'Failed to fetch chart data' }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});