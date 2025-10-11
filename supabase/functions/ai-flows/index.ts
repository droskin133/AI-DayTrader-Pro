import 'https://deno.land/x/xhr@0.1.0/mod.ts';
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/helpers.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const { symbol } = await req.json();
    if (!symbol) throw new Error('symbol required');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch institutional/insider flows from Quiver
    const quiverKey = Deno.env.get('QUIVER_API_KEY');
    let flows: any = {
      congressional: [],
      institutional: [],
      insider: []
    };

    if (quiverKey) {
      try {
        // Congressional trades
        const congressRes = await fetch(
          `https://api.quiverquant.com/beta/historical/congresstrading/${symbol}`,
          {
            headers: { 'Authorization': `Bearer ${quiverKey}` },
            signal: AbortSignal.timeout(5000)
          }
        );
        if (congressRes.ok) {
          const congressData = await congressRes.json();
          flows.congressional = Array.isArray(congressData) ? congressData.slice(0, 10).map((t: any) => ({
            date: t.TransactionDate,
            member: t.Representative,
            transaction: t.Transaction,
            amount: t.Amount,
            source: 'quiver'
          })) : [];
        }

        // Institutional holdings
        const instRes = await fetch(
          `https://api.quiverquant.com/beta/bulk/institutional/${symbol}`,
          {
            headers: { 'Authorization': `Bearer ${quiverKey}` },
            signal: AbortSignal.timeout(5000)
          }
        );
        if (instRes.ok) {
          const instData = await instRes.json();
          flows.institutional = Array.isArray(instData) ? instData.slice(0, 10).map((h: any) => ({
            holder: h.Holder,
            shares: h.Shares,
            value: h.Value,
            change: h.ChangeInShares,
            source: 'quiver'
          })) : [];
        }

        // Insider trades
        const insiderRes = await fetch(
          `https://api.quiverquant.com/beta/historical/insidertrading/${symbol}`,
          {
            headers: { 'Authorization': `Bearer ${quiverKey}` },
            signal: AbortSignal.timeout(5000)
          }
        );
        if (insiderRes.ok) {
          const insiderData = await insiderRes.json();
          flows.insider = Array.isArray(insiderData) ? insiderData.slice(0, 10).map((t: any) => ({
            date: t.TransactionDate,
            insider: t.Insider,
            transaction: t.Transaction,
            shares: t.Qty,
            price: t.Price,
            source: 'quiver'
          })) : [];
        }
      } catch (e) {
        console.error('Quiver API error:', e);
      }
    }

    // If no Quiver data, check DB tables
    if (flows.congressional.length === 0) {
      const { data: congressData } = await supabase
        .from('congress_trades')
        .select('*')
        .eq('ticker', symbol)
        .order('reported_date', { ascending: false })
        .limit(10);
      
      flows.congressional = (congressData || []).map((t: any) => ({
        date: t.reported_date,
        member: t.person,
        transaction: t.transaction_type,
        amount: t.amount_range,
        source: 'database'
      }));
    }

    if (flows.institutional.length === 0) {
      const { data: instData } = await supabase
        .from('institutional_ownership')
        .select('*')
        .eq('ticker', symbol)
        .order('reported_date', { ascending: false })
        .limit(10);
      
      flows.institutional = (instData || []).map((h: any) => ({
        holder: h.holder_name,
        shares: h.shares,
        value: h.value,
        change: h.change_in_shares,
        source: 'database'
      }));
    }

    // Call OpenAI for flow analysis
    const openaiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiKey) throw new Error('OPENAI_API_KEY not configured');

    const prompt = `Analyze institutional flow data for ${symbol}:

Congressional: ${flows.congressional.length} trades
Institutional: ${flows.institutional.length} holders
Insider: ${flows.insider.length} trades

Recent congressional: ${flows.congressional.slice(0, 3).map((t: any) => 
  `${t.member} ${t.transaction} ${t.amount}`
).join('; ')}

Identify:
1. Flow direction (accumulation/distribution)
2. Notable large holders or trades
3. Insider sentiment
4. Signal strength (0-1)

Return JSON: { direction, signal_strength, notable_activity: [], recommendation }`;

    const aiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.2,
        max_tokens: 400,
        messages: [
          { role: 'system', content: 'You are an institutional flow analyst. Return only valid JSON.' },
          { role: 'user', content: prompt }
        ]
      })
    });

    if (!aiRes.ok) throw new Error(`OpenAI error: ${aiRes.status}`);

    const aiData = await aiRes.json();
    let analysis: any = null;
    try {
      analysis = JSON.parse(aiData.choices[0].message.content);
    } catch {
      analysis = {
        direction: 'neutral',
        signal_strength: 0.5,
        notable_activity: [],
        recommendation: 'insufficient data'
      };
    }

    // Log to ai_learning_log
    try {
      await supabase.from('ai_learning_log').insert({
        user_id: null,
        ticker: symbol,
        mode: 'ai-flows',
        input: { 
          symbol, 
          congressional_count: flows.congressional.length,
          institutional_count: flows.institutional.length,
          insider_count: flows.insider.length
        },
        output: analysis
      });
    } catch (e) {
      console.error('Failed to log learning data:', e);
    }

    return new Response(JSON.stringify({
      symbol,
      flows,
      analysis,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (err) {
    // Log error to error_logs
    try {
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );
      
      await supabase.from('error_logs').insert({
        function_name: 'ai-flows',
        error_message: err instanceof Error ? err.message : 'Flow analysis failed',
        metadata: { error: String(err) }
      });
    } catch {}
    
    return new Response(JSON.stringify({ 
      error: err instanceof Error ? err.message : 'Flow analysis failed',
      flows: { congressional: [], institutional: [], insider: [] }
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});