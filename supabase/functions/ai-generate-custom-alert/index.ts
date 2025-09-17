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
    const { user_id, symbol, prompt } = await req.json();

    if (!user_id || !symbol || !prompt) {
      return new Response(
        JSON.stringify({ error: 'user_id, symbol, and prompt are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

    // Generate alert conditions using AI
    const aiPrompt = `Based on this user request: "${prompt}" for stock ${symbol}, generate a specific alert condition. Return only a clear, actionable alert condition text (e.g., "Price drops below $150" or "Volume exceeds 2x daily average").`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a trading alert system. Generate clear, specific alert conditions.' },
          { role: 'user', content: aiPrompt }
        ],
        max_tokens: 100,
        temperature: 0.7,
      }),
    });

    const aiData = await response.json();
    const alertCondition = aiData.choices[0].message.content.trim();

    // Insert into user_alerts
    const { data: alertData, error: alertError } = await supabase
      .from('user_alerts')
      .insert({
        user_id,
        symbol,
        alert_type: 'custom',
        condition_text: alertCondition,
        active: true
      })
      .select()
      .single();

    if (alertError) throw alertError;

    // Also insert into ai_auto_generated_alerts for tracking
    const { error: aiAlertError } = await supabase
      .from('ai_auto_generated_alerts')
      .insert({
        user_id,
        symbol,
        alert_text: `Custom Alert: ${alertCondition}`,
        trigger_context: { original_prompt: prompt },
        status: 'active'
      });

    if (aiAlertError) throw aiAlertError;

    return new Response(
      JSON.stringify({
        alert_id: alertData.id,
        status: 'created',
        summary: `Alert created for ${symbol} with custom conditions`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in ai-generate-custom-alert:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to generate custom alert' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});