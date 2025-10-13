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

  try {
    if (!NEWS_API_KEY) {
      throw new Error('NEWS_API_KEY not configured');
    }

    const response = await fetch(
      `https://newsapi.org/v2/top-headlines?category=business&apiKey=${NEWS_API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`NewsAPI error: ${response.status}`);
    }

    const newsData = await response.json();
    
    const articles = newsData.articles?.map((article: any) => ({
      symbol: article.symbol || null,
      title: article.title,
      source: article.source?.name || 'Unknown',
      published_at: article.publishedAt,
      url: article.url
    })) || [];

    if (articles.length > 0) {
      const { error } = await supabase.from('news_events').upsert(articles);
      if (error) throw error;
    }

    return new Response(
      JSON.stringify({ status: 'ok', count: articles.length }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    await supabase.from('error_logs').insert({
      context: 'news-ingest',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : null
    });

    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
