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

    // AI analysis for gap down risk
    const prompt = `Analyze ${symbol} for gap down risk factors:
    1. Technical breakdown patterns
    2. Negative sentiment indicators
    3. Volume erosion signs
    4. Support level violations
    
    Return a risk score 1-100 and brief explanation.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a technical analysis expert. Provide concise risk assessments.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 150,
        temperature: 0.3,
      }),
    });

    const aiData = await response.json();
    const analysis = aiData.choices[0].message.content;
    
    // Extract risk score (simple pattern matching)
    const riskMatch = analysis.match(/(\d+)/);
    const riskScore = riskMatch ? parseInt(riskMatch[1]) : 50;

    // Insert flag
    const { data, error } = await supabase
      .from('ai_auto_flags')
      .insert({
        user_id,
        symbol,
        event_type: 'gap_down_risk',
        explanation: analysis,
        risk_score: riskScore,
        metadata: { analysis_type: 'technical_breakdown' }
      })
      .select()
      .single();

    if (error) throw error;

    return new Response(
      JSON.stringify({ flag_id: data.id, risk_score: riskScore, analysis }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in auto-flag-gap-down:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to analyze gap down risk' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});