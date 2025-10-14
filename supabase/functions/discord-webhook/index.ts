import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const DISCORD_BOT_TOKEN = Deno.env.get("DISCORD_BOT_TOKEN");

  try {
    if (!DISCORD_BOT_TOKEN) {
      throw new Error('DISCORD_BOT_TOKEN not configured');
    }

    const { user_id, discord_id } = await req.json();

    // Get user role
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user_id)
      .single();

    if (!roleData) {
      throw new Error('User role not found');
    }

    // Sync role with Discord
    const roleId = roleData.role === 'premium' ? Deno.env.get("DISCORD_PREMIUM_ROLE_ID") : null;

    if (roleId && discord_id) {
      const response = await fetch(
        `https://discord.com/api/v10/guilds/${Deno.env.get("DISCORD_GUILD_ID")}/members/${discord_id}/roles/${roleId}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bot ${DISCORD_BOT_TOKEN}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Discord API error: ${response.status}`);
      }
    }

    return new Response(
      JSON.stringify({ status: 'ok', role: roleData.role }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    await supabase.from('error_logs').insert({
      context: 'discord-webhook',
      payload: { error: error instanceof Error ? error.message : String(error) },
      created_at: new Date().toISOString()
    });

    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
