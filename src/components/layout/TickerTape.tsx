import React, { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

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

  useEffect(() => {
    const fetchTickerData = async () => {
      try {
        // Static ticker symbols for indices/commodities/crypto
        const symbols = [
          { symbol: '^GSPC', name: 'S&P 500' },
          { symbol: '^DJI', name: 'Dow Jones' },
          { symbol: '^IXIC', name: 'Nasdaq' },
          { symbol: 'CL=F', name: 'Oil' },
          { symbol: 'GC=F', name: 'Gold' },
          { symbol: 'BTC-USD', name: 'Bitcoin' }
        ];

        const mockData: TickerData[] = symbols.map(({ symbol, name }) => ({
          symbol,
          name,
          price: Math.random() * 1000 + 100,
          change: (Math.random() - 0.5) * 20,
          changePercent: (Math.random() - 0.5) * 5
        }));

        setTickers(mockData);
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