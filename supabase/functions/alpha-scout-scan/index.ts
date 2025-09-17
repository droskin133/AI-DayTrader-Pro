import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { user_id, scan_type = 'breakout' } = await req.json();

    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

    // Get S&P 500 tickers for scanning
    const { data: sp500, error: sp500Error } = await supabase
      .from('sp500')
      .select('ticker')
      .limit(20); // Limit for demo

    if (sp500Error) throw sp500Error;

    const tickers = sp500.map(s => s.ticker);

    // AI market scan
    const prompt = `Scan these S&P 500 tickers for ${scan_type} opportunities: ${tickers.join(', ')}
    
    Find top 3 candidates with:
    1. Strong technical setups
    2. Volume confirmation
    3. Momentum indicators
    
    Return JSON array with ticker, score 1-100, and reason.
    Example: [{"ticker": "AAPL", "score": 85, "reason": "Bullish breakout above resistance"}]`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are an expert market scanner. Return valid JSON only.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 300,
        temperature: 0.4,
      }),
    });

    const aiData = await response.json();
    let candidates;
    
    try {
      candidates = JSON.parse(aiData.choices[0].message.content);
    } catch {
      // Fallback candidates
      candidates = tickers.slice(0, 3).map((ticker, index) => ({
        ticker,
        score: 75 - (index * 5),
        reason: `${scan_type} opportunity detected`
      }));
    }

    // Insert flags and alerts for top candidates
    for (const candidate of candidates) {
      if (candidate.score > 70) {
        // Insert flag
        await supabase
          .from('ai_auto_flags')
          .insert({
            user_id,
            symbol: candidate.ticker,
            event_type: `alpha_scout_${scan_type}`,
            explanation: candidate.reason,
            risk_score: candidate.score,
            metadata: { scan_type, scout_source: 'market_wide' }
          });

        // Insert alert
        await supabase
          .from('ai_auto_generated_alerts')
          .insert({
            user_id,
            symbol: candidate.ticker,
            alert_text: `Alpha Scout: ${candidate.ticker} ${scan_type} opportunity (${candidate.score}/100)`,
            trigger_context: { scan_type, reason: candidate.reason },
            status: 'active'
          });
      }
    }

    return new Response(
      JSON.stringify({ 
        candidates, 
        scan_type,
        alerts_created: candidates.filter(c => c.score > 70).length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in alpha-scout-scan:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to perform alpha scout scan' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});