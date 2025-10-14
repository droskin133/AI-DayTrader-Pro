import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function evalCondition(condition: string, price: number): boolean {
  const match = condition.match(/^price\s*(<=|>=|<|>|==)\s*([0-9]*\.?[0-9]+)$/);
  if (!match) return false;
  
  const operator = match[1];
  const targetValue = Number(match[2]);
  
  switch (operator) {
    case '<=': return price <= targetValue;
    case '>=': return price >= targetValue;
    case '<': return price < targetValue;
    case '>': return price > targetValue;
    case '==': return price === targetValue;
    default: return false;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  try {
    // Get all active alerts
    const { data: alerts } = await supabase
      .from('alerts')
      .select('*')
      .eq('is_active', true);

    let triggeredCount = 0;

    // Check each alert against current market data
    for (const alert of alerts ?? []) {
      const { data: marketData } = await supabase
        .from('market_data')
        .select('*')
        .eq('symbol', alert.symbol)
        .maybeSingle();

      if (marketData && evalCondition(alert.condition, marketData.last_trade_price)) {
        await supabase
          .from('alerts')
          .update({
            is_active: false,
            created_at: new Date().toISOString()
          })
          .eq('id', alert.id);
        
        triggeredCount++;
      }
    }

    return new Response(
      JSON.stringify({ success: true, triggered: triggeredCount }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (e) {
    await supabase.from('error_logs').insert({
      context: 'check-alerts',
      payload: { error: e instanceof Error ? e.message : String(e) },
      created_at: new Date().toISOString()
    });
    
    return new Response(
      JSON.stringify({ error: 'Failed to process alerts' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
