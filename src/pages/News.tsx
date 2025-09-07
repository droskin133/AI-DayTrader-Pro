import React, { useState } from 'react';
import { Search, Eye, EyeOff } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  publishedAt: string;
  url: string;
  tickers: string[];
  sentiment: 'positive' | 'negative' | 'neutral';
}

const News: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [watchedTopics, setWatchedTopics] = useState<string[]>([]);

  // Mock news data
  const newsItems: NewsItem[] = [
    {
      id: '1',
      title: 'Federal Reserve Signals Potential Rate Cuts Amid Economic Uncertainty',
      summary: 'Fed officials hint at possible monetary policy adjustments as inflation shows signs of cooling...',
      source: 'Reuters',
      publishedAt: '2024-01-15T10:30:00Z',
      url: '#',
      tickers: ['SPY', 'QQQ'],
      sentiment: 'neutral'
    },
    {
      id: '2',
      title: 'Apple Reports Strong Q4 Earnings, Beats Revenue Expectations',
      summary: 'Apple Inc. delivered better-than-expected quarterly results driven by strong iPhone sales...',
      source: 'Bloomberg',
      publishedAt: '2024-01-15T09:15:00Z',
      url: '#',
      tickers: ['AAPL'],
      sentiment: 'positive'
    },
    {
      id: '3',
      title: 'Tesla Stock Drops on Production Concerns',
      summary: 'Shares of Tesla fell in pre-market trading as analysts express concerns over production targets...',
      source: 'CNBC',
      publishedAt: '2024-01-15T08:45:00Z',
      url: '#',
      tickers: ['TSLA'],
      sentiment: 'negative'
    }
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement search functionality
    console.log('Searching for:', searchQuery);
  };

  const toggleWatchTopic = (topic: string) => {
    setWatchedTopics(prev => 
      prev.includes(topic) 
        ? prev.filter(t => t !== topic)
        : [...prev, topic]
    );
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

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Market News</h1>
          <p className="text-muted-foreground">
            Stay updated with the latest market news and analysis
          </p>
        </div>

        {/* Search */}
        <div className="mb-6">
          <form onSubmit={handleSearch} className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search news, tickers, or topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </form>
        </div>

        {/* Watched Topics */}
        {watchedTopics.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-3">Watched Topics</h2>
            <div className="flex flex-wrap gap-2">
              {watchedTopics.map((topic) => (
                <Badge key={topic} variant="outline" className="flex items-center gap-1">
                  {topic}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 ml-1"
                    onClick={() => toggleWatchTopic(topic)}
                  >
                    <EyeOff className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* News Feed */}
        <div className="space-y-4">
          {newsItems.map((item) => (
            <Card key={item.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Badge variant={getSentimentBadge(item.sentiment)}>
                      {item.sentiment}
                    </Badge>
                    <span className="text-sm text-muted-foreground">{item.source}</span>
                    <span className="text-sm text-muted-foreground">
                      {new Date(item.publishedAt).toLocaleTimeString()}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleWatchTopic(item.title.split(' ')[0]);
                    }}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    {watchedTopics.includes(item.title.split(' ')[0]) ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                
                <h3 className="text-lg font-semibold mb-2 hover:text-primary transition-colors">
                  {item.title}
                </h3>
                
                <p className="text-muted-foreground mb-3">
                  {item.summary}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {item.tickers.map((ticker) => (
                      <Badge key={ticker} variant="outline">
                        {ticker}
                      </Badge>
                    ))}
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <a href={item.url} target="_blank" rel="noopener noreferrer">
                      Read More
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Load More */}
        <div className="mt-8 text-center">
          <Button variant="outline">Load More News</Button>
        </div>
      </div>
    </div>
  );
};

export default News;