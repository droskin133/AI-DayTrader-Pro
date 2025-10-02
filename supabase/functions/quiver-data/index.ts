import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { supabase } from "../_shared/supabase.ts";
import { ok, fail, corsHeaders, requireEnv } from "../_shared/helpers.ts";

/**
 * Quiver Data Function
 * ⚠️ LIVE DATA ONLY - Fetches real institutional/insider data
 */

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, ticker } = await req.json();
    
    if (!type || !ticker) {
      return new Response(JSON.stringify({ error: "type and ticker required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const apiKey = requireEnv("QUIVER_API_KEY");
    const res = await fetch(`https://api.quiverquant.com/beta/live/${type}/${ticker}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    
    if (!res.ok) {
      throw new Error(`Quiver API error: ${res.status}`);
    }
    
    const data = await res.json();
    
    return ok(data);
  } catch (err) {
    console.error("Error in quiver-data:", err);
    return fail("quiver-data", err, {}, supabase);
  }
});