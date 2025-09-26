import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { supabase } from "../_shared/supabase.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TradeSetupRequest {
  ticker: string;
  timeframe?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  const requestId = crypto.randomUUID();

  try {
    const { ticker, timeframe = 'intraday' }: TradeSetupRequest = await req.json();
    
    if (!ticker) {
      return new Response(
        JSON.stringify({ error: 'Ticker is required' }), 
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiApiKey) {
      throw new Error('OPENAI_API_KEY not configured');
    }

    // Gather all market signals for the ticker
    const [
      optionsData,
      priceData,
      newsData,
      institutionalData,
      commodityData,
      anticipationData
    ] = await Promise.all([
      supabase.from('options_flow').select('*').eq('ticker', ticker).order('snapshot_time', { ascending: false }).limit(5),
      supabase.from('price_action_levels').select('*').eq('ticker', ticker).order('snapshot_time', { ascending: false }).limit(1),
      supabase.from('news_events').select('*, news_event_links(*)').contains('tickers', [ticker]).order('published_at', { ascending: false }).limit(10),
      supabase.from('ai_institutional_signals').select('*').eq('ticker', ticker).order('detected_at', { ascending: false }).limit(5),
      supabase.from('ai_commodity_signals').select('*').eq('ticker', ticker).order('created_at', { ascending: false }).limit(3),
      supabase.from('market_anticipation').select('*').eq('ticker', ticker).order('anticipated_at', { ascending: false }).limit(3)
    ]);

    // Build comprehensive market context
    const marketContext = {
      ticker,
      timeframe,
      options_signals: optionsData.data || [],
      price_levels: priceData.data?.[0] || null,
      recent_news: newsData.data || [],
      institutional_activity: institutionalData.data || [],
      commodity_signals: commodityData.data || [],
      market_anticipation: anticipationData.data || []
    };

    // Generate AI trade setup
    const systemPrompt = `You are an elite day trader AI that generates precise, actionable trade setups. Analyze ALL provided market data to identify high-probability intraday opportunities.

Focus on:
1. Options flow patterns (unusual activity, gamma exposure, max pain)
2. Key price levels (VWAP, support/resistance, order book walls)
3. News catalysts and sentiment
4. Institutional positioning
5. Commodity correlations
6. Market anticipation vs reality

Generate a specific trade setup with:
- Entry strategy and price levels
- Stop loss and take profit targets
- Risk/reward ratio
- Time horizon (specific hours/minutes for day trades)
- Key risks and why this setup works`;

    const userPrompt = `Analyze ${ticker} for a ${timeframe} trade setup using this data:

MARKET CONTEXT:
${JSON.stringify(marketContext, null, 2)}

Generate a detailed day trading setup with specific entry/exit levels and reasoning based on the actual market data provided.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 800,
        temperature: 0.3
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const aiAnalysis = data.choices[0].message.content;

    const result = {
      ticker,
      timeframe,
      trade_setup: aiAnalysis,
      market_signals: {
        options_activity: optionsData.data?.length || 0,
        news_items: newsData.data?.length || 0,
        institutional_signals: institutionalData.data?.length || 0,
        price_levels_available: !!priceData.data?.[0]
      },
      generated_at: new Date().toISOString()
    };

    // Log to AI learning system
    try {
      await supabase.from('ai_learning_log').insert({
        user_id: null, // Public analysis
        ticker,
        mode: 'trade_setup',
        input: marketContext,
        output: result
      });
    } catch (learningError) {
      console.warn('Failed to log AI learning data:', learningError);
    }

    // Log metrics
    const latencyMs = Date.now() - startTime;
    await supabase.from('ai_run_metrics').insert({
      ticker,
      mode: 'trade_setup',
      latency_ms: latencyMs,
      used_cache: false,
      upstream_status: 200
    });

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    const latencyMs = Date.now() - startTime;
    
    // Log error metrics
    await supabase.from('ai_run_metrics').insert({
      ticker: 'unknown',
      mode: 'trade_setup',
      latency_ms: latencyMs,
      used_cache: false,
      upstream_status: 500,
      error_message: (error as Error).message
    });

    console.error('Error in ai-trader-pro function:', error);
    
    return new Response(
      JSON.stringify({ error: 'Failed to generate trade setup' }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});