import 'https://deno.land/x/xhr@0.1.0/mod.ts';
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/helpers.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const { symbol, window = '24h', mode = 'aggregate' } = await req.json();
    if (!symbol) throw new Error('symbol required');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch news from Finnhub
    const finnKey = Deno.env.get('FINNHUB_API_KEY');
    if (!finnKey) throw new Error('FINNHUB_API_KEY not configured');

    const fromDate = new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString().split('T')[0];
    const toDate = new Date().toISOString().split('T')[0];

    const newsRes = await fetch(
      `https://finnhub.io/api/v1/company-news?symbol=${symbol}&from=${fromDate}&to=${toDate}&token=${finnKey}`,
      { signal: AbortSignal.timeout(5000) }
    );

    if (!newsRes.ok) throw new Error('Failed to fetch news');

    const articles = await newsRes.json();
    if (!Array.isArray(articles) || articles.length === 0) {
      return new Response(JSON.stringify({
        symbol,
        mode,
        sentiment: 0,
        explanation: 'No recent news available',
        articles: []
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Call OpenAI for sentiment analysis
    const openaiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiKey) throw new Error('OPENAI_API_KEY not configured');

    let prompt = '';
    if (mode === 'story') {
      // Grade individual headline
      const headline = articles[0].headline;
      prompt = `Grade this ${symbol} news headline sentiment (-1 to 1):
"${headline}"

Consider:
- Bullish vs bearish language
- Magnitude of impact
- Credibility of source

Return JSON: { sentiment: number, explanation: string }`;
    } else {
      // Aggregate mode: summarize all headlines
      const headlines = articles.slice(0, 10).map((a: any) => a.headline).join('\n');
      prompt = `Analyze overall sentiment for ${symbol} from these headlines (-1 to 1):

${headlines}

Consider:
- Overall tone (bullish/bearish/neutral)
- Market context (Fed, earnings, macro events)
- Volume of coverage

Return JSON: { sentiment: number, explanation: string, key_themes: [] }`;
    }

    const aiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.3,
        max_tokens: 300,
        messages: [
          { role: 'system', content: 'You are a financial sentiment analyst. Return only valid JSON.' },
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
        sentiment: 0,
        explanation: 'Unable to analyze sentiment',
        key_themes: []
      };
    }

    // Log to ai_learning_log
    try {
      await supabase.from('ai_learning_log').insert({
        user_id: null,
        ticker: symbol,
        mode: 'ai-news',
        input: { symbol, window, mode, article_count: articles.length },
        output: analysis
      });
    } catch (e) {
      console.error('Failed to log learning data:', e);
    }

    return new Response(JSON.stringify({
      symbol,
      mode,
      sentiment: analysis.sentiment,
      explanation: analysis.explanation,
      key_themes: analysis.key_themes || [],
      articles: articles.slice(0, 5).map((a: any) => ({
        headline: a.headline,
        source: a.source,
        url: a.url,
        datetime: a.datetime
      })),
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (err) {
    console.error('ai-news error:', err);
    return new Response(JSON.stringify({ 
      error: err instanceof Error ? err.message : 'News analysis failed',
      sentiment: 0,
      articles: []
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});