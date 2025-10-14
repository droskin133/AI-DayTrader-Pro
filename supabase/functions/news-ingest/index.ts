import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );
  
  const NEWSAPI_KEY = Deno.env.get("NEWSAPI_KEY");
  const FINNHUB_API_KEY = Deno.env.get("FINNHUB_API_KEY");
  const POLYGON_API_KEY = Deno.env.get("POLYGON_API_KEY");

  try {
    const articles: any[] = [];

    // Fetch from NewsAPI
    if (NEWSAPI_KEY) {
      const newsApiResponse = await fetch(
        `https://newsapi.org/v2/top-headlines?category=business&apiKey=${NEWSAPI_KEY}`
      );
      if (newsApiResponse.ok) {
        const newsData = await newsApiResponse.json();
        for (const article of newsData.articles || []) {
          articles.push({
            symbol: null,
            headline: article.title,
            source: article.source?.name || 'NewsAPI',
            published_at: new Date(article.publishedAt).toISOString(),
            url: article.url,
            sentiment: null,
            ingested_at: new Date().toISOString()
          });
        }
      }
    }

    // Fetch from Finnhub
    if (FINNHUB_API_KEY) {
      const finnhubResponse = await fetch(
        `https://finnhub.io/api/v1/news?category=general&token=${FINNHUB_API_KEY}`
      );
      if (finnhubResponse.ok) {
        const finnhubData = await finnhubResponse.json();
        for (const item of finnhubData || []) {
          articles.push({
            symbol: item.related || null,
            headline: item.headline,
            source: item.source || 'Finnhub',
            published_at: new Date(item.datetime * 1000).toISOString(),
            url: item.url,
            sentiment: item.sentiment,
            ingested_at: new Date().toISOString()
          });
        }
      }
    }

    // Fetch from Polygon
    if (POLYGON_API_KEY) {
      const polygonResponse = await fetch(
        `https://api.polygon.io/v2/reference/news?apiKey=${POLYGON_API_KEY}`
      );
      if (polygonResponse.ok) {
        const polygonData = await polygonResponse.json();
        for (const item of polygonData.results || []) {
          articles.push({
            symbol: item.tickers?.[0] || null,
            headline: item.title,
            source: item.publisher?.name || 'Polygon',
            published_at: new Date(item.published_utc).toISOString(),
            url: item.article_url,
            sentiment: null,
            ingested_at: new Date().toISOString()
          });
        }
      }
    }

    if (articles.length > 0) {
      const { error } = await supabase.from('news_feed').upsert(articles);
      if (error) throw error;
    }

    return new Response(
      JSON.stringify({ status: 'ok', count: articles.length }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    await supabase.from('error_logs').insert({
      context: 'news-ingest',
      payload: { error: error instanceof Error ? error.message : String(error) },
      created_at: new Date().toISOString()
    });

    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
