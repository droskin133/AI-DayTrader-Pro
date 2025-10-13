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
  const NEWS_API_KEY = Deno.env.get("NEWS_API_KEY");
  const FINNHUB_API_KEY = Deno.env.get("FINNHUB_API_KEY");

  try {
    const articles = [];

    // Fetch from NewsAPI
    if (NEWS_API_KEY) {
      const newsApiResponse = await fetch(
        `https://newsapi.org/v2/top-headlines?category=business&apiKey=${NEWS_API_KEY}`
      );
      const newsData = await newsApiResponse.json();
      
      for (const article of newsData.articles ?? []) {
        articles.push({
          headline: article.title,
          source: article.source?.name || 'NewsAPI',
          url: article.url,
          published_at: article.publishedAt,
          symbol: null
        });
      }
    }

    // Fetch from Finnhub
    if (FINNHUB_API_KEY) {
      const finnhubResponse = await fetch(
        `https://finnhub.io/api/v1/news?category=general&token=${FINNHUB_API_KEY}`
      );
      const finnhubData = await finnhubResponse.json();
      
      for (const item of finnhubData?.slice(0, 20) ?? []) {
        articles.push({
          headline: item.headline,
          source: item.source || 'Finnhub',
          url: item.url,
          published_at: new Date(item.datetime * 1000).toISOString(),
          symbol: item.related || null
        });
      }
    }

    // Insert articles into database
    if (articles.length > 0) {
      const { error } = await supabase.from('news').upsert(articles, {
        onConflict: 'url',
        ignoreDuplicates: true
      });

      if (error) throw error;
    }

    return new Response(
      JSON.stringify({ success: true, count: articles.length }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (e) {
    await supabase.from('error_logs').insert({
      function: 'news-ingest',
      message: String(e),
      payload: { error: e instanceof Error ? e.message : String(e) }
    });
    
    return new Response(
      JSON.stringify({ error: 'Failed to ingest news' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
