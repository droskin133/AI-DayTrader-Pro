import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/helpers.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { symbol, limit = 200 } = await req.json();

    if (!symbol) {
      return new Response(JSON.stringify({ error: "symbol required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const polygonKey = Deno.env.get("POLYGON_API_KEY");
    if (!polygonKey) {
      throw new Error("POLYGON_API_KEY not configured");
    }

    const url = `https://api.polygon.io/v3/reference/options/contracts?underlying_ticker=${encodeURIComponent(symbol)}&limit=${limit}&apiKey=${polygonKey}`;
    const r = await fetch(url);

    if (!r.ok) {
      return new Response(JSON.stringify({ error: "polygon_error" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const data = await r.json();
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const rows = (data?.results ?? []).map((x: any) => ({
      ticker: symbol,
      expiry: x.expiration_date,
      strike: x.strike_price,
      type: x.contract_type?.toLowerCase(),
      volume: x.volume ?? 0,
      oi: x.open_interest ?? 0
    }));

    if (rows.length) {
      await supabase.from("options_flow").insert(rows);
    }

    await supabase.from("audit_log").insert({
      action: "options-flow.ok",
      meta: { symbol, count: rows.length }
    });

    return new Response(JSON.stringify({ symbol, count: rows.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Error in options-flow function:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch options flow" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
