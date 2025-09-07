import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

serve(async (req) => {
  const { ticker } = await req.json();
  const apiKey = Deno.env.get("POLYGON_API_KEY");

  const res = await fetch(`https://api.polygon.io/v2/aggs/ticker/${ticker}/prev?apiKey=${apiKey}`);
  const data = await res.json();

  return new Response(JSON.stringify(data), { headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } });
});