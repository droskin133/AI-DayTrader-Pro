import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Expiring alerts that have passed their expiration date');
    
    const { data, error } = await supabase
      .from("alerts")
      .update({ status: "expired" })
      .lt("expires_at", new Date().toISOString())
      .eq("status", "active")
      .select();

    if (error) {
      console.error('Error expiring alerts:', error);
      
      // Log error
      await supabase.from('error_logs').insert({
        function_name: 'expire-alerts',
        error_message: error.message,
        metadata: { error: String(error) }
      });
      
      return new Response(
        JSON.stringify({ success: false, error: error.message }), 
        { 
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    const expiredCount = data?.length || 0;
    console.log(`Successfully expired ${expiredCount} alerts`);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        expired_count: expiredCount,
        timestamp: new Date().toISOString()
      }), 
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error('Unexpected error:', error);
    
    // Log error
    await supabase.from('error_logs').insert({
      function_name: 'expire-alerts',
      error_message: (error as Error).message,
      metadata: { error: String(error) }
    });
    
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }), 
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});