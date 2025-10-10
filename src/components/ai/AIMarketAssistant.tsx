import React, { useState } from 'react';
import { Send, Brain, Lightbulb, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
            symbol: 'SPY',
            timeframe: '1D',
            query
          }
        });

        if (error) throw error;
        
        if (data?.reasoning) {
          setResponse(data.reasoning);
          break;
        }
      } catch (error) {
        console.error('AI Assistant error (attempt ' + (retries + 1) + '):', error);
        retries++;
        
        if (retries >= maxRetries) {
          setResponse('');
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
            <div className="flex items-center space-x-2 mb-2">
              <div className="animate-pulse h-4 w-4 bg-muted rounded" />
              <div className="animate-pulse h-4 w-32 bg-muted rounded" />
            </div>
            <div className="space-y-2">
              <div className="animate-pulse h-3 w-full bg-muted rounded" />
              <div className="animate-pulse h-3 w-3/4 bg-muted rounded" />
              <div className="animate-pulse h-3 w-5/6 bg-muted rounded" />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};