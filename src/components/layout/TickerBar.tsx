import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';

interface MarketData {
  symbol: string;
  last_trade_price: number;
  percent_change: number;
  updated_at: string;
}

export default function TickerBar() {
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      // Get watchlist symbols
      const { data: { user } } = await supabase.auth.getUser();
      
      let symbols = ['SPY', 'QQQ', 'DIA'];
      
      if (user) {
        const { data: watchlist } = await supabase
          .from('user_watchlist')
          .select('symbol')
          .eq('user_id', user.id);
        
        if (watchlist) {
          symbols = [...symbols, ...watchlist.map(w => w.symbol)];
        }
      }

      // Fetch market data
      const { data } = await supabase
        .from('market_data')
        .select('*')
        .in('symbol', symbols);

      if (data) setMarketData(data);
    };

    fetchData();

    // Realtime subscription
    const channel = supabase
      .channel('market_data_ticker')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'market_data'
        },
        (payload) => {
          setIsConnected(true);
          if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
            setMarketData(prev => {
              const index = prev.findIndex(d => d.symbol === payload.new.symbol);
              if (index >= 0) {
                const newData = [...prev];
                newData[index] = payload.new as MarketData;
                return newData;
              }
              return [...prev, payload.new as MarketData];
            });
          }
        }
      )
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED');
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const isStale = (updatedAt: string) => {
    const diff = Date.now() - new Date(updatedAt).getTime();
    return diff > 120000; // 2 minutes
  };

  if (!isConnected) {
    return (
      <div className="w-full bg-muted/50 py-2 px-4 text-center">
        <span className="text-sm text-muted-foreground">Realtime connection lost. Reconnecting...</span>
      </div>
    );
  }

  return (
    <div className="w-full bg-background/95 backdrop-blur border-b overflow-x-auto">
      <div className="flex items-center gap-6 px-4 py-2 min-w-max">
        {marketData.map((data) => (
          <div key={data.symbol} className="flex items-center gap-2">
            <span className="font-semibold">{data.symbol}</span>
            <span className="text-sm">${data.last_trade_price?.toFixed(2) || '—'}</span>
            <span className={`text-sm ${data.percent_change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {data.percent_change >= 0 ? '+' : ''}{data.percent_change?.toFixed(2)}%
            </span>
            {isStale(data.updated_at) && (
              <Badge variant="destructive" className="text-xs">STALE</Badge>
            )}
          </div>
        ))}
        {marketData.length === 0 && (
          <span className="text-sm text-muted-foreground">Loading market data...</span>
        )}
      </div>
    </div>
  );
}
