import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/helpers.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const finnhubKey = Deno.env.get("FINNHUB_API_KEY");
    if (!finnhubKey) {
      throw new Error("FINNHUB_API_KEY not configured");
    }

    const url = `https://finnhub.io/api/v1/calendar/earnings?from=2025-01-01&to=2025-12-31&token=${finnhubKey}`;
    const r = await fetch(url);

    if (!r.ok) {
      return new Response(JSON.stringify({ error: "finnhub_error" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const data = await r.json();
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const cal = data?.earningsCalendar ?? [];
    const rows = cal.map((e: any) => ({
      ticker: e.symbol,
      start_date: e.date,
      end_date: e.date,
      percent_sp500: 0
    }));

    if (rows.length) {
      await supabase.from("buyback_blackout").insert(rows);
    }

    await supabase.from("audit_log").insert({
      action: "buyback-blackout.ok",
      meta: { count: rows.length }
    });

    return new Response(JSON.stringify({ ok: true, count: rows.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Error in buyback-blackout function:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch buyback blackout data" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
