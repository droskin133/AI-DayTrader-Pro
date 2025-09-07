import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(Deno.env.get("SUPABASE_URL"), Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"));

serve(async () => {
  await supabase.from("alerts").update({ status: "expired" }).lt("expires_at", new Date().toISOString());
  return new Response(JSON.stringify({ success: true }), { headers: { "Content-Type": "application/json" } });
});