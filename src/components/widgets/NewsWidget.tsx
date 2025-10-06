import React, { useState, useEffect } from 'react';
import { Newspaper, ExternalLink, Clock, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

interface NewsItem {
  id: string;
  title: string;
  source: string;
  publishedAt: string;
  tickers: string[];
  sentiment: 'positive' | 'negative' | 'neutral';
}

/**
 * NewsWidget Component
 * ⚠️ LIVE DATA ONLY - No fallback/dummy data
 * Displays loading state until real news arrives
 */
export const NewsWidget: React.FC = () => {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('news', {
        body: { symbol: 'SPY' }
      });
      
      if (error) throw error;
      
      const items = data?.items || [];
      setNewsItems(items.slice(0, 5));
    } catch (error) {
      console.error('Error fetching news:', error);
      setNewsItems([]);
    } finally {
      setLoading(false);
    }
  };

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
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse space-y-2 p-3">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : newsItems.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Newspaper className="h-12 w-12 mx-auto mb-3 opacity-40" />
            <p className="font-medium">No live news available</p>
            <p className="text-sm mt-1">Live market news will appear here</p>
          </div>
        ) : (
          <>
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
          </>
        )}
      </CardContent>
    </Card>
  );
};
