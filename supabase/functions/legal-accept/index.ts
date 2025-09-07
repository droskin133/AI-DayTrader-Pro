import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(Deno.env.get("SUPABASE_URL"), Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"));

serve(async (req) => {
  const { userId, acceptedAt } = await req.json();
  await supabase.from("user_settings").upsert({ user_id: userId, legal_accept: acceptedAt });
  return new Response(JSON.stringify({ success: true }), { headers: { "Content-Type": "application/json" } });
});