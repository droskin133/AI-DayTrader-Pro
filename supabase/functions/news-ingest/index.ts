import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { supabase } from "../_shared/supabase.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NewsItem {
  headline: string;
  summary: string;
  url: string;
  published_at: string;
  tickers?: string[];
  source: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const finnhubApiKey = Deno.env.get("FINNHUB_API_KEY");
    if (!finnhubApiKey) {
      throw new Error('FINNHUB_API_KEY not configured');
    }

    // Fetch general market news
    const newsResponse = await fetch(
      `https://finnhub.io/api/v1/news?category=general&token=${finnhubApiKey}`
    );

    if (!newsResponse.ok) {
      throw new Error(`Finnhub API error: ${newsResponse.status} ${newsResponse.statusText}`);
    }

    const newsData = await newsResponse.json();

    // Process and deduplicate news
    const processedNews: NewsItem[] = newsData.slice(0, 20).map((item: any) => ({
      headline: item.headline,
      summary: item.summary,
      url: item.url,
      published_at: new Date(item.datetime * 1000).toISOString(),
      tickers: item.related ? [item.related] : [],
      source: item.source
    }));

    // Insert news with deduplication
    for (const news of processedNews) {
      try {
        // Check if news already exists using hash function
        const { data: existing } = await supabase
          .from('news_events')
          .select('id')
          .eq('headline', news.headline)
          .eq('source', news.source)
          .single();

        if (!existing) {
          const { error } = await supabase
            .from('news_events')
            .insert({
              headline: news.headline,
              body: news.summary,
              source_url: news.url,
              published_at: news.published_at,
              tickers: news.tickers,
              source: news.source,
              sentiment: Math.random() * 2 - 1, // Mock sentiment for now
            });

          if (error) {
            console.error('Error inserting news:', error);
          }
        }
      } catch (error) {
        console.error('Error processing news item:', error);
      }
    }

    return new Response(
      JSON.stringify({ 
        processed: processedNews.length,
        message: 'News ingestion completed'
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error('Error in news-ingest function:', error);
    
    return new Response(
      JSON.stringify({ error: 'Failed to ingest news data' }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});