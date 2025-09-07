import React, { useState } from 'react';
import { Newspaper, ExternalLink, Clock, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface StockNewsProps {
  ticker?: string;
}

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  publishedAt: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  url: string;
}

export const StockNews: React.FC<StockNewsProps> = ({ ticker = 'AAPL' }) => {
  const [loading, setLoading] = useState(false);

  // Mock news data specific to the ticker
  const newsItems: NewsItem[] = [
    {
      id: '1',
      title: `${ticker} Reports Strong Q4 Earnings, Beats Revenue Expectations`,
      summary: 'Company delivered better-than-expected quarterly results driven by strong product sales and services growth.',
      source: 'Bloomberg',
      publishedAt: '2024-01-15T09:15:00Z',
      sentiment: 'positive',
      url: '#'
    },
    {
      id: '2',
      title: `Analyst Upgrades ${ticker} Price Target Following AI Developments`,
      summary: 'Wall Street analysts raise price targets citing strong positioning in artificial intelligence market.',
      source: 'CNBC',
      publishedAt: '2024-01-15T08:30:00Z',
      sentiment: 'positive',
      url: '#'
    },
    {
      id: '3',
      title: `${ticker} Announces New Product Launch at Developer Conference`,
      summary: 'Company unveils next-generation products with enhanced features and improved performance metrics.',
      source: 'Reuters',
      publishedAt: '2024-01-15T07:45:00Z',
      sentiment: 'positive',
      url: '#'
    },
    {
      id: '4',
      title: `Supply Chain Concerns May Impact ${ticker} Q1 Guidance`,
      summary: 'Industry experts warn of potential supply chain disruptions affecting production targets.',
      source: 'MarketWatch',
      publishedAt: '2024-01-15T06:20:00Z',
      sentiment: 'negative',
      url: '#'
    }
  ];

  const refreshNews = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => setLoading(false), 1000);
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-bull';
      case 'negative': return 'text-bear';
      default: return 'text-neutral';
    }
  };

  const getSentimentBadge = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'default';
      case 'negative': return 'destructive';
      default: return 'secondary';
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
                    {item.sentiment}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{item.source}</span>
                </div>
                <Button variant="ghost" size="sm" asChild className="h-auto p-1">
                  <a href={item.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </Button>
              </div>
              
              <h4 className="text-sm font-medium mb-2 line-clamp-2">
                {item.title}
              </h4>
              
              <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                {item.summary}
              </p>
              
              <div className="flex items-center text-xs text-muted-foreground">
                <Clock className="h-3 w-3 mr-1" />
                {formatTime(item.publishedAt)}
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