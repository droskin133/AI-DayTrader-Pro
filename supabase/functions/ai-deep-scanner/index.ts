import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

serve(async (req) => {
  const { tickers } = await req.json();
  return new Response(JSON.stringify({ overlays: [], suggestions: [`Scanned ${tickers?.join(", ")}`] }), {
    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
  });
});