import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/helpers.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const requestId = crypto.randomUUID();
  
  try {
    const polygonKey = Deno.env.get("POLYGON_API_KEY");
    
    if (!polygonKey) {
      return new Response(
        JSON.stringify({ 
          gainers: [], 
          losers: [], 
          volume: [], 
          note: "POLYGON_API_KEY not configured" 
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    const fetchJson = async (url: string) => {
      try {
        const r = await fetch(url);
        if (!r.ok) return null;
        return await r.json();
      } catch {
        return null;
      }
    };

    const [gainersData, losersData] = await Promise.all([
      fetchJson(`https://api.polygon.io/v2/snapshot/locale/us/markets/stocks/gainers?apiKey=${polygonKey}`),
      fetchJson(`https://api.polygon.io/v2/snapshot/locale/us/markets/stocks/losers?apiKey=${polygonKey}`)
    ]);

    const mapSnapshot = (arr: any[]) => {
      if (!Array.isArray(arr)) return [];
      return arr.slice(0, 25).map((x: any) => ({
        ticker: x?.ticker || x?.T || "",
        price: x?.lastTrade?.p ?? x?.last?.price ?? null,
        change: x?.todaysChange ?? null,
        changePercent: x?.todaysChangePerc ?? null,
        volume: x?.day?.v ?? null
      }));
    };

    const result = {
      gainers: mapSnapshot(gainersData?.tickers || gainersData?.results || []),
      losers: mapSnapshot(losersData?.tickers || losersData?.results || []),
      volume: []
    };

    // Log to audit
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    await supabase.from("audit_logs").insert({
      function_name: "market-movers",
      request_id: requestId,
      upstream_status: 200
    });

    return new Response(
      JSON.stringify(result),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    console.error("Error in market-movers function:", error);
    
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    await supabase.from("error_logs").insert({
      function_name: "market-movers",
      error_message: error.message,
      request_id: requestId
    });

    return new Response(
      JSON.stringify({ 
        gainers: [], 
        losers: [], 
        volume: [], 
        error: "Failed to fetch market movers" 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});