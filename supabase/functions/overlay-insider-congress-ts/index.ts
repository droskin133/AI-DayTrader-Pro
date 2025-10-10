import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { supabase } from "../_shared/supabase.ts";
import { corsHeaders } from "../_shared/helpers.ts";

interface OverlayRequest {
  symbol: string;
  limit?: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { symbol, limit = 10 }: OverlayRequest = await req.json();
    
    if (!symbol) {
      return new Response(
        JSON.stringify({ error: 'Symbol is required' }), 
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch insider trades
    const { data: insiderTrades } = await supabase
      .from('insider_trades')
      .select('*')
      .eq('ticker', symbol)
      .order('ingested_at', { ascending: false })
      .limit(limit);

    // Fetch congress trades
    const { data: congressTrades } = await supabase
      .from('congress_trades')
      .select('*')
      .eq('ticker', symbol)
      .order('reported_date', { ascending: false })
      .limit(limit);

    const result = {
      symbol,
      insider_trades: (insiderTrades || []).map(trade => ({
        person: trade.person,
        transaction_type: trade.transaction_type,
        shares: trade.shares,
        price: trade.price,
        filed_at: trade.filed_at,
        source: 'sec'
      })),
      congressional_trades: (congressTrades || []).map(trade => ({
        member: trade.person,
        chamber: trade.chamber,
        transaction_type: trade.transaction_type,
        amount_range: trade.amount_range,
        disclosed_at: trade.reported_date,
        source: 'congress'
      })),
      total_trades: (insiderTrades?.length || 0) + (congressTrades?.length || 0),
      timestamp: new Date().toISOString()
    };

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error('Error in overlay-insider-congress-ts:', error);
    
    await supabase.from('error_logs').insert({
      function_name: 'overlay-insider-congress-ts',
      error_message: (error as Error).message,
      metadata: { error: String(error) }
    });

    return new Response(
      JSON.stringify({ error: 'Failed to fetch insider/congress data' }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
