import React, { useState, useEffect } from 'react';
import { Send, Brain, Lightbulb, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';

export const AIMarketAssistant: React.FC = () => {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const suggestedPrompts = [
    "What's driving the market today?",
    "Analyze current tech sector trends",
    "Find opportunities in beaten-down stocks",
    "What are the key economic indicators to watch?"
  ];

  useEffect(() => {
    // Set up realtime subscriptions
    const priceCh = supabase
      .channel("stock_prices")
      .on("postgres_changes", { event: "*", schema: "public", table: "stock_prices" }, () => {
        // Refresh on price updates
      })
      .subscribe();

    const newsCh = supabase
      .channel("news_events")
      .on("postgres_changes", { event: "*", schema: "public", table: "news_events" }, () => {
        // Refresh on news updates
      })
      .subscribe();

    return () => {
      priceCh.unsubscribe();
      newsCh.unsubscribe();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setResponse('');
    
    let retries = 0;
    const maxRetries = 2;
    
    while (retries < maxRetries) {
      try {
        const { data, error } = await supabase.functions.invoke('ai-trader-pro', {
          body: { 
            symbol: query.toUpperCase() || 'SPY',
            timeframe: '1D'
          }
        });

        if (error) throw error;
        
        if (data?.reasoning) {
          setResponse(data.reasoning);
          break;
        }
      } catch (error) {
        retries++;
        
        if (retries >= maxRetries) {
          setResponse('Unable to fetch analysis. Please try again.');
          // Log error to error_logs
          await supabase.from('error_logs').insert({
            function_name: 'AIMarketAssistant',
            error_message: error instanceof Error ? error.message : 'Unknown error',
            metadata: { query, retries }
          });
        } else {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }
    
    setLoading(false);
  };

  const handleSuggestedPrompt = (prompt: string) => {
    setQuery(prompt);
  };

  return (
    <Card className="widget-container">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Brain className="h-5 w-5 text-primary" />
          <span>AI Market Assistant</span>
          <Badge variant="secondary">GPT-5</Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask about market conditions, trends, or stocks..."
            disabled={loading}
          />
          <Button type="submit" disabled={loading || !query.trim()}>
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>

        {/* Suggested Prompts */}
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Try asking:</p>
          <div className="flex flex-wrap gap-2">
            {suggestedPrompts.map((prompt, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => handleSuggestedPrompt(prompt)}
                className="text-xs"
                disabled={loading}
              >
                <Lightbulb className="h-3 w-3 mr-1" />
                {prompt}
              </Button>
            ))}
          </div>
        </div>

        {/* AI Response */}
        {response && (
          <div className="p-3 bg-muted rounded-lg">
            <div className="flex items-start space-x-2">
              <Brain className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <div className="text-sm">{response}</div>
            </div>
          </div>
        )}

        {/* Loading Skeleton */}
        {loading && !response && (
          <div className="border-t pt-4">
            <Skeleton className="h-4 w-32 mb-2" />
            <div className="space-y-2">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-3/4" />
              <Skeleton className="h-3 w-5/6" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">Fetching live market data...</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};