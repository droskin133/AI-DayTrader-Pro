import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, ticker } = await req.json();
    
    if (!type || !ticker) {
      return new Response(
        JSON.stringify({ error: 'type and ticker are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = Deno.env.get('FINNHUB_API_KEY');
    if (!apiKey) {
      throw new Error('FINNHUB_API_KEY not configured');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    let endpoint = '';
    
    switch (type) {
      case 'quote':
        endpoint = `https://finnhub.io/api/v1/quote?symbol=${ticker}&token=${apiKey}`;
        break;
      case 'profile':
        endpoint = `https://finnhub.io/api/v1/stock/profile2?symbol=${ticker}&token=${apiKey}`;
        break;
      case 'news':
        const to = new Date().toISOString().split('T')[0];
        const from = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        endpoint = `https://finnhub.io/api/v1/company-news?symbol=${ticker}&from=${from}&to=${to}&token=${apiKey}`;
        break;
      case 'candles':
        const resolution = 'D';
        const toTs = Math.floor(Date.now() / 1000);
        const fromTs = toTs - (365 * 24 * 60 * 60);
        endpoint = `https://finnhub.io/api/v1/stock/candle?symbol=${ticker}&resolution=${resolution}&from=${fromTs}&to=${toTs}&token=${apiKey}`;
        break;
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid type' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    const response = await fetch(endpoint);
    
    if (!response.ok) {
      throw new Error(`Finnhub API error: ${response.status}`);
    }

    const data = await response.json();

    // Store quote data in stock_prices table
    if (type === 'quote' && data.c) {
      await supabase.from('stock_prices').insert({
        ticker: ticker,
        price: data.c,
        change_percent: data.dp,
        volume: data.v,
        high_52w: data.h,
        low_52w: data.l,
        source: 'finnhub',
        fetched_at: new Date().toISOString()
      });
    }

    // Store news data
    if (type === 'news' && Array.isArray(data)) {
      const newsItems = data.map(item => ({
        ticker: ticker,
        title: item.headline,
        url: item.url,
        source: item.source,
        published_at: new Date(item.datetime * 1000).toISOString(),
        sentiment: item.sentiment > 0 ? 'positive' : item.sentiment < 0 ? 'negative' : 'neutral',
        hash: `${ticker}_${item.datetime}_${item.headline}`.replace(/[^a-zA-Z0-9]/g, '_')
      }));

      await supabase.from('news_events').upsert(newsItems, { onConflict: 'hash', ignoreDuplicates: true });
    }

    return new Response(
      JSON.stringify(data),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in finnhub-data:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});