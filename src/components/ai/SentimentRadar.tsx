import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Activity, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';

interface SentimentData {
  ticker: string;
  sentiment: number; // -1 to 1 scale
  sentimentChange: number;
  volume: number;
  volumeChange: number;
  newsCount: number;
  confidence: number;
}

export const SentimentRadar: React.FC = () => {
  const [sentimentData, setSentimentData] = useState<SentimentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'bullish' | 'bearish' | 'volatile'>('all');

  useEffect(() => {
    fetchSentimentData();
  }, []);

  const fetchSentimentData = async () => {
    try {
      setLoading(true);
      
      // Fetch live sentiment from watchlist or top symbols
      const { data: watchlistData } = await supabase
        .from('watchlist')
        .select('ticker')
        .limit(10);
      
      const tickers = watchlistData?.map((w: any) => w.ticker) || ['AAPL', 'NVDA', 'TSLA', 'AMD', 'MSFT'];
      
      const sentimentPromises = tickers.map(async (ticker: string) => {
        try {
          const { data: newsData } = await supabase.functions.invoke('ai-news', {
            body: { symbol: ticker, mode: 'aggregate' }
          });

          return {
            ticker,
            sentiment: newsData?.sentiment || 0,
            sentimentChange: Math.random() * 0.6 - 0.3, // TODO: Calculate from historical
            volume: 0, // TODO: Get from live price feed
            volumeChange: 1.0,
            newsCount: newsData?.articles?.length || 0,
            confidence: Math.abs(newsData?.sentiment || 0)
          };
        } catch (err) {
          console.error(`Failed to get sentiment for ${ticker}:`, err);
          return null;
        }
      });

      const results = await Promise.all(sentimentPromises);
      const validResults = results.filter(r => r !== null) as SentimentData[];
      
      if (validResults.length === 0) {
        throw new Error('No sentiment data available');
      }

      setSentimentData(validResults);
    } catch (error) {
      console.error('Error fetching sentiment data:', error);
      setSentimentData([]);
    } finally {
      setLoading(false);
    }
  };

  const getSentimentLabel = (sentiment: number): string => {
    if (sentiment > 0.5) return 'Very Bullish';
    if (sentiment > 0.1) return 'Bullish';
    if (sentiment > -0.1) return 'Neutral';
    if (sentiment > -0.5) return 'Bearish';
    return 'Very Bearish';
  };

  const getSentimentColor = (sentiment: number): string => {
    if (sentiment > 0.3) return 'text-bull';
    if (sentiment > 0) return 'text-green-600';
    if (sentiment > -0.3) return 'text-muted-foreground';
    return 'text-bear';
  };

  const getFilteredData = (): SentimentData[] => {
    switch (filter) {
      case 'bullish':
        return sentimentData.filter(item => item.sentiment > 0.2);
      case 'bearish':
        return sentimentData.filter(item => item.sentiment < -0.2);
      case 'volatile':
        return sentimentData.filter(item => Math.abs(item.sentimentChange) > 0.3);
      default:
        return sentimentData;
    }
  };

  const viewStock = (ticker: string) => {
    window.open(`/ticker/${ticker}`, '_blank');
  };

  if (loading) {
    return (
      <Card className="widget-container">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5 text-primary" />
            <span>Sentiment Radar</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-4 bg-muted rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const filteredData = getFilteredData();

  return (
    <Card className="widget-container">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Activity className="h-5 w-5 text-primary" />
          <span>Sentiment Radar</span>
          <Badge variant="outline">Live</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2">
          {['all', 'bullish', 'bearish', 'volatile'].map((filterType) => (
            <Button
              key={filterType}
              variant={filter === filterType ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(filterType as any)}
              className="capitalize"
            >
              {filterType}
            </Button>
          ))}
        </div>

        {/* Sentiment List */}
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {filteredData.map((item) => (
            <div key={item.ticker} className="p-3 border rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="font-semibold">{item.ticker}</span>
                  <Badge
                    variant="outline"
                    className={getSentimentColor(item.sentiment)}
                  >
                    {getSentimentLabel(item.sentiment)}
                  </Badge>
                </div>
                <Button size="sm" variant="ghost" onClick={() => viewStock(item.ticker)}>
                  <Eye className="h-3 w-3 mr-1" />
                  View
                </Button>
              </div>

              {/* Sentiment Progress */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Sentiment Score</span>
                  <span className={getSentimentColor(item.sentiment)}>
                    {(item.sentiment * 100).toFixed(0)}%
                  </span>
                </div>
                <Progress
                  value={((item.sentiment + 1) / 2) * 100}
                  className="h-2"
                />
              </div>

              {/* Additional Metrics */}
              <div className="grid grid-cols-3 gap-2 mt-2 text-xs text-muted-foreground">
                <div className="flex items-center">
                  {item.sentimentChange > 0 ? (
                    <TrendingUp className="h-3 w-3 mr-1 text-bull" />
                  ) : (
                    <TrendingDown className="h-3 w-3 mr-1 text-bear" />
                  )}
                  <span>{item.sentimentChange > 0 ? '+' : ''}{(item.sentimentChange * 100).toFixed(0)}%</span>
                </div>
                <div>
                  <span>Vol: {item.volumeChange > 1 ? '+' : ''}{((item.volumeChange - 1) * 100).toFixed(0)}%</span>
                </div>
                <div>
                  <span>{item.newsCount} news</span>
                </div>
              </div>

              {/* Confidence Indicator */}
              <div className="mt-2">
                <div className="flex justify-between text-xs">
                  <span>Confidence</span>
                  <span>{(item.confidence * 100).toFixed(0)}%</span>
                </div>
                <Progress
                  value={item.confidence * 100}
                  className="h-1"
                />
              </div>
            </div>
          ))}
        </div>

        {filteredData.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No stocks match the current filter</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};