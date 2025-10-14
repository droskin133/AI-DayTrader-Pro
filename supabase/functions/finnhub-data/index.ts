import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const FINNHUB_API_KEY = Deno.env.get("FINNHUB_API_KEY");

  try {
    if (!FINNHUB_API_KEY) {
      throw new Error('FINNHUB_API_KEY not configured');
    }

    const { symbol } = await req.json();

    if (!symbol) {
      throw new Error('Symbol is required');
    }

    // Fetch fundamentals
    const response = await fetch(
      `https://finnhub.io/api/v1/stock/metric?symbol=${symbol}&metric=all&token=${FINNHUB_API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`Finnhub API error: ${response.status}`);
    }

    const data = await response.json();
    const metrics = data.metric || {};

    // Update market_data with fundamentals
    await supabase.from('market_data').upsert({
      symbol,
      pe: metrics.peBasicExclExtraTTM,
      eps: metrics.epsBasicExclExtraItemsNormalizedQuarter,
      float: metrics.floatSharesOutstanding,
      short_interest: metrics.shortInterestPercent,
      updated_at: new Date().toISOString()
    });

    return new Response(
      JSON.stringify({ status: 'ok', metrics }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    await supabase.from('error_logs').insert({
      context: 'finnhub-data',
      payload: { error: error instanceof Error ? error.message : String(error) },
      created_at: new Date().toISOString()
    });

    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
