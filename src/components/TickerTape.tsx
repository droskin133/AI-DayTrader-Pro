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

  if (watchlistSymbols.length === 0) {
    return (
      <div className="bg-card border rounded-lg p-4 text-center text-muted-foreground">
        Add stocks to your watchlist to see live prices here
      </div>
    );
  }

  return (
    <div className="bg-card border rounded-lg p-4 overflow-hidden">
      <div className="flex gap-6 animate-scroll">
        {watchlistSymbols.map((symbol) => (
          <LivePrice key={symbol} symbol={symbol} className="whitespace-nowrap" />
        ))}
      </div>
    </div>
  );
}