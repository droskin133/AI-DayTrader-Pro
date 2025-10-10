import React, { useState, useEffect } from 'react';
import { Brain, TrendingUp, TrendingDown, AlertTriangle, ThumbsUp, ThumbsDown, Loader2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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

export const AITraderPro: React.FC<{ ticker?: string }> = ({ ticker = 'AAPL' }) => {
  const [result, setResult] = useState<AIAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (ticker) {
      analyze();
    }

    // Real-time subscriptions
    const channel = supabase
      .channel('ai-trader-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'stock_prices', filter: `ticker=eq.${ticker}` }, () => {
        if (!loading) analyze();
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'news_events' }, () => {
        if (!loading) analyze();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ai_institutional_signals', filter: `ticker=eq.${ticker}` }, () => {
        if (!loading) analyze();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [ticker]);

  const analyze = async () => {
    setLoading(true); 
    setError(null); 
    setResult(null);
    setFeedbackSubmitted(false);
    
    const startTime = Date.now();
    
    try {
      const { data, error: invokeError } = await supabase.functions.invoke('ai-trader-pro', { 
        body: { symbol: ticker, timeframe: '1D' } 
      });
      
      if (invokeError) throw invokeError;
      
      const latency = Date.now() - startTime;
      
      // Log to ai_run_metrics
      await supabase.from('ai_run_metrics').insert({
        ticker: ticker.toUpperCase(),
        mode: 'analysis',
        latency_ms: latency,
        upstream_status: 200
      });
      
      setResult(data);
      
      toast({
        title: "Analysis Complete",
        description: `AI analysis for ${ticker} is ready`,
      });
    } catch (e: any) { 
      const msg = e?.message || 'AI analysis failed';
      setError(msg);
      
      // Log error
      await supabase.from('error_logs').insert({
        function_name: 'ai-trader-pro',
        error_message: msg,
        metadata: { ticker }
      });
      
      toast({
        title: "Analysis Failed",
        description: msg,
        variant: "destructive",
      });
    } finally { 
      setLoading(false); 
    }
  };

  const submitFeedback = async (positive: boolean) => {
    if (!result) return;
    
    try {
      await supabase.from('ai_feedback').insert({
        prompt: `AI Trader Pro analysis for ${ticker}`,
        response: JSON.stringify(result),
        thumbs_up: positive,
        feature: 'ai-trader-pro',
        score: positive ? 1 : 0
      });

      setFeedbackSubmitted(true);

      toast({
        title: "Feedback Submitted",
        description: "Thank you for helping us improve!",
      });
    } catch (e) {
      console.error('Failed to submit feedback:', e);
      toast({
        title: "Error",
        description: "Failed to submit feedback",
        variant: "destructive"
      });
    }
  };

  const getSignalColor = (signal: string) => {
    switch(signal) {
      case 'bullish': return 'text-green-600 bg-green-50 border-green-200 dark:bg-green-950 dark:text-green-400';
      case 'bearish': return 'text-red-600 bg-red-50 border-red-200 dark:bg-red-950 dark:text-red-400';
      default: return 'text-gray-600 bg-gray-50 border-gray-200 dark:bg-gray-950 dark:text-gray-400';
    }
  };

  const getRiskColor = (risk: string) => {
    switch(risk) {
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-400';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-400';
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-950 dark:text-gray-400';
    }
  };

  return (
    <Card className="widget-container">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Brain className="h-5 w-5 text-primary" />
            <span>AI Trader Pro</span>
            <Badge variant="outline">{ticker}</Badge>
          </div>
          <Button onClick={analyze} disabled={loading} size="sm">
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="ml-2">Analyzing...</span>
              </>
            ) : (
              <>
                <TrendingUp className="h-4 w-4" />
                <span className="ml-2">Generate</span>
              </>
            )}
          </Button>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        {error && (
          <div className="flex items-center space-x-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg mb-4">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <span className="text-sm text-destructive">{error}</span>
          </div>
        )}

        {result && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold">{result.symbol}</h3>
                <p className="text-sm text-muted-foreground">
                  ${result.price?.toFixed(2)} 
                  <span className={result.change_percent >= 0 ? 'text-green-600 ml-2' : 'text-red-600 ml-2'}>
                    ({result.change_percent >= 0 ? '+' : ''}{result.change_percent?.toFixed(2)}%)
                  </span>
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={getSignalColor(result.signal)} variant="outline">
                  {result.signal === 'bullish' ? (
                    <TrendingUp className="h-4 w-4 mr-1" />
                  ) : result.signal === 'bearish' ? (
                    <TrendingDown className="h-4 w-4 mr-1" />
                  ) : null}
                  {result.signal?.toUpperCase()}
                </Badge>
                <Badge className={getRiskColor(result.risk_level)}>
                  Risk: {result.risk_level}
                </Badge>
              </div>
            </div>

            <Separator />

            <div className="grid gap-3">
              <div>
                <h4 className="font-semibold mb-1">AI Confidence</h4>
                <div className="flex items-center gap-2">
                  <Progress value={result.confidence * 100} className="flex-1" />
                  <span className="text-sm font-medium">{(result.confidence * 100).toFixed(0)}%</span>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-1">AI Reasoning</h4>
                <p className="text-sm text-muted-foreground">{result.reasoning}</p>
              </div>

              {result.catalyst && (
                <div>
                  <h4 className="font-semibold mb-1">Key Catalyst</h4>
                  <p className="text-sm text-muted-foreground">{result.catalyst}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-1 text-sm">News Sentiment</h4>
                  <p className="text-sm">
                    <span className={result.news_sentiment >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {result.news_sentiment >= 0 ? 'Positive' : 'Negative'} ({result.news_sentiment?.toFixed(2)})
                    </span>
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-1 text-sm">Institutional Flow</h4>
                  <p className="text-sm text-muted-foreground">{result.institutional_flow}</p>
                </div>
              </div>

              {result.technical_summary && (
                <div>
                  <h4 className="font-semibold mb-1">Technical Summary</h4>
                  <p className="text-sm text-muted-foreground">{result.technical_summary}</p>
                </div>
              )}
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Analysis generated at {new Date(result.timestamp).toLocaleString()}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => submitFeedback(true)}
                  disabled={feedbackSubmitted}
                  className="flex items-center gap-1"
                >
                  <ThumbsUp className="h-3 w-3" />
                  Accurate
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => submitFeedback(false)}
                  disabled={feedbackSubmitted}
                  className="flex items-center gap-1"
                >
                  <ThumbsDown className="h-3 w-3" />
                  Off Target
                </Button>
              </div>
            </div>
          </div>
        )}

        {!result && !loading && !error && (
          <div className="text-center py-6">
            <Brain className="h-10 w-10 mx-auto mb-2 text-muted-foreground opacity-50" />
            <p className="text-sm text-muted-foreground">Generate real-time trade setups</p>
            <p className="text-xs text-muted-foreground mt-1">Powered by live market data and AI</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};