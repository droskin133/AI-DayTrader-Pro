import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders, requireEnv } from "../_shared/helpers.ts";

/**
 * Quiver Data Function
 * ⚠️ LIVE DATA ONLY - Fetches real institutional/insider/congress data
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
    
    // Store data based on type
    if (type === 'congress' && Array.isArray(data)) {
      const congressTrades = data.map((trade: any) => ({
        ticker,
        person: trade.Representative || trade.Senator,
        chamber: trade.House ? 'House' : 'Senate',
        transaction_type: trade.Transaction,
        amount_range: trade.Amount,
        trade_date: trade.TransactionDate,
        reported_date: trade.ReportDate,
        raw: trade
      }));

      await supabase.from('congress_trades').upsert(congressTrades, { 
        onConflict: 'ticker,person,trade_date' 
      });
    } else if (type === 'insider' && Array.isArray(data)) {
      const insiderTrades = data.map((trade: any) => ({
        ticker,
        insider_name: trade.Insider,
        relation: trade.Relationship,
        shares: trade.Shares,
        action: trade.Transaction,
        filed_at: trade.FiledDate
      }));

      await supabase.from('insider_trades').upsert(insiderTrades, { 
        onConflict: 'ticker,insider_name,filed_at' 
      });
    } else if (type === 'institutional' && Array.isArray(data)) {
      const institutionalTrades = data.map((trade: any) => ({
        ticker,
        firm: trade.Holder,
        shares: trade.Shares,
        action: trade.Change > 0 ? 'buy' : 'sell',
        filed_at: trade.FiledDate
      }));

      await supabase.from('institutional_trades').upsert(institutionalTrades, { 
        onConflict: 'ticker,firm,filed_at' 
      });
    }

    // Log API call
    await supabase.from('audit_logs').insert({
      function_name: 'quiver-data',
      action: 'fetch',
      payload: { type, ticker },
      upstream_status: res.status
    });

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (err) {
    console.error("Error in quiver-data:", err);
    
    return new Response(JSON.stringify({ 
      error: err instanceof Error ? err.message : 'Unknown error'
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});