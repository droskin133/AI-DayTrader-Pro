import React, { useState } from 'react';
import { Star, Plus, X, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface WatchlistItem {
  ticker: string;
  price: number;
  change: number;
  changePercent: number;
  hasAlerts: boolean;
}

export const WatchlistWidget: React.FC = () => {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([
    { ticker: 'AAPL', price: 175.43, change: 2.34, changePercent: 1.35, hasAlerts: true },
    { ticker: 'TSLA', price: 198.76, change: -12.45, changePercent: -5.9, hasAlerts: false },
    { ticker: 'NVDA', price: 875.32, change: 45.67, changePercent: 5.5, hasAlerts: true },
    { ticker: 'GOOGL', price: 2654.78, change: 89.45, changePercent: 3.5, hasAlerts: false },
  ]);
  
  const [newTicker, setNewTicker] = useState('');
  const [adding, setAdding] = useState(false);

  const addToWatchlist = async () => {
    if (!newTicker.trim()) return;
    
    const ticker = newTicker.trim().toUpperCase();
    if (watchlist.some(item => item.ticker === ticker)) {
      setNewTicker('');
      return;
    }

    // Mock adding - will be replaced with real API call
    const newItem: WatchlistItem = {
      ticker,
      price: 100.00,
      change: 0,
      changePercent: 0,
      hasAlerts: false
    };

    setWatchlist(prev => [...prev, newItem]);
    setNewTicker('');
    setAdding(false);
  };

  const removeFromWatchlist = (ticker: string) => {
    setWatchlist(prev => prev.filter(item => item.ticker !== ticker));
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
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setAdding(true)}
            disabled={adding}
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
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
            <Button size="sm" onClick={addToWatchlist}>
              Add
            </Button>
          </div>
        )}

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

        {watchlist.length === 0 && !adding && (
          <div className="text-center py-8 text-muted-foreground">
            <Star className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No stocks in watchlist</p>
            <Button 
              variant="ghost" 
              size="sm" 
              className="mt-2"
              onClick={() => setAdding(true)}
            >
              Add your first stock
            </Button>
          </div>
        )}

        {watchlist.length > 0 && (
          <div className="mt-3 pt-3 border-t">
            <Button variant="outline" size="sm" className="w-full">
              View All Alerts
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};