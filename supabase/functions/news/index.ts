import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { supabase } from "../_shared/supabase.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NewsRequest {
  symbol: string;
  watchlist?: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  const requestId = crypto.randomUUID();

  try {
    const { symbol, watchlist = [] }: NewsRequest = await req.json();
    
    if (!symbol) {
      return new Response(
        JSON.stringify({ error: 'Symbol is required' }), 
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check cache first
    const cacheKey = `news_${symbol}_${new Date().toISOString().split('T')[0]}`;
    const { data: cachedNews } = await supabase
      .from('news_cache')
      .select('*')
      .eq('id', cacheKey)
      .single();

    if (cachedNews) {
      return new Response(
        JSON.stringify({
          symbol,
          items: cachedNews.raw?.items || []
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const finnhubApiKey = Deno.env.get("FINNHUB_API_KEY");
    if (!finnhubApiKey) {
      throw new Error('FINNHUB_API_KEY not configured');
    }

    // Calculate date range (last 7 days)
    const today = new Date();
    const from = new Date(today);
    from.setDate(from.getDate() - 7);
    const formatDate = (d: Date) => d.toISOString().slice(0, 10);

    const url = `https://finnhub.io/api/v1/company-news?symbol=${symbol}&from=${formatDate(from)}&to=${formatDate(today)}&token=${finnhubApiKey}`;

    const response = await fetch(url);
    
    if (!response.ok) {
      if (response.status === 429) {
        // Return cached or empty result if rate limited
        return new Response(
          JSON.stringify({
            symbol,
            items: []
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error(`Finnhub API error: ${response.status} ${response.statusText}`);
    }

    const newsData = await response.json();

    // Transform and filter news items
    const items = (newsData || []).slice(0, 10).map((item: any) => ({
      id: `news_${item.id || Date.now()}_${Math.random()}`,
      source: item.source || 'Unknown',
      headline: item.headline || item.title || 'No headline',
      url: item.url || '#',
      published_at: item.datetime ? new Date(item.datetime * 1000).toISOString() : new Date().toISOString(),
      tickers: [symbol],
      summary: item.summary || item.headline?.slice(0, 200) || 'No summary available',
      sentiment: item.sentiment || 0
    }));

    // Cache the result
    await supabase.from('news_cache').upsert({
      id: cacheKey,
      symbol,
      headline: `News for ${symbol}`,
      url: '#',
      published_at: new Date().toISOString(),
      sentiment: 0,
      raw: { items }
    });

    const result = {
      symbol,
      items
    };

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    const latencyMs = Date.now() - startTime;
    
    // Log error to audit_logs
    await supabase.from('audit_logs').insert({
      function_name: 'news',
      error_message: error.message,
      request_id: requestId,
      payload_hash: 'error',
      upstream_status: 500,
      latency_ms: latencyMs
    });

    console.error('Error in news function:', error);
    
    return new Response(
      JSON.stringify({ error: 'Failed to fetch news data' }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});