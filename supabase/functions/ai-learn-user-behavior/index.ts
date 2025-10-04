import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/helpers.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { user_id, event_type, payload } = await req.json();

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Log the event
    await supabase.from("user_event_log").insert({
      user_id,
      event_type,
      symbol: payload?.symbol || null,
      payload
    });

    await supabase.from("audit_log").insert({
      action: "ai-learn.log",
      meta: { user_id, event_type }
    });

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error('Error in ai-learn-user-behavior:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to learn user behavior' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});