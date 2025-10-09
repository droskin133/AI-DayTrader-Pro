import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from "../_shared/helpers.ts";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Get user's watchlist positions as proxy for portfolio
    const { data: watchlist, error: watchlistError } = await supabase
      .from('watchlist')
      .select('ticker')
      .limit(10);

    if (watchlistError) throw watchlistError;

    if (!watchlist || watchlist.length === 0) {
      return new Response(JSON.stringify({
        metrics: null,
        riskLevel: 'low',
        message: 'No positions to analyze'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Fetch recent price data for risk calculation
    const tickers = watchlist.map(w => w.ticker);
    const { data: prices } = await supabase
      .from('stock_prices')
      .select('ticker, price, change_percent')
      .in('ticker', tickers)
      .order('ts', { ascending: false })
      .limit(tickers.length);

    // Calculate basic risk metrics
    const volatilities = prices?.map(p => Math.abs(p.change_percent || 0)) || [];
    const avgVolatility = volatilities.length > 0 
      ? volatilities.reduce((a, b) => a + b, 0) / volatilities.length 
      : 0;

    const maxDrawdown = Math.max(...volatilities.map(v => -Math.abs(v)));
    const concentrationRisk = 100 / Math.max(tickers.length, 1); // Simple equal weight assumption
    const betaRisk = 1.0; // Simplified - would need market correlation data

    const portfolioRisk = Math.min(100, (avgVolatility * 2 + Math.abs(maxDrawdown)));
    
    let riskLevel: 'low' | 'medium' | 'high' = 'low';
    if (portfolioRisk > 60) riskLevel = 'high';
    else if (portfolioRisk > 30) riskLevel = 'medium';

    const metrics = {
      portfolioRisk: Number(portfolioRisk.toFixed(1)),
      maxDrawdown: Number(maxDrawdown.toFixed(1)),
      volatility: Number(avgVolatility.toFixed(1)),
      betaRisk: Number(betaRisk.toFixed(2)),
      concentrationRisk: Number(concentrationRisk.toFixed(1))
    };

    // Log metrics
    await supabase.from('ai_run_metrics').insert({
      mode: 'risk_scanner',
      latency_ms: Date.now() - Date.now(),
      upstream_status: 200
    });

    return new Response(JSON.stringify({
      metrics,
      riskLevel,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in real-time-risk-scanner:', error);
    
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : 'Unknown error',
      metrics: null,
      riskLevel: 'low'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});