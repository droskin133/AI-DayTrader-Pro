import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders, requireEnv } from "../_shared/helpers.ts";

/**
 * Polygon Data Function
 * ⚠️ LIVE DATA ONLY - Fetches real market data and stores in DB
 */

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { ticker } = await req.json();
    
    if (!ticker) {
      return new Response(JSON.stringify({ error: "ticker required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const apiKey = requireEnv("POLYGON_API_KEY");
    const res = await fetch(`https://api.polygon.io/v2/aggs/ticker/${ticker}/prev?apiKey=${apiKey}`);
    
    if (!res.ok) {
      throw new Error(`Polygon API error: ${res.status}`);
    }
    
    const data = await res.json();
    
    if (!data.results || data.results.length === 0) {
      return new Response(JSON.stringify({ error: "No data available" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Store in database
    const result = data.results[0];
    await supabase.from('stock_prices').insert({
      ticker: ticker,
      price: result.c,
      change_percent: ((result.c - result.o) / result.o) * 100,
      volume: result.v,
      high_52w: result.h,
      low_52w: result.l,
      source: 'polygon'
    });

    // Log API call
    await supabase.from('audit_logs').insert({
      function_name: 'polygon-data',
      action: 'fetch',
      payload: { ticker },
      upstream_status: res.status
    });

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (err) {
    console.error("Error in polygon-data:", err);
    
    return new Response(JSON.stringify({ 
      error: err instanceof Error ? err.message : 'Unknown error'
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});