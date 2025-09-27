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
    const { user_id } = await req.json();

    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

    // Get user's watchlist
    const { data: watchlist, error: watchlistError } = await supabase
      .from('watchlist')
      .select('ticker')
      .eq('user_id', user_id);

    if (watchlistError) throw watchlistError;

    const tickers = watchlist.map(w => w.ticker);
    
    if (tickers.length === 0) {
      return new Response(
        JSON.stringify({ rankings: [], message: 'No tickers in watchlist' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // AI analysis for upgrade opportunity ranking
    const prompt = `Rank these tickers by upgrade opportunity: ${tickers.join(', ')}
    
    Consider:
    1. Positive sentiment breakouts
    2. Reversal setups
    3. Technical strength
    4. Volume accumulation
    
    Return JSON array with ticker and opportunity_score 1-100, ordered by highest opportunity first.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a technical analysis expert. Return valid JSON only.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 300,
        temperature: 0.3,
      }),
    });

    const aiData = await response.json();
    let rankings;
    
    try {
      rankings = JSON.parse(aiData.choices[0].message.content);
    } catch {
      // Fallback ranking
      rankings = tickers.map((ticker, index) => ({
        ticker,
        opportunity_score: 60 - (index * 3)
      }));
    }

    // Insert flags for high-opportunity tickers
    const highOpportunityTickers = rankings.filter((r: any) => r.opportunity_score > 75);
    
    for (const ticker of highOpportunityTickers) {
      await supabase
        .from('ai_auto_flags')
        .insert({
          user_id,
          symbol: ticker.ticker,
          event_type: 'upgrade_opportunity',
          explanation: `High upgrade opportunity detected (score: ${ticker.opportunity_score})`,
          risk_score: ticker.opportunity_score,
          metadata: { ranking_type: 'watchlist_upgrade' }
        });
    }

    return new Response(
      JSON.stringify({ rankings, high_opportunity_count: highOpportunityTickers.length }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in rank-watchlist-upgrade-opportunity:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to rank upgrade opportunities' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});