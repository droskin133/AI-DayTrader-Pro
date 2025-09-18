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
    const { prompt, tickers } = await req.json();
    const apiKey = Deno.env.get("OPENAI_API_KEY");

    if (!apiKey) {
      console.error('OpenAI API key not found');
      return new Response(JSON.stringify({ 
        error: "AI service not configured",
        suggestions: ["AI Deep Scanner temporarily unavailable"],
        overlays: []
      }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Processing deep scan for tickers: ${tickers?.join(', ')}`);
    console.log(`User prompt: ${prompt}`);

    const scanPrompt = `
    Analyze the following stocks for trading opportunities: ${tickers?.join(', ')}
    
    User request: ${prompt || 'General market analysis'}
    
    Provide specific trading insights including:
    1. Key support and resistance levels
    2. Technical patterns identified
    3. Risk factors to consider
    4. Potential entry/exit points
    
    Return actionable trading suggestions based on current market conditions.
    `;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { 
            role: "system", 
            content: "You are an expert stock market analyst. Provide concise, actionable trading insights." 
          },
          { role: "user", content: scanPrompt }
        ],
        max_tokens: 500,
        temperature: 0.7
      }),
    });

    if (!response.ok) {
      console.error(`OpenAI API error: ${response.status} ${response.statusText}`);
      throw new Error(`AI service error: ${response.status}`);
    }

    const data = await response.json();
    const analysis = data.choices?.[0]?.message?.content || "No analysis available";

    // Parse the analysis into suggestions and overlays
    const suggestions = [analysis];
    const overlays = tickers?.map((ticker: string) => ({
      ticker,
      type: "analysis",
      data: { summary: `AI analysis for ${ticker}` }
    })) || [];

    console.log(`Deep scan completed for ${tickers?.length || 0} tickers`);

    return new Response(JSON.stringify({ 
      suggestions, 
      overlays 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error('AI Deep Scanner error:', error);
    return new Response(JSON.stringify({ 
      error: "Analysis temporarily unavailable",
      suggestions: ["AI Deep Scanner is experiencing issues. Please try again later."],
      overlays: []
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});