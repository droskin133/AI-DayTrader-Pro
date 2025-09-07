import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

serve(async (req) => {
  const { type, ticker } = await req.json();
  const apiKey = Deno.env.get("QUIVER_API_KEY");
  const res = await fetch(`https://api.quiverquant.com/beta/live/${type}/${ticker}`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  const data = await res.json();
  return new Response(JSON.stringify(data), { headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } });
});