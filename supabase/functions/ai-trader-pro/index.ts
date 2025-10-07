import 'https://deno.land/x/xhr@0.1.0/mod.ts';
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/helpers.ts';

interface ReqBody { symbol: string; timeframe?: string }

const safe = async <T>(label: string, fn: () => Promise<T>, fallback: T): Promise<T> => {
  try { return await fn(); } catch (e) { console.log(`[ai-trader-pro] skip ${label}`, e); return fallback; }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  const t0 = Date.now();
  
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { symbol, timeframe = '1h' } = await req.json() as ReqBody;
    if (!symbol) {
      return new Response(JSON.stringify({ error: 'symbol required' }), { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // 1) Live context via internal functions (graceful degradation)
    const [quote, chart, news, quiver] = await Promise.all([
      safe('quote',  () => supabase.functions.invoke('finnhub-data', { body: { type: 'quote',  symbol } }).then(r => r.data), null),
      safe('chart',  () => supabase.functions.invoke('stock-chart-data', { body: { symbol, interval: '1m' } }).then(r => r.data), null),
      safe('news',   () => supabase.functions.invoke('news', { body: { symbol } }).then(r => r.data), { items: [] }),
      safe('quiver', () => supabase.functions.invoke('quiver-data', { body: { symbol } }).then(r => r.data), null)
    ]);

    // 2) Optional DB context (never fatal)
    const [optFlow, priceLvls, instSig, commSig] = await Promise.all([
      safe('options_flow', () => supabase.from('options_flow').select('*').limit(50).then(r => r.data || []), []),
      safe('price_action_levels', () => supabase.from('price_action_levels').select('*').limit(50).then(r => r.data || []), []),
      safe('ai_institutional_signals', () => supabase.from('ai_institutional_signals').select('*').limit(50).then(r => r.data || []), []),
      safe('ai_commodity_signals', () => supabase.from('ai_commodity_signals').select('*').limit(50).then(r => r.data || []), []),
    ]);

    // 3) Build prompt for OpenAI (STRICT: no fabrication)
    const openai = Deno.env.get('OPENAI_API_KEY');
    if (!openai) {
      return new Response(JSON.stringify({ 
        error: 'OPENAI_API_KEY not configured',
        ticker: symbol,
        trade_setup: 'configuration-error'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const recentNews = (news?.items || []).slice(0, 6).map((n: any) => 
      `• ${n.source || ''} ${n.published_at || ''} ${n.headline || n.title || ''}`
    ).join('\n');

    const messages = [
      { role: 'system', content: 'You are an equity trading assistant. Use ONLY the data provided. If insufficient, say so. Do NOT invent values. Return JSON with fields: ticker, timeframe, trade_setup, confidence (0-1), notes (array).' },
      { role: 'user', content: `Symbol: ${symbol}\nTimeframe: ${timeframe}\nLast price: ${quote?.c ?? 'N/A'}\nNews:\n${recentNews || '(none)'}\nOptionsFlow: ${optFlow.length}\nPriceLevels: ${priceLvls.length}\nInstitutionalSignals: ${instSig.length}\nCommoditySignals: ${commSig.length}` }
    ];

    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${openai}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        model: 'gpt-4o-mini', 
        temperature: 0.2, 
        max_tokens: 700, 
        messages 
      })
    });

    if (!resp.ok) {
      const errorText = await resp.text();
      throw new Error(`OpenAI ${resp.status}: ${errorText}`);
    }

    const json = await resp.json();
    let parsed: any = null;
    try { 
      parsed = JSON.parse(json.choices?.[0]?.message?.content || '{}'); 
    } catch { 
      parsed = null; 
    }

    const result = parsed && parsed.ticker ? parsed : {
      ticker: symbol,
      timeframe,
      trade_setup: 'insufficient-data',
      market_signals: {
        options_flow: optFlow.length,
        price_levels: priceLvls.length,
        institutional: instSig.length,
        commodities: commSig.length,
        news_items: (news?.items || []).length
      },
      generated_at_iso: new Date().toISOString(),
      confidence: 0.35,
      notes: ['Insufficient structured data from one or more sources.']
    };

    // Learning log (best effort)
    try { 
      await supabase.from('ai_learning_log').insert({ 
        user_id: null, 
        ticker: symbol, 
        mode: 'ai-trader-pro', 
        input: { symbol, timeframe }, 
        output: result 
      }); 
    } catch {}

    try { 
      await supabase.from('audit_logs').insert({ 
        function_name: 'ai-trader-pro', 
        action: 'analyze', 
        payload: { symbol }, 
        created_at: new Date().toISOString() 
      }); 
    } catch {}

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (err) {
    console.error('ai-trader-pro error:', err);
    return new Response(JSON.stringify({ 
      error: err instanceof Error ? err.message : 'Unknown error',
      ticker: null,
      trade_setup: 'error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
