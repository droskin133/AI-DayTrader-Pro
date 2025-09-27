import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { supabase } from "../_shared/supabase.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Running hourly AI scanner for S&P 500...');

    // Get S&P 500 tickers for scanning
    const { data: sp500Tickers, error: tickersError } = await supabase
      .from('sp500')
      .select('ticker')
      .limit(50); // Process in batches

    if (tickersError) {
      throw new Error(`Failed to fetch S&P 500 tickers: ${tickersError.message}`);
    }

    const results = [];

    for (const { ticker } of sp500Tickers || []) {
      try {
        // Gather market data for each ticker
        const [priceData, newsData, optionsData] = await Promise.all([
          supabase.from('equity_snapshots').select('*').eq('ticker', ticker).order('snapshot_time', { ascending: false }).limit(1),
          supabase.from('news_events').select('*').contains('tickers', [ticker]).order('published_at', { ascending: false }).limit(5),
          supabase.from('options_flow').select('*').eq('ticker', ticker).order('snapshot_time', { ascending: false }).limit(3)
        ]);

        // Calculate technical indicators based on real data
        const marketContext = {
          ticker,
          current_price: priceData.data?.[0]?.price || 0,
          price_change: priceData.data?.[0]?.percent_change || 0,
          volume: priceData.data?.[0]?.volume || 0,
          news_sentiment: newsData.data?.length || 0,
          options_activity: optionsData.data?.length || 0,
          scan_time: new Date().toISOString()
        };

        // Simple scoring algorithm
        let score = 50; // Base score

        // Price momentum
        if (Math.abs(marketContext.price_change) > 2) score += 15;
        if (Math.abs(marketContext.price_change) > 5) score += 25;

        // News activity
        if (marketContext.news_sentiment > 2) score += 10;
        if (marketContext.news_sentiment > 5) score += 20;

        // Options activity
        if (marketContext.options_activity > 1) score += 10;
        if (marketContext.options_activity > 3) score += 15;

        // Volume spike
        if (marketContext.volume > 1000000) score += 5;

        // Log the analysis to AI learning system
        await supabase.from('ai_learning_log').insert({
          user_id: null, // System scan
          ticker,
          mode: 'hourly_scan',
          input: marketContext,
          output: { score, timestamp: new Date() }
        });

        results.push({
          ticker,
          score,
          context: marketContext
        });

      } catch (tickerError) {
        console.error(`Error processing ${ticker}:`, tickerError);
        
        // Log error
        await supabase.from('error_logs').insert({
          function_name: 'hourly-ai-scanner',
          error_message: `Error processing ${ticker}: ${(tickerError as Error).message}`,
          metadata: { ticker }
        });
      }
    }

    // Sort by score and return top alerts
    const topAlerts = results
      .filter(r => r.score > 70)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    console.log(`Hourly scan complete: ${results.length} tickers analyzed, ${topAlerts.length} high-score alerts`);

    return new Response(
      JSON.stringify({ 
        success: true,
        scanned_count: results.length,
        high_score_alerts: topAlerts.length,
        top_alerts: topAlerts,
        scan_timestamp: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error('Error in hourly AI scanner:', error);
    
    // Log error
    await supabase.from('error_logs').insert({
      function_name: 'hourly-ai-scanner',
      error_message: (error as Error).message,
      metadata: { scan_type: 'hourly' }
    });

    return new Response(
      JSON.stringify({ 
        error: 'Hourly scan failed',
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});