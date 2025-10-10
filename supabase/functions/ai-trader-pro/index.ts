import 'https://deno.land/x/xhr@0.1.0/mod.ts';
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/helpers.ts';

interface AIAnalysisResult {
  symbol: string;
  price: number;
  change_percent: number;
  confidence: number;
  signal: 'bullish' | 'bearish' | 'neutral';
  reasoning: string;
  catalyst: string;
  risk_level: 'low' | 'medium' | 'high';
  news_sentiment: number;
  institutional_flow: string;
  technical_summary: string;
  timestamp: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const { symbol, timeframe = '1D' } = await req.json();
    
    if (!symbol) {
      throw new Error('Symbol is required');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const openaiKey = Deno.env.get('OPENAI_API_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 1. Get live price data
    const { data: priceResult, error: priceError } = await supabase.functions.invoke('live-stock-price', {
      body: { symbols: [symbol] }
    });

    if (priceError || !priceResult || priceResult.length === 0) {
      throw new Error('Failed to fetch price data');
    }

    const priceData = priceResult[0];

    // 2. Get recent news with sentiment
    const { data: newsData } = await supabase
      .from('news_events')
      .select('*')
      .ilike('tickers', `%${symbol}%`)
      .order('published_at', { ascending: false })
      .limit(5);

    // 3. Get institutional signals
    const { data: institutionalData } = await supabase
      .from('ai_institutional_signals')
      .select('*')
      .eq('ticker', symbol)
      .order('created_at', { ascending: false })
      .limit(3);

    // 4. Get insider/congress trades
    const { data: insiderData } = await supabase
      .from('insider_trades')
      .select('*')
      .eq('ticker', symbol)
      .order('ingested_at', { ascending: false })
      .limit(3);

    const { data: congressData } = await supabase
      .from('congress_trades')
      .select('*')
      .eq('ticker', symbol)
      .order('ingested_at', { ascending: false })
      .limit(3);

    // 5. Calculate news sentiment
    const avgSentiment = newsData && newsData.length > 0
      ? newsData.reduce((acc, n) => {
          const score = n.sentiment === 'positive' ? 1 : n.sentiment === 'negative' ? -1 : 0;
          return acc + score;
        }, 0) / newsData.length
      : 0;

    // 6. Analyze institutional flow
    const institutionalFlow = institutionalData && institutionalData.length > 0
      ? institutionalData[0].signal_type || 'neutral'
      : 'neutral';

    // 7. Build AI prompt
    const prompt = `You are an expert financial analyst. Analyze this stock:

Symbol: ${symbol}
Current Price: $${priceData.price}
Change: ${priceData.changePercent}%

Recent News Headlines:
${newsData?.map(n => `- ${n.headline} (${n.sentiment})`).join('\n') || 'No recent news'}

Institutional Signals:
${institutionalData?.map(i => `- ${i.signal_type}: ${i.details}`).join('\n') || 'No institutional signals'}

Insider Activity:
${insiderData?.map(i => `- ${i.transaction_type} by ${i.person}`).join('\n') || 'No insider trades'}

Congress Trades:
${congressData?.map(c => `- ${c.transaction_type} by ${c.person} (${c.chamber})`).join('\n') || 'No congress trades'}

Provide a concise analysis with:
1. Signal (bullish/bearish/neutral)
2. Confidence (0-1)
3. Reasoning (2-3 sentences)
4. Key catalyst
5. Risk level (low/medium/high)
6. Technical summary

Format as JSON:
{
  "signal": "bullish|bearish|neutral",
  "confidence": 0.0-1.0,
  "reasoning": "...",
  "catalyst": "...",
  "risk_level": "low|medium|high",
  "technical_summary": "..."
}`;

    // 8. Call OpenAI
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a financial analyst. Always respond with valid JSON.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      throw new Error(`OpenAI API error: ${openaiResponse.status} ${errorText}`);
    }

    const openaiData = await openaiResponse.json();
    const aiContent = openaiData.choices[0].message.content;
    
    // Parse AI response
    let aiAnalysis;
    try {
      aiAnalysis = JSON.parse(aiContent);
    } catch {
      aiAnalysis = {
        signal: 'neutral',
        confidence: 0.5,
        reasoning: aiContent,
        catalyst: 'Analysis in progress',
        risk_level: 'medium',
        technical_summary: 'See reasoning'
      };
    }

    // 9. Build final response
    const result: AIAnalysisResult = {
      symbol: symbol.toUpperCase(),
      price: priceData.price,
      change_percent: priceData.changePercent,
      confidence: aiAnalysis.confidence || 0.5,
      signal: aiAnalysis.signal || 'neutral',
      reasoning: aiAnalysis.reasoning || 'Analysis unavailable',
      catalyst: aiAnalysis.catalyst || 'Market dynamics',
      risk_level: aiAnalysis.risk_level || 'medium',
      news_sentiment: avgSentiment,
      institutional_flow: institutionalFlow,
      technical_summary: aiAnalysis.technical_summary || 'Technical analysis in progress',
      timestamp: new Date().toISOString()
    };

    // 10. Log to ai_learning_log
    await supabase.from('ai_learning_log').insert({
      ticker: symbol.toUpperCase(),
      mode: 'trader-pro',
      input_text: `Analysis for ${symbol}`,
      input: { symbol, timeframe },
      output: result
    });

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('AI Trader Pro error:', error);
    
    // Log error
    try {
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
      );
      
      await supabase.from('error_logs').insert({
        function_name: 'ai-trader-pro',
        error_message: error instanceof Error ? error.message : 'Unknown error',
        metadata: { error: String(error) }
      });
    } catch {}
    
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});