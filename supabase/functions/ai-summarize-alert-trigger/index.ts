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
    const { alert_id, user_id, symbol, trigger_data } = await req.json();

    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

    // Get alert details
    const { data: alert, error: alertError } = await supabase
      .from('user_alerts')
      .select('*')
      .eq('id', alert_id)
      .single();

    if (alertError) throw alertError;

    // AI summary of why alert triggered
    const prompt = `Summarize why this alert triggered:
    
    Alert: ${alert.condition_text}
    Symbol: ${symbol}
    Trigger Data: ${JSON.stringify(trigger_data)}
    
    Provide a concise explanation of what market conditions caused this alert to fire.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a trading alert analyst. Provide clear, concise explanations.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 150,
        temperature: 0.3,
      }),
    });

    const aiData = await response.json();
    const summary = aiData.choices[0].message.content;

    // Insert audit log
    const { data: auditLog, error: auditError } = await supabase
      .from('user_alert_audit_log')
      .insert({
        alert_id,
        user_id,
        symbol,
        fired_at: new Date().toISOString(),
        event_json: {
          trigger_data,
          ai_summary: summary,
          alert_condition: alert.condition_text
        }
      })
      .select()
      .single();

    if (auditError) throw auditError;

    return new Response(
      JSON.stringify({ 
        audit_id: auditLog.id,
        summary,
        alert_condition: alert.condition_text
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in ai-summarize-alert-trigger:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to summarize alert trigger' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});