import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { supabase } from "../_shared/supabase.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface InstitutionalRequest {
  symbol: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  const requestId = crypto.randomUUID();

  try {
    const { symbol }: InstitutionalRequest = await req.json();
    
    if (!symbol) {
      return new Response(
        JSON.stringify({ error: 'Symbol is required' }), 
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check cache first
    const { data: cachedData } = await supabase
      .from('institutional_trades')
      .select('*')
      .eq('symbol', symbol)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    // If we have recent data (less than 1 hour old), return it
    if (cachedData && new Date(cachedData.created_at).getTime() > Date.now() - (60 * 60 * 1000)) {
      return new Response(
        JSON.stringify(cachedData.data),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const quiverApiKey = Deno.env.get("QUIVER_API_KEY");
    
    // Initialize results
    let sec_insider_trades: any[] = [];
    let hedge_fund_positions: any[] = [];
    let congressional_trades: any[] = [];
    const sources: string[] = [];

    // Try to fetch from Quiver if API key available
    if (quiverApiKey) {
      try {
        // Fetch congressional trades
        const congressUrl = `https://api.quiverquant.com/beta/live/congresstrading/${symbol}`;
        const congressResponse = await fetch(congressUrl, {
          headers: { 'Authorization': `Bearer ${quiverApiKey}` }
        });

        if (congressResponse.ok) {
          const congressData = await congressResponse.json();
          congressional_trades = (congressData || []).slice(0, 5).map((trade: any) => ({
            member: trade.Representative || 'Unknown',
            type: trade.Transaction?.toUpperCase() || 'UNKNOWN',
            amount: trade.Range || 'Unknown',
            disclosed_at: trade.TransactionDate || new Date().toISOString()
          }));
          sources.push('quiver');
        }

        // Fetch insider trades
        const insiderUrl = `https://api.quiverquant.com/beta/live/insidertrading/${symbol}`;
        const insiderResponse = await fetch(insiderUrl, {
          headers: { 'Authorization': `Bearer ${quiverApiKey}` }
        });

        if (insiderResponse.ok) {
          const insiderData = await insiderResponse.json();
          sec_insider_trades = (insiderData || []).slice(0, 5).map((trade: any) => ({
            filer: trade.Filer || 'Unknown',
            type: trade.Transaction?.toUpperCase() || 'UNKNOWN',
            shares: trade.Shares || 0,
            price: trade.Price || 0,
            filed_at: trade.Date || new Date().toISOString()
          }));
          sources.push('sec');
        }
      } catch (error) {
        console.log('Quiver API error:', error.message);
      }
    }

    // Try additional API sources if Quiver didn't provide enough data
    if (sec_insider_trades.length === 0) {
      // Try SEC Edgar API as fallback
      try {
        const secUrl = `https://data.sec.gov/api/xbrl/companyfacts/CIK${symbol}.json`;
        const secResponse = await fetch(secUrl, {
          headers: { 
            'User-Agent': 'DayTrader-Pro contact@daytrader.com',
            'Accept': 'application/json'
          }
        });
        
        if (secResponse.ok) {
          // SEC data processing would go here
          // For now, we'll use database cache
        }
      } catch (secError) {
        console.log('SEC API error:', secError.message);
      }
    }

    // Fallback to database cache if no API data available
    if (sec_insider_trades.length === 0) {
      const { data: cachedInsider } = await supabase
        .from('institutional_trades')
        .select('data')
        .eq('symbol', symbol)
        .eq('source', 'sec')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
        
      if (cachedInsider?.data?.sec_insider_trades) {
        sec_insider_trades = cachedInsider.data.sec_insider_trades.slice(0, 5);
        sources.push('sec_cache');
      }
    }

    if (hedge_fund_positions.length === 0) {
      const { data: cachedHedge } = await supabase
        .from('institutional_trades')
        .select('data')
        .eq('symbol', symbol)
        .eq('source', 'whalewisdom')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
        
      if (cachedHedge?.data?.hedge_fund_positions) {
        hedge_fund_positions = cachedHedge.data.hedge_fund_positions.slice(0, 5);
        sources.push('whalewisdom_cache');
      }
    }

    if (congressional_trades.length === 0) {
      const { data: cachedCongress } = await supabase
        .from('congress_trades')
        .select('*')
        .eq('ticker', symbol)
        .order('reported_date', { ascending: false })
        .limit(5);
        
      if (cachedCongress && cachedCongress.length > 0) {
        congressional_trades = cachedCongress.map(trade => ({
          member: trade.person || 'Unknown',
          type: trade.transaction_type?.toUpperCase() || 'UNKNOWN',
          amount: trade.amount_range || 'Unknown',
          disclosed_at: trade.reported_date || new Date().toISOString()
        }));
        sources.push('congress_cache');
      }
    }

    const result = {
      symbol,
      sec_insider_trades,
      hedge_fund_positions,
      congressional_trades,
      source: sources.length > 0 ? sources : ['mock']
    };

    // Cache the result
    await supabase.from('institutional_trades').insert({
      symbol,
      source: sources.join(',') || 'mock',
      data: result,
      reported_at: new Date().toISOString()
    });

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    const latencyMs = Date.now() - startTime;
    
    // Log error to audit_logs
    await supabase.from('audit_logs').insert({
      function_name: 'institutional',
      error_message: error.message,
      request_id: requestId,
      payload_hash: 'error',
      upstream_status: 500,
      latency_ms: latencyMs
    });

    console.error('Error in institutional function:', error);
    
    return new Response(
      JSON.stringify({ error: 'Failed to fetch institutional data' }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});