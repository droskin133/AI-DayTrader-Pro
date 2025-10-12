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
  const { user } = useAuth();
  const defaultSymbols = ['SPY', 'QQQ', 'DIA', 'GLD', 'USO', 'BTC-USD'];

  const names: Record<string, string> = {
    SPY: 'S&P 500',
    QQQ: 'Nasdaq 100',
    DIA: 'Dow Jones',
    GLD: 'Gold',
    USO: 'Oil',
    'BTC-USD': 'Bitcoin',
  };
  const getTickerName = (s: string) => names[s] || s;

  useEffect(() => {
    const fetchData = async () => {
      try {
        let watchlist: string[] = [];
        if (user) {
          const { data } = await supabase
            .from('watchlist')
            .select('ticker')
            .eq('user_id', user.id);
          watchlist = data?.map((w: any) => w.ticker) ?? [];
        }
        const allSymbols = Array.from(new Set([...watchlist, ...defaultSymbols]));

        const { data: rows } = await supabase
          .from('stock_prices')
          .select('*')
          .in('ticker', allSymbols)
          .order('ts', { ascending: false })
          .limit(allSymbols.length * 2);

        const grouped: Record<string, any[]> = {};
        (rows || []).forEach((r) => {
          grouped[r.ticker] = grouped[r.ticker] || [];
          if (grouped[r.ticker].length < 2) grouped[r.ticker].push(r);
        });

        const missing = allSymbols.filter((s) => !grouped[s]?.length);
        if (missing.length) {
          const { data } = await supabase.functions.invoke('live-stock-price', {
            body: { tickers: missing },
          });
          if (data && Array.isArray(data)) {
            data.forEach((item: any) => {
              if (item?.price) {
                grouped[item.ticker] = [{ ticker: item.ticker, price: item.price, ts: new Date().toISOString() }];
              }
            });
          }
        }

        const tape = allSymbols.map((sym) => {
          const [current, prev] = grouped[sym] || [];
          const price = current ? Number(current.price) : 0;
          const change = current && prev ? Number(current.price) - Number(prev.price) : 0;
          const pct = prev && Number(prev.price) !== 0 ? (change / Number(prev.price)) * 100 : 0;
          return { symbol: sym, name: getTickerName(sym), price, change, changePercent: pct };
        });

        setTickers(tape);
      } catch (err) {
        console.error('TickerTape error', err);
      }
    };

    fetchData();
    const id = setInterval(fetchData, 15000);
    
    const channel = supabase
      .channel('ticker-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'stock_prices' }, () => {
        fetchData();
      })
      .subscribe();

    return () => {
      clearInterval(id);
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  if (!tickers.length) return null;

  return (
    <div className="bg-card border-b px-4 py-2 overflow-hidden">
      <div className="flex items-center space-x-8 animate-scroll">
        {tickers.map((t) => (
          <div key={t.symbol} className="flex items-center space-x-2 whitespace-nowrap">
            <span className="font-medium text-sm">{t.name}</span>
            <span className="text-sm">${t.price.toFixed(2)}</span>
            <div
              className={`flex items-center space-x-1 text-xs ${
                t.changePercent >= 0 ? 'text-bull' : 'text-bear'
              }`}
            >
              {t.changePercent >= 0 ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              <span>
                {t.changePercent >= 0 ? '+' : ''}
                {t.changePercent.toFixed(2)}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
