import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

serve(async (req) => {
  const { type, ticker } = await req.json();
  const apiKey = Deno.env.get("FINNHUB_API_KEY");
  const url = type === "news"
    ? `https://finnhub.io/api/v1/company-news?symbol=${ticker}&from=2024-01-01&to=2024-12-31&token=${apiKey}`
    : `https://finnhub.io/api/v1/quote?symbol=${ticker}&token=${apiKey}`;

  const res = await fetch(url);
  const data = await res.json();

  return new Response(JSON.stringify(data), { headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } });
});