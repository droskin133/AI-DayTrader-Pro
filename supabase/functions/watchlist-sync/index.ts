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

  try {
    const { action, user_id, symbol } = await req.json();

    if (!action || !user_id || !symbol) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    if (action === 'add') {
      const { error } = await supabase
        .from('watchlist')
        .insert({ user_id, symbol });
      
      if (error) throw error;
    } else if (action === 'remove') {
      const { error } = await supabase
        .from('watchlist')
        .delete()
        .eq('user_id', user_id)
        .eq('symbol', symbol);
      
      if (error) throw error;
    } else {
      return new Response(
        JSON.stringify({ error: 'Invalid action' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (e) {
    await supabase.from('error_logs').insert({
      function: 'watchlist-sync',
      message: String(e),
      payload: { error: e instanceof Error ? e.message : String(e) }
    });
    
    return new Response(
      JSON.stringify({ error: 'Failed to sync watchlist' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
