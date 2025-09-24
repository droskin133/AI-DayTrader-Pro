import React, { useState, useEffect } from 'react';
import { Clock, ExternalLink, TrendingUp } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { NewsItemWithAI } from '@/components/news/NewsItemWithAI';
import { FeedbackButton } from '@/components/layout/FeedbackButton';

interface NewsItem {
  id: string;
  headline: string;
  url: string;
  published_at: string;
  symbol: string;
  sentiment: number;
  summary?: string;
}

const News: React.FC = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTicker, setSearchTicker] = useState('');
  const [sectorFilter, setSectorFilter] = useState('all');

  useEffect(() => {
    fetchGlobalNews();
  }, []);

  const fetchGlobalNews = async () => {
    try {
      setLoading(true);
      
      // Fetch news for multiple major tickers to get global news
      const majorTickers = ['SPY', 'AAPL', 'MSFT', 'GOOGL', 'TSLA', 'NVDA', 'AMZN', 'META'];
      const allNews: NewsItem[] = [];

      for (const ticker of majorTickers.slice(0, 4)) { // Limit to avoid rate limits
        try {
          const { data, error } = await supabase.functions.invoke('news', {
            body: { symbol: ticker }
          });

          if (!error && data?.items) {
            const newsWithSymbol = data.items.map((item: any) => ({
              ...item,
              symbol: ticker
            }));
            allNews.push(...newsWithSymbol);
          }
        } catch (error) {
          console.error(`Error fetching news for ${ticker}:`, error);
        }
      }

      // Sort by published date and remove duplicates
      const uniqueNews = allNews
        .filter((item, index, self) => 
          index === self.findIndex(t => t.headline === item.headline)
        )
        .sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime())
        .slice(0, 20); // Show latest 20 articles

      setNews(uniqueNews);
    } catch (error) {
      console.error('Error fetching global news:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchTicker = async () => {
    if (!searchTicker.trim()) {
      fetchGlobalNews();
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('news', {
        body: { symbol: searchTicker.toUpperCase() }
      });

      if (error) throw error;

      const newsWithSymbol = data?.items?.map((item: any) => ({
        ...item,
        symbol: searchTicker.toUpperCase()
      })) || [];

      setNews(newsWithSymbol);
    } catch (error) {
      console.error('Error searching ticker news:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSentimentBadge = (sentiment: number) => {
    if (sentiment > 0.1) {
      return <Badge className="bg-bull/20 text-bull border-bull/30">Positive</Badge>;
    } else if (sentiment < -0.1) {
      return <Badge className="bg-bear/20 text-bear border-bear/30">Negative</Badge>;
    } else {
      return <Badge variant="secondary">Neutral</Badge>;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const publishedDate = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - publishedDate.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-4">Market News</h1>
            
            {/* Filters */}
            <div className="flex space-x-4 mb-4">
              <div className="flex space-x-2 flex-1">
                <Input
                  placeholder="Search by ticker (e.g., AAPL)"
                  value={searchTicker}
                  onChange={(e) => setSearchTicker(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearchTicker()}
                />
                <Button onClick={handleSearchTicker}>Search</Button>
              </div>
              
              <Select value={sectorFilter} onValueChange={setSectorFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by sector" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sectors</SelectItem>
                  <SelectItem value="tech">Technology</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                  <SelectItem value="healthcare">Healthcare</SelectItem>
                  <SelectItem value="energy">Energy</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {searchTicker && (
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTicker('');
                  fetchGlobalNews();
                }}
                className="mb-4"
              >
                Clear Filter - Show All News
              </Button>
            )}
          </div>

          {/* News Feed */}
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      <div className="h-4 w-3/4 bg-muted rounded" />
                      <div className="h-4 w-1/2 bg-muted rounded" />
                      <div className="flex space-x-2">
                        <div className="h-6 w-16 bg-muted rounded" />
                        <div className="h-6 w-20 bg-muted rounded" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : news.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No news found</h3>
                <p className="text-muted-foreground">
                  {searchTicker ? `No recent news for ${searchTicker}` : 'No recent market news available'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {news.map((article) => (
                <Card key={article.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge variant="outline">{article.symbol}</Badge>
                          <div className="text-sm text-muted-foreground flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>{formatTimeAgo(article.published_at)}</span>
                          </div>
                          {getSentimentBadge(article.sentiment)}
                        </div>
                        <h3 className="text-lg font-semibold mb-2">{article.headline}</h3>
                        <Button variant="outline" size="sm" onClick={() => window.open(article.url, '_blank')}>
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Read Full Article
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
        
        <FeedbackButton />
      </div>
    </Layout>
  );
};

export default News;