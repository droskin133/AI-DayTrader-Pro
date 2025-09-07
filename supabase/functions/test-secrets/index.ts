import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

serve(() => {
  return new Response(JSON.stringify({
    openai: !!Deno.env.get("OPENAI_API_KEY"),
    polygon: !!Deno.env.get("POLYGON_API_KEY"),
    finnhub: !!Deno.env.get("FINNHUB_API_KEY"),
    quiver: !!Deno.env.get("QUIVER_API_KEY"),
    stripe: !!Deno.env.get("STRIPE_SECRET_KEY"),
  }), { headers: { "Content-Type": "application/json" } });
});