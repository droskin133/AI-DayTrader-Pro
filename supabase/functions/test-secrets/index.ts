import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { corsHeaders } from '../_shared/helpers.ts';

serve((req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const secrets = {
    openai: !!Deno.env.get("OPENAI_API_KEY"),
    polygon: !!Deno.env.get("POLYGON_API_KEY"),
    finnhub: !!Deno.env.get("FINNHUB_API_KEY"),
    quiver: !!Deno.env.get("QUIVER_API_KEY"),
    stripe: !!Deno.env.get("STRIPE_SECRET_KEY"),
  };

  const allPresent = Object.values(secrets).every(v => v);
  const status = allPresent ? 200 : 500;

  return new Response(JSON.stringify({
    ...secrets,
    status: allPresent ? 'all_configured' : 'missing_keys',
    message: allPresent 
      ? 'All API keys configured - production ready' 
      : 'Missing API keys - app will fail closed (no dummy data)'
  }), { 
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" } 
  });
});