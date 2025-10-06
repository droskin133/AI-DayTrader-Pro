import React, { useState, useEffect } from 'react';
import { Star, Plus, X, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface WatchlistItem {
  ticker: string;
  price: number;
  change: number;
  changePercent: number;
  hasAlerts: boolean;
}

/**
 * WatchlistWidget Component
 * ⚠️ LIVE DATA ONLY - No mock data
 * Displays loading state until real watchlist and prices load
 */
export const WatchlistWidget: React.FC = () => {
  const { user } = useAuth();
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTicker, setNewTicker] = useState('');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (user) {
      fetchWatchlist();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchWatchlist = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Fetch watchlist symbols
      const { data: watchlistData, error: watchlistError } = await supabase
        .from('watchlist')
        .select('ticker')
        .eq('user_id', user.id);

      if (watchlistError) throw watchlistError;

      if (watchlistData && watchlistData.length > 0) {
        const items = await Promise.all(
          watchlistData.map(async (item) => {
            try {
              const { data: priceData } = await supabase
                .from('stock_prices')
                .select('*')
                .eq('ticker', item.ticker)
                .order('ts', { ascending: false })
                .limit(2);

              const { data: alertData } = await supabase
                .from('alerts')
                .select('id')
                .eq('ticker', item.ticker)
                .eq('user_id', user.id)
                .eq('status', 'active')
                .limit(1);

              if (priceData && priceData.length > 0) {
                const current = priceData[0];
                const prev = priceData[1] || current;
                const change = Number(current.price) - Number(prev.price);
                const changePercent = (change / Number(prev.price)) * 100;

                return {
                  ticker: item.ticker,
                  price: Number(current.price),
                  change,
                  changePercent,
                  hasAlerts: (alertData && alertData.length > 0) || false
                };
              }

              return {
                ticker: item.ticker,
                price: 0,
                change: 0,
                changePercent: 0,
                hasAlerts: (alertData && alertData.length > 0) || false
              };
            } catch (err) {
              console.error(`Error fetching data for ${item.ticker}:`, err);
              return null;
            }
          })
        );

        setWatchlist(items.filter((item): item is WatchlistItem => item !== null));
      }
    } catch (error) {
      console.error('Error fetching watchlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToWatchlist = async () => {
    if (!user || !newTicker.trim()) return;
    
    const ticker = newTicker.trim().toUpperCase();
    if (watchlist.some(item => item.ticker === ticker)) {
      setNewTicker('');
      return;
    }

    setAdding(true);
    try {
      await supabase.rpc('toggle_watchlist', { ticker });

      await fetchWatchlist();
      setNewTicker('');
    } catch (error) {
      console.error('Error adding to watchlist:', error);
    } finally {
      setAdding(false);
    }
  };

  const removeFromWatchlist = async (ticker: string) => {
    if (!user) return;
    
    try {
      await supabase.rpc('toggle_watchlist', { ticker });

      setWatchlist(prev => prev.filter(item => item.ticker !== ticker));
    } catch (error) {
      console.error('Error removing from watchlist:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addToWatchlist();
    } else if (e.key === 'Escape') {
      setAdding(false);
      setNewTicker('');
    }
  };

  return (
    <Card className="widget-container">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Star className="h-5 w-5" />
            <span>Watchlist</span>
          </CardTitle>
          {user && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setAdding(true)}
              disabled={adding}
            >
              <Plus className="h-3 w-3" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {!user ? (
          <div className="text-center py-8 text-muted-foreground">
            <Star className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Sign in to create a watchlist</p>
          </div>
        ) : loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse p-2 flex justify-between">
                <div className="h-5 bg-muted rounded w-16"></div>
                <div className="h-5 bg-muted rounded w-20"></div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {adding && (
              <div className="mb-3 flex space-x-2">
                <Input
                  placeholder="Add ticker (e.g. AAPL)"
                  value={newTicker}
                  onChange={(e) => setNewTicker(e.target.value)}
                  onKeyDown={handleKeyPress}
                  className="text-sm"
                  autoFocus
                />
                <Button size="sm" onClick={addToWatchlist} disabled={adding}>
                  Add
                </Button>
              </div>
            )}

            {watchlist.length === 0 && !adding ? (
              <div className="text-center py-8 text-muted-foreground">
                <Star className="h-8 w-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm font-medium">No stocks in watchlist</p>
                <p className="text-xs mt-1">Add stocks to track live prices</p>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => setAdding(true)}
                >
                  Add your first stock
                </Button>
              </div>
            ) : (
              <>
                <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
                  {watchlist.map((item) => (
                    <div 
                      key={item.ticker} 
                      className="flex items-center justify-between p-2 hover:bg-muted rounded-lg transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="font-medium">{item.ticker}</div>
                        {item.hasAlerts && (
                          <AlertCircle className="h-3 w-3 text-primary" />
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <div className="text-right">
                          <div className="text-sm font-medium">
                            ${item.price.toFixed(2)}
                          </div>
                          <div className={`text-xs flex items-center ${
                            item.change >= 0 ? 'text-bull' : 'text-bear'
                          }`}>
                            {item.change >= 0 ? (
                              <TrendingUp className="h-3 w-3 mr-1" />
                            ) : (
                              <TrendingDown className="h-3 w-3 mr-1" />
                            )}
                            {item.change >= 0 ? '+' : ''}{item.changePercent.toFixed(1)}%
                          </div>
                        </div>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFromWatchlist(item.ticker);
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-3 pt-3 border-t">
                  <Button variant="outline" size="sm" className="w-full" asChild>
                    <a href="/alerts">View All Alerts</a>
                  </Button>
                </div>
              </>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};