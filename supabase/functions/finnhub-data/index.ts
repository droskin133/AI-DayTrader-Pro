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

    // Try 1-second resolution first, fallback to 1-minute if rate limited
    let resolution = "1";
    let fallbackUsed = false;
    
    let url = `https://finnhub.io/api/v1/stock/candle?symbol=${symbol}&resolution=${resolution}&from=${fromTimestamp}&to=${toTimestamp}&token=${finnhubApiKey}`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);
    
    let response = await fetch(url, { 
      signal: controller.signal,
      headers: { 'User-Agent': 'DayTrader-Pro/1.0' }
    });
    
    clearTimeout(timeoutId);

    // Handle rate limiting by falling back to 1-minute resolution
    if (!response.ok) {
      if (response.status === 429) {
        resolution = "1";
        fallbackUsed = true;
        url = `https://finnhub.io/api/v1/stock/candle?symbol=${symbol}&resolution=${resolution}&from=${fromTimestamp}&to=${toTimestamp}&token=${finnhubApiKey}`;
        
        const retryController = new AbortController();
        const retryTimeoutId = setTimeout(() => retryController.abort(), 6000);
        
        response = await fetch(url, { 
          signal: retryController.signal,
          headers: { 'User-Agent': 'DayTrader-Pro/1.0' }
        });
        
        clearTimeout(retryTimeoutId);
      }
      
      if (!response.ok) {
        throw new Error(`Finnhub API error: ${response.status} ${response.statusText}`);
      }
    }

    const candleData = await response.json();

    // Get real-time quote
    const quoteUrl = `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${finnhubApiKey}`;
    const quoteController = new AbortController();
    const quoteTimeoutId = setTimeout(() => quoteController.abort(), 6000);
    
    const quoteResponse = await fetch(quoteUrl, { 
      signal: quoteController.signal,
      headers: { 'User-Agent': 'DayTrader-Pro/1.0' }
    });
    
    clearTimeout(quoteTimeoutId);
    const quoteData = quoteResponse.ok ? await quoteResponse.json() : null;

    // Transform candle data to required format
    const candles = candleData.c ? candleData.c.map((close: number, index: number) => ({
      t: new Date(candleData.t[index] * 1000).toISOString(),
      o: candleData.o[index],
      h: candleData.h[index],
      l: candleData.l[index],
      c: close,
      v: candleData.v[index] || 0
    })) : [];

    const result = {
      symbol,
      interval: fallbackUsed ? "1m" : interval,
      last_quote: quoteData ? {
        p: quoteData.c || 0,
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
      function_name: 'finnhub-data',
      error_message: error.message,
      request_id: requestId,
      payload_hash: 'error',
      upstream_status: 500,
      latency_ms: latencyMs
    });

    console.error('Error in finnhub-data:', error);
    
    return new Response(
      JSON.stringify({ error: 'Failed to fetch chart data' }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});