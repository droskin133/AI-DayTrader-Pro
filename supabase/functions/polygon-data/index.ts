import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { supabase } from "../_shared/supabase.ts";
import { ok, fail, corsHeaders, requireEnv } from "../_shared/helpers.ts";

/**
 * Polygon Data Function
 * ⚠️ LIVE DATA ONLY - No dummy/mock/placeholder values
 */

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
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

    return ok(data);
  } catch (err) {
    console.error("Error in polygon-data:", err);
    return fail("polygon-data", err, {}, supabase);
  }
});