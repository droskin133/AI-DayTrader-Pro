import React, { useState } from 'react';
import { Brain, TrendingUp, AlertTriangle, Target } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';

export const AITraderPro: React.FC<{ ticker?: string }> = ({ ticker = 'AAPL' }) => {
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const analyze = async () => {
    setLoading(true); setError(null); setResult(null);
    try {
      const { data, error } = await supabase.functions.invoke('ai-trader-pro', { body: { symbol: ticker, timeframe: 'intraday' } });
      if (error) throw error;
      setResult(data);
    } catch (e: any) { 
      const msg = e?.message || 'AI analysis failed';
      setError(msg); 
    } finally { 
      setLoading(false); 
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
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            ) : (
              <TrendingUp className="h-4 w-4" />
            )}
            <span className="ml-2">{loading ? 'Analyzing...' : 'Generate'}</span>
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
        {result && result.trade_setup && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              {result.market_signals && (
                <>
                  <div className="text-center p-2 bg-muted rounded">
                    <div className="text-lg font-bold">{result.market_signals.options_activity || 0}</div>
                    <div className="text-xs text-muted-foreground">Options</div>
                  </div>
                  <div className="text-center p-2 bg-muted rounded">
                    <div className="text-lg font-bold">{result.market_signals.news_items || 0}</div>
                    <div className="text-xs text-muted-foreground">News</div>
                  </div>
                </>
              )}
            </div>
            <div className="text-sm whitespace-pre-wrap">{result.trade_setup}</div>
          </div>
        )}
        {!result && !loading && !error && (
          <div className="text-center py-6">
            <Brain className="h-10 w-10 mx-auto mb-2 text-muted-foreground opacity-50" />
            <p className="text-sm text-muted-foreground">Generate real-time trade setups</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
