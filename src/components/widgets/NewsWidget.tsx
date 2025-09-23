import React, { useState, useEffect } from 'react';
import { Newspaper, ExternalLink, Clock, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { NewsItemWithAI } from '@/components/news/NewsItemWithAI';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface NewsItem {
  id: string;
  title: string;
  source: string;
  publishedAt: string;
  tickers: string[];
  sentiment: 'positive' | 'negative' | 'neutral';
}

export const NewsWidget: React.FC = () => {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    setLoading(true);
    try {
      const { data } = await supabase.functions.invoke('news', {
        body: { symbol: 'SPY' }
      });
      
      if (data?.items) {
        setNewsItems(data.items.slice(0, 5));
      }
    } catch (error) {
      console.error('Error fetching news:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fallback data
  const fallbackNews: NewsItem[] = [
    {
      id: '1',
      title: 'Fed Signals Rate Cuts Amid Economic Uncertainty',
      source: 'Reuters',
      publishedAt: '2024-01-15T10:30:00Z',
      tickers: ['SPY', 'QQQ'],
      sentiment: 'neutral'
    },
    {
      id: '2',
      title: 'Apple Beats Q4 Earnings Expectations',
      source: 'Bloomberg',
      publishedAt: '2024-01-15T09:15:00Z',
      tickers: ['AAPL'],
      sentiment: 'positive'
    },
    {
      id: '3',
      title: 'Tesla Production Concerns Weigh on Stock',
      source: 'CNBC',
      publishedAt: '2024-01-15T08:45:00Z',
      tickers: ['TSLA'],
      sentiment: 'negative'
    },
    {
      id: '4',
      title: 'AI Chip Demand Drives Semiconductor Rally',
      source: 'MarketWatch',
      publishedAt: '2024-01-15T08:00:00Z',
      tickers: ['NVDA', 'AMD'],
      sentiment: 'positive'
    }
  ];

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-bull';
      case 'negative': return 'text-bear';
      default: return 'text-neutral';
    }
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
            <span>In the News</span>
          </CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <a href="/news">
              <ExternalLink className="h-3 w-3" />
            </a>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-80 overflow-y-auto custom-scrollbar">
          {newsItems.map((item) => (
            <div key={item.id} className="p-3 hover:bg-muted rounded-lg transition-colors cursor-pointer">
              <div className="flex items-start justify-between mb-2">
                <h4 className="text-sm font-medium line-clamp-2 flex-1">
                  {item.title}
                </h4>
                <div className={`w-2 h-2 rounded-full ml-2 mt-1 ${
                  item.sentiment === 'positive' ? 'bg-bull' :
                  item.sentiment === 'negative' ? 'bg-bear' : 'bg-neutral'
                }`} />
              </div>
              
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <span>{item.source}</span>
                  <div className="flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {formatTime(item.publishedAt)}
                  </div>
                </div>
                <div className="flex space-x-1">
                  {item.tickers.slice(0, 2).map((ticker) => (
                    <Badge key={ticker} variant="outline" className="text-xs px-1 py-0">
                      {ticker}
                    </Badge>
                  ))}
                  {item.tickers.length > 2 && (
                    <Badge variant="outline" className="text-xs px-1 py-0">
                      +{item.tickers.length - 2}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-3 pt-3 border-t">
          <Button variant="outline" size="sm" className="w-full" asChild>
            <a href="/news">View All News</a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};