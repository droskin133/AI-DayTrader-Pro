import 'https://deno.land/x/xhr@0.1.0/mod.ts';
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/helpers.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const { symbol, interval = '1h', horizon = '1d' } = await req.json();
    if (!symbol) throw new Error('symbol required');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get user plan for caching strategy
    const authHeader = req.headers.get('Authorization');
    let userPlan = 'free';
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      if (user) {
        const { data: planData } = await supabase
          .from('user_plans')
          .select('plan')
          .eq('user_id', user.id)
          .single();
        userPlan = planData?.plan || 'free';
      }
    }

    // Failover: Polygon → Finnhub → Yahoo
    let candles: any = null;
    let source = 'none';

    // Try Polygon
    const polyKey = Deno.env.get('POLYGON_API_KEY');
    if (polyKey && !candles) {
      try {
        const from = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        const to = new Date().toISOString().split('T')[0];
        const polyRes = await fetch(
          `https://api.polygon.io/v2/aggs/ticker/${symbol}/range/1/${interval}/${from}/${to}?adjusted=true&sort=asc&apiKey=${polyKey}`,
          { signal: AbortSignal.timeout(5000) }
        );
        if (polyRes.ok) {
          const polyData = await polyRes.json();
          if (polyData.results?.length) {
            candles = polyData.results.map((r: any) => ({
              time: r.t,
              open: r.o,
              high: r.h,
              low: r.l,
              close: r.c,
              volume: r.v
            }));
            source = 'polygon';
          }
        }
      } catch (e) {
        console.error('Polygon failed:', e);
      }
    }

    // Try Finnhub
    const finnKey = Deno.env.get('FINNHUB_API_KEY');
    if (finnKey && !candles) {
      try {
        const from = Math.floor((Date.now() - 24 * 60 * 60 * 1000) / 1000);
        const to = Math.floor(Date.now() / 1000);
        const resolution = interval === '1h' ? '60' : '1';
        const finnRes = await fetch(
          `https://finnhub.io/api/v1/stock/candle?symbol=${symbol}&resolution=${resolution}&from=${from}&to=${to}&token=${finnKey}`,
          { signal: AbortSignal.timeout(5000) }
        );
        if (finnRes.ok) {
          const finnData = await finnRes.json();
          if (finnData.s === 'ok' && finnData.c?.length) {
            candles = finnData.t.map((t: number, i: number) => ({
              time: t * 1000,
              open: finnData.o[i],
              high: finnData.h[i],
              low: finnData.l[i],
              close: finnData.c[i],
              volume: finnData.v[i]
            }));
            source = 'finnhub';
          }
        }
      } catch (e) {
        console.error('Finnhub failed:', e);
      }
    }

    // Try Yahoo (no key required, verified fallback)
    if (!candles) {
      try {
        const yahooRes = await fetch(
          `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1h&range=1d`,
          { signal: AbortSignal.timeout(5000) }
        );
        if (yahooRes.ok) {
          const yahooData = await yahooRes.json();
          const quote = yahooData.chart?.result?.[0];
          if (quote?.timestamp?.length) {
            candles = quote.timestamp.map((t: number, i: number) => ({
              time: t * 1000,
              open: quote.indicators.quote[0].open[i],
              high: quote.indicators.quote[0].high[i],
              low: quote.indicators.quote[0].low[i],
              close: quote.indicators.quote[0].close[i],
              volume: quote.indicators.quote[0].volume[i]
            }));
            source = 'yahoo';
          }
        }
      } catch (e) {
        console.error('Yahoo failed:', e);
      }
    }

    if (!candles) {
      throw new Error('All price data sources failed');
    }

    // Call OpenAI for AI analysis
    const openaiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiKey) throw new Error('OPENAI_API_KEY not configured');

    const lastCandle = candles[candles.length - 1];
    const firstCandle = candles[0];
    const priceChange = ((lastCandle.close - firstCandle.close) / firstCandle.close) * 100;

    const prompt = `Analyze this ${symbol} chart data:
- Current price: $${lastCandle.close.toFixed(2)}
- Change: ${priceChange.toFixed(2)}%
- Candles: ${candles.length}
- Interval: ${interval}
- Source: ${source}

Identify:
1. Trend direction (bullish/bearish/neutral)
2. Key patterns (head-shoulders, cup-handle, flags, etc.)
3. Support/resistance levels
4. Trading signals

Return JSON with: { trend, patterns: [], supports: [], resistances: [], confidence, signal }`;

    const aiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.2,
        max_tokens: 500,
        messages: [
          { role: 'system', content: 'You are a technical analysis expert. Return only valid JSON.' },
          { role: 'user', content: prompt }
        ]
      })
    });

    if (!aiRes.ok) throw new Error(`OpenAI error: ${aiRes.status}`);

    const aiData = await aiRes.json();
    let analysis: any = null;
    try {
      analysis = JSON.parse(aiData.choices[0].message.content);
    } catch {
      analysis = {
        trend: 'neutral',
        patterns: [],
        supports: [],
        resistances: [],
        confidence: 0.5,
        signal: 'no clear signal'
      };
    }

    // Log to ai_learning_log
    try {
      await supabase.from('ai_learning_log').insert({
        user_id: null,
        ticker: symbol,
        mode: 'ai-chart',
        input: { symbol, interval, horizon, source },
        output: analysis
      });
    } catch (e) {
      console.error('Failed to log learning data:', e);
    }

    return new Response(JSON.stringify({
      symbol,
      candles,
      analysis,
      source,
      cached: userPlan !== 'premium',
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (err) {
    console.error('ai-chart error:', err);
    return new Response(JSON.stringify({ 
      error: err instanceof Error ? err.message : 'Analysis failed'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});