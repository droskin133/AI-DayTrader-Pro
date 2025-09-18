import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, TrendingUp, TrendingDown, Brain, Target, Eye, Trash2, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface WatchlistItem {
  id: string;
  ticker: string;
  added_at: string;
  created_at?: string;
  user_id?: string;
  // Live data fields
  price?: number;
  change?: number;
  change_percent?: number;
  volume?: number;
  ma_200?: number;
  sentiment_score?: number;
  latest_news?: string;
}

const Watchlist: React.FC = () => {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTicker, setNewTicker] = useState('');
  const [sectorFilter, setSectorFilter] = useState('all');
  const [sentimentFilter, setSentimentFilter] = useState('all');
  const [searchFilter, setSearchFilter] = useState('');
  const [showAISuggestions, setShowAISuggestions] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchWatchlist();
    }
  }, [user]);

  const fetchWatchlist = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('watchlist')
        .select('*')
        .eq('user_id', user.id)
        .order('added_at', { ascending: false });

      if (error) throw error;
      
      // Transform data and add mock live data
      const watchlistWithLiveData = data.map(item => ({
        ...item,
        added_at: item.created_at,
        price: 150 + Math.random() * 300,
        change: (Math.random() - 0.5) * 20,
        change_percent: (Math.random() - 0.5) * 10,
        volume: Math.floor(Math.random() * 10000000),
        ma_200: 140 + Math.random() * 280,
        sentiment_score: Math.random() * 100,
        latest_news: `Breaking: ${item.ticker} reports quarterly earnings`
      }));
      
      setWatchlist(watchlistWithLiveData);
    } catch (error) {
      console.error('Error fetching watchlist:', error);
      toast.error('Failed to load watchlist');
    } finally {
      setLoading(false);
    }
  };

  const addToWatchlist = async () => {
    if (!user || !newTicker.trim()) return;
    
    const ticker = newTicker.trim().toUpperCase();
    
    // Check if already exists
    if (watchlist.some(item => item.ticker === ticker)) {
      toast.error('Stock already in watchlist');
      return;
    }

    try {
      const { error } = await supabase.rpc('toggle_watchlist', {
        ticker: ticker
      });

      if (error) throw error;
      
      toast.success(`${ticker} added to watchlist`);
      setNewTicker('');
      fetchWatchlist();
    } catch (error) {
      console.error('Error adding to watchlist:', error);
      toast.error('Failed to add to watchlist');
    }
  };

  const removeFromWatchlist = async (ticker: string) => {
    if (!user) return;

    try {
      const { error } = await supabase.rpc('toggle_watchlist', {
        ticker: ticker
      });

      if (error) throw error;
      
      toast.success(`${ticker} removed from watchlist`);
      fetchWatchlist();
    } catch (error) {
      console.error('Error removing from watchlist:', error);
      toast.error('Failed to remove from watchlist');
    }
  };

  const getSentimentColor = (score?: number) => {
    if (!score) return 'secondary';
    if (score >= 70) return 'default';
    if (score >= 30) return 'secondary';
    return 'destructive';
  };

  const getSentimentLabel = (score?: number) => {
    if (!score) return 'Neutral';
    if (score >= 70) return 'Bullish';
    if (score >= 30) return 'Neutral';
    return 'Bearish';
  };

  const generateAISuggestions = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase.functions.invoke('ai-cluster-similar-tickers', {
        body: { user_id: user.id }
      });

      if (error) throw error;
      
      toast.success('AI suggestions generated! Check your notifications.');
    } catch (error) {
      console.error('Error generating AI suggestions:', error);
      toast.error('Failed to generate AI suggestions');
    }
  };

  const filteredWatchlist = watchlist.filter(item => {
    const matchesSearch = item.ticker.toLowerCase().includes(searchFilter.toLowerCase());
    const matchesSentiment = sentimentFilter === 'all' || 
      (sentimentFilter === 'bullish' && (item.sentiment_score || 0) >= 70) ||
      (sentimentFilter === 'bearish' && (item.sentiment_score || 0) < 30) ||
      (sentimentFilter === 'neutral' && (item.sentiment_score || 0) >= 30 && (item.sentiment_score || 0) < 70);
    
    return matchesSearch && matchesSentiment;
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">Sign In Required</h2>
              <p className="text-muted-foreground mb-6">Please sign in to view your watchlist</p>
              <Button onClick={() => navigate('/signin')}>Sign In</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">My Watchlist</h1>
          <p className="text-muted-foreground">
            Track your favorite stocks with real-time data and AI insights
          </p>
        </div>

        {/* Controls */}
        <div className="mb-6 space-y-4">
          {/* Add Stock */}
          <Card>
            <CardContent className="p-4">
              <div className="flex space-x-4">
                <div className="flex-1">
                  <Input
                    placeholder="Enter ticker symbol (e.g., AAPL, TSLA)..."
                    value={newTicker}
                    onChange={(e) => setNewTicker(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addToWatchlist()}
                  />
                </div>
                <Button onClick={addToWatchlist} disabled={!newTicker.trim()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Stock
                </Button>
                <Button variant="outline" onClick={generateAISuggestions}>
                  <Brain className="h-4 w-4 mr-2" />
                  AI Suggestions
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex space-x-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Search tickers..."
                      value={searchFilter}
                      onChange={(e) => setSearchFilter(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={sentimentFilter} onValueChange={setSentimentFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Sentiment" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sentiment</SelectItem>
                    <SelectItem value="bullish">Bullish</SelectItem>
                    <SelectItem value="neutral">Neutral</SelectItem>
                    <SelectItem value="bearish">Bearish</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={sectorFilter} onValueChange={setSectorFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Sector" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sectors</SelectItem>
                    <SelectItem value="tech">Technology</SelectItem>
                    <SelectItem value="healthcare">Healthcare</SelectItem>
                    <SelectItem value="finance">Finance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Watchlist Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="animate-pulse space-y-4">
                    <div className="h-4 bg-muted rounded w-16"></div>
                    <div className="h-8 bg-muted rounded w-24"></div>
                    <div className="h-4 bg-muted rounded w-32"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredWatchlist.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Star className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No stocks in watchlist</h3>
              <p className="text-muted-foreground mb-4">Start by adding some stocks to track</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredWatchlist.map((item) => (
              <Card key={item.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{item.ticker}</CardTitle>
                      <p className="text-2xl font-bold">
                        ${item.price?.toFixed(2)}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/stock/${item.ticker}`);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFromWatchlist(item.ticker);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0" onClick={() => navigate(`/stock/${item.ticker}`)}>
                  <div className="space-y-3">
                    {/* Price Change */}
                    <div className="flex items-center space-x-2">
                      {(item.change || 0) >= 0 ? (
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-500" />
                      )}
                      <span className={`font-medium ${(item.change || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {(item.change || 0) >= 0 ? '+' : ''}{item.change?.toFixed(2)} ({item.change_percent?.toFixed(2)}%)
                      </span>
                    </div>

                    <Separator />

                    {/* Key Metrics */}
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-muted-foreground">Volume</p>
                        <p className="font-medium">{item.volume?.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">200 MA</p>
                        <p className="font-medium">${item.ma_200?.toFixed(2)}</p>
                      </div>
                    </div>

                    {/* Sentiment */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Sentiment</span>
                      <Badge variant={getSentimentColor(item.sentiment_score)}>
                        {getSentimentLabel(item.sentiment_score)}
                      </Badge>
                    </div>

                    {/* Latest News */}
                    {item.latest_news && (
                      <div className="text-xs text-muted-foreground">
                        <p className="truncate">{item.latest_news}</p>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex space-x-2 pt-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Target className="h-3 w-3 mr-1" />
                        Alert
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        <Brain className="h-3 w-3 mr-1" />
                        AI Analysis
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Watchlist;