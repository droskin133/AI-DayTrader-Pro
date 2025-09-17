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
    const { user_id } = await req.json();

    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

    // Get recent user events
    const { data: events, error: eventsError } = await supabase
      .from('user_event_log')
      .select('*')
      .eq('user_id', user_id)
      .order('timestamp', { ascending: false })
      .limit(50);

    if (eventsError) throw eventsError;

    if (events.length === 0) {
      return new Response(
        JSON.stringify({ profile_updated: false, message: 'No events to analyze' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Analyze user behavior patterns
    const eventSummary = events.map(e => `${e.event_type}: ${e.symbol || 'N/A'}`).join('; ');
    
    const prompt = `Analyze this user's trading behavior: ${eventSummary}
    
    Extract:
    1. Preferred sectors
    2. Alert style (aggressive/conservative)
    3. AI opinion preference
    
    Return JSON with: {"preferred_sector": "tech", "alert_style": "aggressive", "ai_opinion": "bullish"}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a behavioral analysis expert. Return valid JSON only.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 150,
        temperature: 0.3,
      }),
    });

    const aiData = await response.json();
    let profile;
    
    try {
      profile = JSON.parse(aiData.choices[0].message.content);
    } catch {
      // Fallback profile
      profile = {
        preferred_sector: 'technology',
        alert_style: 'balanced',
        ai_opinion: 'neutral'
      };
    }

    // Update user AI profile
    const { error: profileError } = await supabase
      .from('user_ai_profiles')
      .upsert({
        user_id,
        preferred_sector: profile.preferred_sector,
        alert_style: profile.alert_style,
        ai_opinion: profile.ai_opinion,
        notes: `Updated based on ${events.length} recent events`,
        updated_at: new Date().toISOString()
      });

    if (profileError) throw profileError;

    return new Response(
      JSON.stringify({ 
        profile_updated: true, 
        profile,
        events_analyzed: events.length 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in ai-learn-user-behavior:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to learn user behavior' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});