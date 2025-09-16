import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, ticker } = await req.json();
    const apiKey = Deno.env.get("FINNHUB_API_KEY");
    
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'Finnhub API key not configured' }), 
        { 
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Use 3-month date range instead of full year for better performance
    const today = new Date();
    const from = new Date(today);
    from.setMonth(from.getMonth() - 3);
    const formatDate = (d: Date) => d.toISOString().slice(0, 10);

    const url = type === "news"
      ? `https://finnhub.io/api/v1/company-news?symbol=${ticker}&from=${formatDate(from)}&to=${formatDate(today)}&token=${apiKey}`
      : `https://finnhub.io/api/v1/quote?symbol=${ticker}&token=${apiKey}`;

    console.log(`Fetching ${type} data for ${ticker} from Finnhub`);

    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Finnhub API error: ${res.status} ${res.statusText}`);
    }
    
    const data = await res.json();

    return new Response(
      JSON.stringify(data), 
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error('Error fetching Finnhub data:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch data from Finnhub' }), 
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});