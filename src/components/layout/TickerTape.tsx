import React, { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface TickerData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

export const TickerTape: React.FC = () => {
  const [tickers, setTickers] = useState<TickerData[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const getTickerName = (symbol: string): string => {
    const names: Record<string, string> = {
      'SPY': 'S&P 500',
      'QQQ': 'Nasdaq',
      'DIA': 'Dow Jones',
      'GLD': 'Gold',
      'USO': 'Oil',
      'BTC-USD': 'Bitcoin'
    };
    return names[symbol] || symbol;
  };

  useEffect(() => {
    const fetchTickerData = async () => {
      try {
        // Get user's watchlist if authenticated
        let watchlistSymbols: string[] = [];
        if (user) {
          const { data } = await supabase
            .from('watchlist')
            .select('ticker')
            .eq('user_id', user.id);
          watchlistSymbols = data?.map(w => w.ticker) || [];
        }

        // Default indices and commodities
        const defaultSymbols = ['SPY', 'QQQ', 'DIA', 'GLD', 'USO', 'BTC-USD'];
        const allSymbols = [...new Set([...watchlistSymbols, ...defaultSymbols])];

        // Fetch live prices from equity snapshots
        const { data: snapshots } = await supabase
          .from('equity_snapshots')
          .select('*')
          .in('ticker', allSymbols)
          .order('snapshot_time', { ascending: false });

        // Get latest snapshot for each ticker
        const latestByTicker = new Map();
        snapshots?.forEach(snap => {
          if (!latestByTicker.has(snap.ticker) || 
              new Date(snap.snapshot_time) > new Date(latestByTicker.get(snap.ticker).snapshot_time)) {
            latestByTicker.set(snap.ticker, snap);
          }
        });

        const tickerData: TickerData[] = allSymbols.map(symbol => {
          const snapshot = latestByTicker.get(symbol);
          return {
            symbol,
            name: getTickerName(symbol),
            price: snapshot?.price || 0,
            change: snapshot ? (snapshot.price * snapshot.percent_change / 100) : 0,
            changePercent: snapshot?.percent_change || 0
          };
        });
        
        setTickers(tickerData);
      } catch (error) {
        console.error('Error fetching ticker data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTickerData();
    const interval = setInterval(fetchTickerData, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="bg-card border-b px-4 py-2">
        <div className="flex items-center space-x-6 animate-pulse">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center space-x-2">
              <div className="h-4 w-16 bg-muted rounded" />
              <div className="h-4 w-12 bg-muted rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border-b px-4 py-2 overflow-hidden">
      <div className="flex items-center space-x-8 animate-scroll">
        {tickers.map((ticker) => (
          <div key={ticker.symbol} className="flex items-center space-x-2 whitespace-nowrap">
            <span className="font-medium text-sm">{ticker.name}</span>
            <span className="text-sm">${ticker.price.toFixed(2)}</span>
            <div className={`flex items-center space-x-1 text-xs ${
              ticker.changePercent >= 0 ? 'text-bull' : 'text-bear'
            }`}>
              {ticker.changePercent >= 0 ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              <span>{ticker.changePercent >= 0 ? '+' : ''}{ticker.changePercent.toFixed(2)}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};