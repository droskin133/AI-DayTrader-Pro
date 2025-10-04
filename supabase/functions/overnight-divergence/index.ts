import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/helpers.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { symbol, date } = await req.json();

    if (!symbol || !date) {
      return new Response(JSON.stringify({ error: "symbol and date required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const polygonKey = Deno.env.get("POLYGON_API_KEY");
    if (!polygonKey) {
      throw new Error("POLYGON_API_KEY not configured");
    }

    const url = `https://api.polygon.io/v1/open-close/${encodeURIComponent(symbol)}/${encodeURIComponent(date)}?adjusted=true&apiKey=${polygonKey}`;
    const r = await fetch(url);

    if (!r.ok) {
      return new Response(JSON.stringify({ error: "polygon_error" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const d = await r.json();
    const overnight = (d.open - d.preMarket) / d.preMarket;
    const intraday = (d.close - d.open) / d.open;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    await supabase.from("overnight_divergence").insert({
      ticker: symbol,
      trade_date: date,
      overnight_change: overnight,
      intraday_change: intraday
    });

    await supabase.from("audit_log").insert({
      action: "overnight-divergence.ok",
      meta: { symbol, date, overnight, intraday }
    });

    return new Response(JSON.stringify({ symbol, date, overnight, intraday }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Error in overnight-divergence function:", error);
    return new Response(JSON.stringify({ error: "Failed to calculate divergence" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
