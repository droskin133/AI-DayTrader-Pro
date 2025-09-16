import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { ticker } = await req.json();

    if (!ticker) {
      return new Response(
        JSON.stringify({ error: 'Ticker symbol is required' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const prompt = `Generate 3-5 intelligent alert suggestions for ${ticker} stock. Each suggestion should be:
    1. Specific and actionable
    2. Based on common technical or fundamental indicators
    3. Realistic and achievable
    
    Format as JSON array with each alert having:
    - condition: Clear alert condition (e.g., "Price drops below $150")
    - reason: Brief explanation (1-2 sentences)
    - confidence: Number 1-100 representing likelihood of relevance
    
    Focus on:
    - Support/resistance levels
    - Technical indicators (RSI, MACD, moving averages)
    - Volume patterns
    - Earnings-related events
    - Price targets`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a professional trading analyst specializing in creating intelligent stock alerts. Always respond with valid JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 500,
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    let alertsContent = data.choices[0].message.content;

    try {
      // Try to parse as JSON
      const suggestions = JSON.parse(alertsContent);
      
      // Add unique IDs to each suggestion
      const suggestionsWithIds = suggestions.map((suggestion: any, index: number) => ({
        id: `${ticker}-${Date.now()}-${index}`,
        ...suggestion
      }));

      return new Response(
        JSON.stringify({ suggestions: suggestionsWithIds }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    } catch (parseError) {
      // If parsing fails, create fallback suggestions
      const fallbackSuggestions = [
        {
          id: `${ticker}-${Date.now()}-1`,
          condition: `${ticker} price breaks above recent high`,
          reason: "Breakout above resistance could signal continued upward momentum.",
          confidence: 75
        },
        {
          id: `${ticker}-${Date.now()}-2`,
          condition: `${ticker} RSI drops below 30`,
          reason: "Oversold condition might present a buying opportunity.",
          confidence: 70
        },
        {
          id: `${ticker}-${Date.now()}-3`,
          condition: `${ticker} volume exceeds 2x daily average`,
          reason: "High volume can indicate significant price movement incoming.",
          confidence: 80
        }
      ];

      return new Response(
        JSON.stringify({ suggestions: fallbackSuggestions }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

  } catch (error) {
    console.error('Error in ai-alert-suggestions function:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to generate alert suggestions' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});