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
    
    if (tickers.length < 2) {
      return new Response(
        JSON.stringify({ clusters: [], message: 'Need at least 2 tickers to cluster' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // AI clustering analysis
    const prompt = `Cluster these tickers by technical similarity: ${tickers.join(', ')}
    
    Group by:
    1. RSI patterns
    2. Volume zones
    3. Price action similarity
    4. Sector correlation
    
    Return JSON array of arrays, each sub-array containing similar tickers.
    Example: [["AAPL", "MSFT"], ["TSLA", "NVDA"]]`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a technical analysis expert. Return valid JSON array of arrays only.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 200,
        temperature: 0.3,
      }),
    });

    const aiData = await response.json();
    let clusters;
    
    try {
      clusters = JSON.parse(aiData.choices[0].message.content);
    } catch {
      // Fallback: simple pair clustering
      clusters = [];
      for (let i = 0; i < tickers.length; i += 2) {
        if (i + 1 < tickers.length) {
          clusters.push([tickers[i], tickers[i + 1]]);
        } else {
          clusters.push([tickers[i]]);
        }
      }
    }

    // Insert flags for clustered pairs
    for (const cluster of clusters) {
      if (cluster.length > 1) {
        for (const ticker of cluster) {
          await supabase
            .from('ai_auto_flags')
            .insert({
              user_id,
              symbol: ticker,
              event_type: 'clustered_pair',
              explanation: `Clustered with: ${cluster.filter((t: string) => t !== ticker).join(', ')}`,
              risk_score: 0,
              metadata: { 
                cluster_members: cluster,
                cluster_size: cluster.length
              }
            });
        }
      }
    }

    return new Response(
      JSON.stringify({ clusters, cluster_count: clusters.length }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in ai-cluster-similar-tickers:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to cluster tickers' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});