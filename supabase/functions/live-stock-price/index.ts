import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/helpers.ts';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const retryWithBackoff = async (fn: () => Promise<any>, maxRetries = 3): Promise<any> => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      const delay = Math.pow(2, i) * 1000; // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  try {
    const { tickers } = await req.json();
    
    if (!Array.isArray(tickers) || tickers.length === 0) {
      return new Response(JSON.stringify({ error: 'tickers array required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const poly = Deno.env.get('POLYGON_API_KEY');
    const finn = Deno.env.get('FINNHUB_API_KEY');

    const fetchPolygon = async (s: string) => {
      if (!poly) return null;
      return retryWithBackoff(async () => {
        const r = await fetch(`https://api.polygon.io/v2/snapshot/locale/us/markets/stocks/tickers/${encodeURIComponent(s)}?apiKey=${poly}`);
        if (!r.ok) throw new Error(`Polygon API returned ${r.status}`);
        const j = await r.json();
        const t = j?.ticker || j?.results;
        const price = t?.lastTrade?.p ?? t?.last?.price ?? null;
        const ch = t?.todaysChange ?? null;
        const chp = t?.todaysChangePerc ?? null;
        return { ticker: s, price, change: ch, changePercent: chp, ts: new Date().toISOString() };
      }).catch(() => null);
    };

    const fetchFinnhub = async (s: string) => {
      if (!finn) return null;
      return retryWithBackoff(async () => {
        const r = await fetch(`https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(s)}&token=${finn}`);
        if (!r.ok) throw new Error(`Finnhub API returned ${r.status}`);
        const j = await r.json();
        return { ticker: s, price: j.c ?? null, change: j.d ?? null, changePercent: j.dp ?? null, ts: new Date().toISOString() };
      }).catch(() => null);
    };

    const out: any[] = [];
    for (const s of tickers) {
      const a = await fetchPolygon(s);
      if (a && a.price !== null) { out.push(a); continue; }
      const b = await fetchFinnhub(s);
      if (b && b.price !== null) { out.push(b); continue; }
      out.push({ ticker: s, price: null, change: null, changePercent: null, ts: new Date().toISOString() });
    }

    // Log metrics
    const latency = Date.now() - startTime;
    await supabase.from('ai_run_metrics').insert({
      mode: 'live-stock-price',
      ticker: tickers.join(','),
      latency_ms: latency,
      upstream_status: 200,
      used_cache: false
    }).catch(() => {});

    return new Response(JSON.stringify(out), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (err) {
    const latency = Date.now() - startTime;
    
    // Log error
    await supabase.from('error_logs').insert({
      function_name: 'live-stock-price',
      error_message: err instanceof Error ? err.message : 'Unknown error',
      metadata: { tickers: [] }
    }).catch(() => {});
    
    await supabase.from('ai_run_metrics').insert({
      mode: 'live-stock-price',
      ticker: '',
      latency_ms: latency,
      error_message: err instanceof Error ? err.message : 'Unknown error'
    }).catch(() => {});
    
    return new Response(JSON.stringify({ 
      error: err instanceof Error ? err.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
