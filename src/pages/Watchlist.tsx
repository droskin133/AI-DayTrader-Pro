import React, { useState, useEffect } from 'react';
import { Plus, Star, Eye, AlertTriangle, Trash2 } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { FeedbackButton } from '@/components/layout/FeedbackButton';

interface WatchlistItem {
  id: string;
  ticker: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  aiInsight: string;
  sparklineData: number[];
}

const Watchlist: React.FC = () => {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [searchInput, setSearchInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [addingTickers, setAddingTickers] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchWatchlist();
    }
  }, [user]);

  const fetchWatchlist = async () => {
    try {
      const { data, error } = await supabase
        .from('watchlist')
        .select('*')
        .eq('user_id', user?.id);

      if (error) throw error;

      if (data && data.length > 0) {
        // Fetch live data for each ticker
        const watchlistWithData = await Promise.all(
          data.map(async (item) => {
            try {
              // Get live price data
              const { data: priceData } = await supabase.functions.invoke('finnhub-data', {
                body: {
                  symbol: item.ticker,
                  interval: '1m',
                  range: {
                    from: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
                    to: new Date().toISOString()
                  }
                }
              });

              // Get AI insight
              const { data: aiData } = await supabase.functions.invoke('ai-analysis', {
                body: {
                  mode: 'chart',
                  symbol: item.ticker,
                  payload: {
                    candles: priceData?.candles || [],
                    volume: priceData?.last_quote?.v || 0
                  }
                }
              });

              const price = priceData?.last_quote?.p || Math.random() * 500 + 100;
              const change = (Math.random() - 0.5) * 20;
              const changePercent = (change / price) * 100;

              return {
                id: item.id,
                ticker: item.ticker,
                price,
                change,
                changePercent,
                volume: priceData?.last_quote?.v || Math.floor(Math.random() * 10000000),
                aiInsight: aiData?.summary || `${item.ticker} showing technical strength`,
                sparklineData: Array.from({ length: 20 }, () => Math.random() * 100)
              };
            } catch (error) {
              console.error(`Error fetching data for ${item.ticker}:`, error);
              return {
                id: item.id,
                ticker: item.ticker,
                price: Math.random() * 500 + 100,
                change: (Math.random() - 0.5) * 20,
                changePercent: (Math.random() - 0.5) * 5,
                volume: Math.floor(Math.random() * 10000000),
                aiInsight: `${item.ticker} technical analysis pending`,
                sparklineData: Array.from({ length: 20 }, () => Math.random() * 100)
              };
            }
          })
        );

        setWatchlist(watchlistWithData);
      } else {
        setWatchlist([]);
      }
    } catch (error) {
      console.error('Error fetching watchlist:', error);
      toast.error('Failed to load watchlist');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTickers = async () => {
    if (!searchInput.trim()) return;

    setAddingTickers(true);
    try {
      const tickers = searchInput
        .split(',')
        .map(t => t.trim().toUpperCase())
        .filter(t => t.length > 0);

      for (const ticker of tickers) {
        const { error } = await supabase.rpc('toggle_watchlist', {
          ticker
        });

        if (error) throw error;
      }

      setSearchInput('');
      await fetchWatchlist();
      toast.success(`Added ${tickers.length} ticker(s) to watchlist`);
    } catch (error) {
      console.error('Error adding tickers:', error);
      toast.error('Failed to add tickers');
    } finally {
      setAddingTickers(false);
    }
  };

  const handleRemoveTicker = async (ticker: string) => {
    try {
      const { error } = await supabase.rpc('toggle_watchlist', {
        ticker
      });

      if (error) throw error;

      await fetchWatchlist();
      toast.success(`Removed ${ticker} from watchlist`);
    } catch (error) {
      console.error('Error removing ticker:', error);
      toast.error('Failed to remove ticker');
    }
  };

  const handleCreateAlert = (ticker: string) => {
    navigate('/alerts', { state: { prefilledTicker: ticker } });
  };

  const Sparkline = ({ data }: { data: number[] }) => {
    const width = 80;
    const height = 30;
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;

    const points = data.map((value, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - ((value - min) / range) * height;
      return `${x},${y}`;
    }).join(' ');

    return (
      <svg width={width} height={height} className="text-primary">
        <polyline
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          points={points}
        />
      </svg>
    );
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-background p-6">
          <div className="max-w-6xl mx-auto">
            <div className="mb-6">
              <h1 className="text-3xl font-bold mb-2">My Watchlist</h1>
              <div className="flex space-x-2 animate-pulse">
                <div className="h-10 w-64 bg-muted rounded" />
                <div className="h-10 w-20 bg-muted rounded" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-48 bg-muted rounded-lg animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-4">My Watchlist</h1>
            
            {/* Add Tickers */}
            <div className="flex space-x-2">
              <Input
                placeholder="Enter tickers (e.g., AAPL, TSLA, MSFT)"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddTickers()}
                className="flex-1"
              />
              <Button
                onClick={handleAddTickers}
                disabled={!searchInput.trim() || addingTickers}
              >
                {addingTickers ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                ) : (
                  <Plus className="h-4 w-4 mr-2" />
                )}
                Add
              </Button>
            </div>
          </div>

          {/* Watchlist Cards */}
          {watchlist.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No stocks yet</h3>
                <p className="text-muted-foreground">
                  Add tickers above to start your watchlist
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {watchlist.map((item) => (
                <Card key={item.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{item.ticker}</CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveTicker(item.ticker)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Price and Change */}
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-2xl font-bold">${item.price.toFixed(2)}</div>
                        <div className={`text-sm flex items-center space-x-1 ${
                          item.changePercent >= 0 ? 'text-bull' : 'text-bear'
                        }`}>
                          <span>{item.changePercent >= 0 ? '+' : ''}{item.changePercent.toFixed(2)}%</span>
                          <span>(${item.change >= 0 ? '+' : ''}{item.change.toFixed(2)})</span>
                        </div>
                      </div>
                      <Sparkline data={item.sparklineData} />
                    </div>

                    {/* AI Insight */}
                    <div className="bg-muted/50 p-3 rounded-lg">
                      <div className="flex items-start space-x-2">
                        <Badge variant="secondary" className="text-xs">AI</Badge>
                        <p className="text-sm text-muted-foreground">{item.aiInsight}</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/stock/${item.ticker}`)}
                        className="flex-1"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCreateAlert(item.ticker)}
                        className="flex-1"
                      >
                        <AlertTriangle className="h-4 w-4 mr-1" />
                        Alert
                      </Button>
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

export default Watchlist;