import { useEffect, useState } from 'react';
import LivePrice from '@/components/LivePrice';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function TickerTape() {
  const [watchlistSymbols, setWatchlistSymbols] = useState<string[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const fetchWatchlist = async () => {
      const { data, error } = await supabase
        .from('watchlist')
        .select('ticker')
        .eq('user_id', user.id);

      if (!error && data) {
        setWatchlistSymbols(data.map(item => item.ticker));
      }
    };

    fetchWatchlist();
  }, [user]);

  // Default popular stocks when watchlist is empty
  const defaultStocks = ['AAPL', 'MSFT', 'GOOGL', 'TSLA', 'AMZN', 'NVDA'];
  const displaySymbols = watchlistSymbols.length > 0 ? watchlistSymbols : defaultStocks;

  return (
    <div className="bg-card border rounded-lg p-4 overflow-hidden">
      <div className="flex gap-6 animate-scroll">
        {displaySymbols.map((symbol) => (
          <LivePrice key={symbol} symbol={symbol} className="whitespace-nowrap" />
        ))}
      </div>
      {watchlistSymbols.length === 0 && (
        <div className="text-center text-muted-foreground text-sm mt-2">
          Popular stocks • Add stocks to your watchlist to see your tracked symbols
        </div>
      )}
    </div>
  );
}