import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { supabase } from "../_shared/supabase.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AnalysisRequest {
  mode: 'news' | 'chart';
  symbol: string;
  payload: any;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  const requestId = crypto.randomUUID();

  try {
    const { mode, symbol, payload }: AnalysisRequest = await req.json();
    
    if (!mode || !symbol || !payload) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }), 
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiApiKey) {
      throw new Error('OPENAI_API_KEY not configured');
    }

    let systemPrompt = '';
    let userPrompt = '';

    if (mode === 'news') {
      systemPrompt = `You are a financial AI analyst specializing in stock news analysis. Provide concise, factual analysis based ONLY on the provided news content. Never hallucinate ticker symbols or prices.`;
      
      userPrompt = `Analyze this news about ${symbol}:
Headline: ${payload.headline}
Content: ${payload.body || payload.summary || 'No content provided'}
Published: ${payload.published_at}

Provide a structured analysis with:
1. A 2-3 sentence summary
2. 3 key bullet points about drivers/risks/impact  
3. Relevant tags (e.g., earnings, guidance, ai)
4. Confidence score (0-1)

Be factual and avoid speculation beyond what's in the news.`;
    } else if (mode === 'chart') {
      systemPrompt = `You are a technical analysis AI expert. Analyze the provided price data and identify patterns, trends, and key levels. Be precise and factual.`;
      
      const candles = payload.candles || [];
      const lastCandle = candles[candles.length - 1];
      const firstCandle = candles[0];
      
      userPrompt = `Analyze the chart data for ${symbol}:
Time period: ${payload.interval || '1m'} 
Data points: ${candles.length}
Current price: ${lastCandle?.c || 'N/A'}
Period change: ${lastCandle && firstCandle ? ((lastCandle.c - firstCandle.c) / firstCandle.c * 100).toFixed(2) + '%' : 'N/A'}

Recent price action (last 5 candles):
${candles.slice(-5).map((c: any, i: number) => `${i+1}. ${c.t}: O:${c.o} H:${c.h} L:${c.l} C:${c.c} V:${c.v}`).join('\n')}

Provide structured analysis with:
1. 2-3 sentence technical summary
2. Key patterns/levels identified
3. Relevant technical tags
4. Confidence score (0-1)`;
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 500,
        temperature: 0.3
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    // Parse the AI response to extract structured data
    const lines = aiResponse.split('\n').filter((line: string) => line.trim());
    
    let summary = '';
    let rationale: string[] = [];
    let tags: string[] = [];
    let confidence = 0.7;

    // Extract summary (first few lines)
    summary = lines.slice(0, 3).join(' ').replace(/^\d+\.\s*/, '');

    // Extract bullet points/rationale
    const bulletPoints = lines.filter((line: string) => 
      line.includes('•') || line.includes('-') || line.match(/^\d+\./)
    );
    rationale = bulletPoints.slice(0, 3).map((point: string) => 
      point.replace(/^[•\-\d\.]\s*/, '').trim()
    );

    // Extract tags and confidence if mentioned
    const tagMatch = aiResponse.match(/tags?[:\s]+([^\.]+)/i);
    if (tagMatch) {
      tags = tagMatch[1].split(',').map((tag: string) => 
        tag.trim().toLowerCase().replace(/[^\w]/g, '')
      ).filter(Boolean).slice(0, 5);
    }

    const confMatch = aiResponse.match(/confidence[:\s]+([0-9\.]+)/i);
    if (confMatch) {
      confidence = parseFloat(confMatch[1]);
    }

    // Fallback values
    if (!summary) summary = 'Analysis completed based on provided data.';
    if (rationale.length === 0) rationale = ['Technical analysis shows current market conditions', 'Price action within expected ranges', 'Monitor for key level breaks'];
    if (tags.length === 0) tags = mode === 'chart' ? ['technical', 'price-action'] : ['news', 'fundamental'];

    const result = {
      symbol,
      mode,
      summary,
      rationale,
      tags,
      confidence: Math.min(Math.max(confidence, 0), 1) // Ensure 0-1 range
    };

    // Log to AI learning system
    try {
      await supabase.from('ai_learning_log').insert({
        user_id: null, // No auth required for public analysis
        ticker: symbol,
        mode,
        input: { symbol, payload },
        output: result
      });
    } catch (learningError) {
      console.warn('Failed to log AI learning data:', (learningError as Error).message);
    }

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    const latencyMs = Date.now() - startTime;
    
    // Log error to audit_logs
    await supabase.from('audit_logs').insert({
      function_name: 'ai-analysis',
      error_message: (error as Error).message,
      request_id: requestId,
      payload_hash: 'error',
      upstream_status: 500,
      latency_ms: latencyMs
    });

    console.error('Error in ai-analysis function:', error);
    
    return new Response(
      JSON.stringify({ error: 'Failed to generate AI analysis' }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});