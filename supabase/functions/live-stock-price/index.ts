import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { corsHeaders } from '../_shared/helpers.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { symbols = [], symbol } = await req.json();
    const list = Array.isArray(symbols) && symbols.length ? symbols : (symbol ? [symbol] : []);

    if (list.length === 0) {
      return new Response(JSON.stringify({ error: 'No symbols provided' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const poly = Deno.env.get('POLYGON_API_KEY');
    const finn = Deno.env.get('FINNHUB_API_KEY');

    const fetchPolygon = async (s: string) => {
      if (!poly) return null;
      try {
        const r = await fetch(`https://api.polygon.io/v2/snapshot/locale/us/markets/stocks/tickers/${encodeURIComponent(s)}?apiKey=${poly}`);
        if (!r.ok) return null;
        const j = await r.json();
        const t = j?.ticker || j?.results;
        const price = t?.lastTrade?.p ?? t?.last?.price ?? null;
        const ch = t?.todaysChange ?? null;
        const chp = t?.todaysChangePerc ?? null;
        return { ticker: s, price, change: ch, changePercent: chp };
      } catch {
        return null;
      }
    };

    const fetchFinnhub = async (s: string) => {
      if (!finn) return null;
      try {
        const r = await fetch(`https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(s)}&token=${finn}`);
        if (!r.ok) return null;
        const j = await r.json();
        return { ticker: s, price: j.c ?? null, change: j.d ?? null, changePercent: j.dp ?? null };
      } catch {
        return null;
      }
    };

    const out: any[] = [];
    for (const s of list) {
      const a = await fetchPolygon(s);
      if (a && a.price !== null) { out.push(a); continue; }
      const b = await fetchFinnhub(s);
      if (b && b.price !== null) { out.push(b); continue; }
      out.push({ ticker: s, price: null, change: null, changePercent: null });
    }

    return new Response(JSON.stringify(out), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (err) {
    console.error('live-stock-price error:', err);
    return new Response(JSON.stringify({ 
      error: err instanceof Error ? err.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
