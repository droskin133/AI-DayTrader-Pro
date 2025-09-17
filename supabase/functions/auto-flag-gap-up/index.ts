import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { user_id, symbol } = await req.json();

    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

    // AI analysis for gap up potential
    const prompt = `Analyze ${symbol} for gap up potential:
    1. Bullish breakout patterns
    2. Positive sentiment catalysts
    3. Volume accumulation
    4. Resistance breakthrough signals
    
    Return a potential score 1-100 and brief explanation.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a technical analysis expert. Focus on bullish signals and breakout potential.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 150,
        temperature: 0.3,
      }),
    });

    const aiData = await response.json();
    const analysis = aiData.choices[0].message.content;
    
    // Extract potential score
    const scoreMatch = analysis.match(/(\d+)/);
    const potentialScore = scoreMatch ? parseInt(scoreMatch[1]) : 50;

    // Insert flag
    const { data, error } = await supabase
      .from('ai_auto_flags')
      .insert({
        user_id,
        symbol,
        event_type: 'gap_up_potential',
        explanation: analysis,
        risk_score: potentialScore,
        metadata: { analysis_type: 'bullish_breakout' }
      })
      .select()
      .single();

    if (error) throw error;

    return new Response(
      JSON.stringify({ flag_id: data.id, potential_score: potentialScore, analysis }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in auto-flag-gap-up:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to analyze gap up potential' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});