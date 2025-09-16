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
    const { userId, legalTextId } = await req.json();
    
    if (!userId || !legalTextId) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing userId or legalTextId' }), 
        { 
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    console.log(`Recording legal acceptance for user ${userId}, legal text ${legalTextId}`);

    const { error } = await supabase
      .from("legal_acceptances")
      .insert({
        user_id: userId,
        legal_text_id: legalTextId
      });

    if (error) {
      console.error('Error recording legal acceptance:', error);
      return new Response(
        JSON.stringify({ success: false, error: error.message }), 
        { 
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    console.log('Successfully recorded legal acceptance');
    return new Response(
      JSON.stringify({ success: true }), 
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }), 
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});