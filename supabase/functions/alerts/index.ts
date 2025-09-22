import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { supabase } from "../_shared/supabase.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AlertRequest {
  user_id: string;
  ticker: string;
  condition: string;
  notify: {
    in_app: boolean;
    discord: boolean;
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  const requestId = crypto.randomUUID();

  try {
    const { user_id, ticker, condition, notify }: AlertRequest = await req.json();
    
    if (!user_id || !ticker || !condition) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }), 
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Insert the alert into user_alerts table
    const { data: alert, error: alertError } = await supabase
      .from('user_alerts')
      .insert({
        user_id,
        ticker: ticker.toUpperCase(),
        condition,
        notify_in_app: notify.in_app || true,
        notify_discord: notify.discord || false,
        is_active: true
      })
      .select()
      .single();

    if (alertError) {
      throw new Error(`Failed to create alert: ${alertError.message}`);
    }

    // Send Discord notification if requested
    if (notify.discord) {
      const discordWebhookUrl = Deno.env.get("DISCORD_WEBHOOK_URL");
      if (discordWebhookUrl) {
        try {
          const discordMessage = {
            content: `🚨 **New Alert Created**\n\n**Ticker:** ${ticker}\n**Condition:** ${condition}\n**User:** ${user_id}\n**Time:** ${new Date().toISOString()}`
          };

          await fetch(discordWebhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(discordMessage)
          });
        } catch (discordError) {
          console.error('Discord notification failed:', discordError);
          // Don't fail the alert creation if Discord fails
        }
      }
    }

    const result = {
      id: alert.id,
      status: 'active'
    };

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    const latencyMs = Date.now() - startTime;
    
    // Log error to audit_logs
    await supabase.from('audit_logs').insert({
      function_name: 'alerts',
      error_message: error.message,
      request_id: requestId,
      payload_hash: 'error',
      upstream_status: 500,
      latency_ms: latencyMs
    });

    console.error('Error in alerts function:', error);
    
    return new Response(
      JSON.stringify({ error: 'Failed to create alert' }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});