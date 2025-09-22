import React, { useState, useEffect } from 'react';
import { Newspaper, ExternalLink, Clock, RefreshCw, Brain } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';

interface StockNewsProps {
  ticker?: string;
}

interface NewsItem {
  id: string;
  headline: string;
  summary: string;
  source: string;
  published_at: string;
  sentiment: number;
  url: string;
  aiAnalysis?: {
    summary: string;
    rationale: string[];
    tags: string[];
    confidence: number;
  };
}

export const StockNews: React.FC<StockNewsProps> = ({ ticker = 'AAPL' }) => {
  const [loading, setLoading] = useState(false);
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [aiLoading, setAiLoading] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    if (ticker) {
      fetchNews();
    }
  }, [ticker]);

  const fetchNews = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('news', {
        body: { symbol: ticker }
      });

      if (error) {
        console.error('Error fetching news:', error);
        return;
      }

      if (data?.items) {
        setNewsItems(data.items);
      }
    } catch (error) {
      console.error('Failed to fetch news:', error);
    } finally {
      setLoading(false);
    }
  };

  const explainNews = async (newsItem: NewsItem) => {
    setAiLoading(prev => ({ ...prev, [newsItem.id]: true }));
    
    try {
      const { data, error } = await supabase.functions.invoke('ai-analysis', {
        body: {
          mode: 'news',
          symbol: ticker,
          payload: {
            headline: newsItem.headline,
            summary: newsItem.summary,
            published_at: newsItem.published_at
          }
        }
      });

      if (error) {
        console.error('Error getting AI analysis:', error);
        return;
      }

      if (data) {
        setNewsItems(prev => prev.map(item => 
          item.id === newsItem.id 
            ? { ...item, aiAnalysis: data }
            : item
        ));
      }
    } catch (error) {
      console.error('Failed to get AI analysis:', error);
    } finally {
      setAiLoading(prev => ({ ...prev, [newsItem.id]: false }));
    }
  };

  const refreshNews = async () => {
    await fetchNews();
  };

  const getSentimentColor = (sentiment: number) => {
    if (sentiment > 0.1) return 'text-bull';
    if (sentiment < -0.1) return 'text-bear';
    return 'text-neutral';
  };

  const getSentimentBadge = (sentiment: number) => {
    if (sentiment > 0.1) return 'default';
    if (sentiment < -0.1) return 'destructive';
    return 'secondary';
  };

  const getSentimentLabel = (sentiment: number) => {
    if (sentiment > 0.1) return 'positive';
    if (sentiment < -0.1) return 'negative';
    return 'neutral';
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
      return date.toLocaleDateString();
    }
  };

  return (
    <Card className="widget-container">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Newspaper className="h-5 w-5" />
            <span>News for {ticker}</span>
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={refreshNews}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3 max-h-80 overflow-y-auto custom-scrollbar">
          {newsItems.map((item) => (
            <div key={item.id} className="p-3 border rounded-lg hover:bg-muted transition-colors">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Badge variant={getSentimentBadge(item.sentiment)} className="text-xs">
                    {getSentimentLabel(item.sentiment)}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{item.source}</span>
                </div>
                <div className="flex space-x-1">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => explainNews(item)}
                    disabled={aiLoading[item.id]}
                    className="h-auto p-1"
                    title="What does this mean?"
                  >
                    <Brain className={`h-3 w-3 ${aiLoading[item.id] ? 'animate-spin' : ''}`} />
                  </Button>
                  <Button variant="ghost" size="sm" asChild className="h-auto p-1">
                    <a href={item.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </Button>
                </div>
              </div>
              
              <h4 className="text-sm font-medium mb-2 line-clamp-2">
                {item.headline}
              </h4>
              
              <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                {item.summary}
              </p>
              
              {item.aiAnalysis && (
                <div className="mt-3 p-2 bg-muted rounded border-l-2 border-primary">
                  <div className="flex items-center mb-1">
                    <Brain className="h-3 w-3 mr-1" />
                    <span className="text-xs font-medium">AI Analysis</span>
                    <Badge variant="outline" className="ml-2 text-xs">
                      {Math.round(item.aiAnalysis.confidence * 100)}%
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">
                    {item.aiAnalysis.summary}
                  </p>
                  <ul className="text-xs space-y-1">
                    {item.aiAnalysis.rationale.map((point, idx) => (
                      <li key={idx} className="flex items-start">
                        <span className="mr-1">•</span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {item.aiAnalysis.tags.map((tag, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex items-center text-xs text-muted-foreground">
                <Clock className="h-3 w-3 mr-1" />
                {formatTime(item.published_at)}
              </div>
            </div>
          ))}
        </div>

        {newsItems.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Newspaper className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No recent news for {ticker}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};