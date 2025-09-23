import React, { useState } from 'react';
import { MessageSquare, Calendar, ExternalLink, Brain, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { supabase } from '@/integrations/supabase/client';

interface NewsItem {
  id: string;
  headline: string;
  url: string;
  published_at: string;
  source: string;
  tickers: string[];
  summary?: string;
  sentiment?: number;
}

interface NewsItemWithAIProps {
  newsItem: NewsItem;
}

export const NewsItemWithAI: React.FC<NewsItemWithAIProps> = ({ newsItem }) => {
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [analyzing, setAnalyzing] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);

  const getSentimentColor = (sentiment?: number) => {
    if (!sentiment) return 'text-muted-foreground';
    if (sentiment > 0.1) return 'text-bull';
    if (sentiment < -0.1) return 'text-bear';
    return 'text-muted-foreground';
  };

  const getSentimentLabel = (sentiment?: number) => {
    if (!sentiment) return 'Neutral';
    if (sentiment > 0.3) return 'Bullish';
    if (sentiment > 0.1) return 'Positive';
    if (sentiment < -0.3) return 'Bearish';
    if (sentiment < -0.1) return 'Negative';
    return 'Neutral';
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d ago`;
    }
  };

  const analyzeWithAI = async () => {
    if (aiAnalysis) {
      setShowAnalysis(!showAnalysis);
      return;
    }

    setAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-analysis', {
        body: { 
          mode: 'news',
          symbol: newsItem.tickers[0] || 'SPY',
          payload: {
            headline: newsItem.headline,
            body: newsItem.summary || newsItem.headline,
            published_at: newsItem.published_at
          }
        }
      });

      if (error) throw error;

      setAiAnalysis(data?.summary || "This news appears to have market implications worth monitoring for potential price movements.");
      setShowAnalysis(true);
    } catch (error) {
      console.error('AI analysis error:', error);
      setAiAnalysis("Unable to analyze this news item at the moment. Please try again later.");
      setShowAnalysis(true);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <Card className="mb-3 hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-medium text-sm leading-tight mb-2">
                {newsItem.headline}
              </h3>
              
              <div className="flex items-center space-x-3 text-xs text-muted-foreground">
                <div className="flex items-center">
                  <Calendar className="h-3 w-3 mr-1" />
                  {formatTime(newsItem.published_at)}
                </div>
                <span>•</span>
                <span>{newsItem.source}</span>
                {newsItem.sentiment !== undefined && (
                  <>
                    <span>•</span>
                    <span className={getSentimentColor(newsItem.sentiment)}>
                      {getSentimentLabel(newsItem.sentiment)}
                    </span>
                  </>
                )}
              </div>
            </div>
            
            <Button variant="ghost" size="sm" asChild>
              <a href={newsItem.url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-3 w-3" />
              </a>
            </Button>
          </div>

          {/* Tickers */}
          {newsItem.tickers && newsItem.tickers.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {newsItem.tickers.slice(0, 3).map((ticker, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {ticker}
                </Badge>
              ))}
              {newsItem.tickers.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{newsItem.tickers.length - 3} more
                </Badge>
              )}
            </div>
          )}

          {/* AI Analysis Section */}
          <Collapsible open={showAnalysis} onOpenChange={setShowAnalysis}>
            <div className="flex items-center space-x-2">
              <CollapsibleTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={analyzeWithAI}
                  disabled={analyzing}
                  className="text-xs"
                >
                  {analyzing ? (
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  ) : (
                    <Brain className="h-3 w-3 mr-1" />
                  )}
                  {analyzing ? 'Analyzing...' : 'What does this mean?'}
                </Button>
              </CollapsibleTrigger>
            </div>
            
            <CollapsibleContent className="mt-2">
              {aiAnalysis && (
                <div className="p-3 bg-muted rounded-lg">
                  <div className="flex items-start space-x-2">
                    <Brain className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-muted-foreground">
                      {aiAnalysis}
                    </div>
                  </div>
                </div>
              )}
            </CollapsibleContent>
          </Collapsible>
        </div>
      </CardContent>
    </Card>
  );
};