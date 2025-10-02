import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { supabase } from "../_shared/supabase.ts";
import { ok, fail, corsHeaders, checkRateLimit, requireEnv } from "../_shared/helpers.ts";

/**
 * Live Stock Price Function
 * ⚠️ LIVE DATA ONLY - No dummy/mock/placeholder values allowed
 * Fetches real-time stock prices from Polygon API and stores in stock_prices table
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

    // Rate limit check
    const authHeader = req.headers.get("Authorization");
    const userId = authHeader ? authHeader.replace("Bearer ", "") : null;
    const rateLimit = await checkRateLimit(supabase, userId, "stock-price", 100, 60);
    
    if (!rateLimit.allowed) {
      return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Fetch live data from Polygon
    const apiKey = requireEnv("POLYGON_API_KEY");
    const response = await fetch(
      `https://api.polygon.io/v2/aggs/ticker/${ticker}/prev?apiKey=${apiKey}`
    );

    if (!response.ok) {
      throw new Error(`Polygon API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.results || data.results.length === 0) {
      return new Response(JSON.stringify({ error: "No data available" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const result = data.results[0];
    
    // Store in stock_prices table
    await supabase.from("stock_prices").insert({
      ticker,
      price: result.c,
      ts: new Date(result.t)
    });

    return ok({
      ticker,
      price: result.c,
      volume: result.v,
      timestamp: result.t,
      open: result.o,
      high: result.h,
      low: result.l,
      close: result.c
    });

  } catch (err) {
    console.error("Error in live-stock-price:", err);
    return fail("live-stock-price", err, { ticker: (await req.json()).ticker }, supabase);
  }
});
