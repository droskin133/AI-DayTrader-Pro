import React, { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Volume2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface MoverData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
}

export const TopMovers: React.FC = () => {
  const [gainers, setGainers] = useState<MoverData[]>([]);
  const [losers, setLosers] = useState<MoverData[]>([]);
  const [volume, setVolume] = useState<MoverData[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMoversData = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('finnhub-data', {
          body: {
            symbol: 'SPY', // Using SPY to get market data
            interval: '1d',
            range: {
              from: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
              to: new Date().toISOString()
            }
          }
        });

        if (error) throw error;

        // Mock top movers data for demo
        const mockGainers: MoverData[] = [
          { symbol: 'NVDA', price: 875.20, change: 52.30, changePercent: 6.35, volume: 45200000 },
          { symbol: 'TSLA', price: 242.15, change: 11.80, changePercent: 5.12, volume: 32100000 },
          { symbol: 'META', price: 485.60, change: 18.75, changePercent: 4.01, volume: 18900000 },
          { symbol: 'GOOGL', price: 175.80, change: 6.20, changePercent: 3.66, volume: 25600000 },
          { symbol: 'MSFT', price: 415.25, change: 12.15, changePercent: 3.01, volume: 21800000 }
        ];

        const mockLosers: MoverData[] = [
          { symbol: 'NFLX', price: 485.30, change: -28.40, changePercent: -5.53, volume: 12400000 },
          { symbol: 'DIS', price: 96.25, change: -4.85, changePercent: -4.80, volume: 15600000 },
          { symbol: 'PYPL', price: 62.15, change: -2.80, changePercent: -4.31, volume: 9800000 },
          { symbol: 'UBER', price: 71.40, change: -2.95, changePercent: -3.97, volume: 18200000 },
          { symbol: 'ZM', price: 68.90, change: -2.65, changePercent: -3.70, volume: 7600000 }
        ];

        const mockVolume: MoverData[] = [
          { symbol: 'SPY', price: 548.25, change: 2.15, changePercent: 0.39, volume: 125600000 },
          { symbol: 'QQQ', price: 485.60, change: 4.20, changePercent: 0.87, volume: 89400000 },
          { symbol: 'AAPL', price: 225.80, change: -1.40, changePercent: -0.62, volume: 78900000 },
          { symbol: 'NVDA', price: 875.20, change: 52.30, changePercent: 6.35, volume: 45200000 },
          { symbol: 'AMZN', price: 185.45, change: 3.80, changePercent: 2.09, volume: 42100000 }
        ];

        setGainers(mockGainers);
        setLosers(mockLosers);
        setVolume(mockVolume);
      } catch (error) {
        console.error('Error fetching movers data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMoversData();
    const interval = setInterval(fetchMoversData, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const handleTickerClick = (symbol: string) => {
    navigate(`/stock/${symbol}`);
  };

  const MoversList = ({ data, type }: { data: MoverData[]; type: 'gainers' | 'losers' | 'volume' }) => (
    <div className="space-y-2">
      {data.map((item) => (
        <div
          key={item.symbol}
          className="flex items-center justify-between p-2 rounded-lg bg-muted/50 hover:bg-muted cursor-pointer transition-colors"
          onClick={() => handleTickerClick(item.symbol)}
        >
          <div className="flex items-center space-x-3">
            <span className="font-medium">{item.symbol}</span>
            <span className="text-sm text-muted-foreground">${item.price.toFixed(2)}</span>
          </div>
          <div className="flex items-center space-x-2">
            {type === 'volume' ? (
              <>
                <Volume2 className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{(item.volume / 1000000).toFixed(1)}M</span>
              </>
            ) : (
              <>
                {item.changePercent >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-bull" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-bear" />
                )}
                <span className={`text-sm font-medium ${
                  item.changePercent >= 0 ? 'text-bull' : 'text-bear'
                }`}>
                  {item.changePercent >= 0 ? '+' : ''}{item.changePercent.toFixed(2)}%
                </span>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Movers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex justify-between items-center p-2 animate-pulse">
                <div className="h-4 w-16 bg-muted rounded" />
                <div className="h-4 w-12 bg-muted rounded" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <TrendingUp className="h-5 w-5" />
          <span>Top Movers</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="gainers" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="gainers">Gainers</TabsTrigger>
            <TabsTrigger value="losers">Losers</TabsTrigger>
            <TabsTrigger value="volume">Volume</TabsTrigger>
          </TabsList>
          <TabsContent value="gainers" className="mt-4">
            <MoversList data={gainers} type="gainers" />
          </TabsContent>
          <TabsContent value="losers" className="mt-4">
            <MoversList data={losers} type="losers" />
          </TabsContent>
          <TabsContent value="volume" className="mt-4">
            <MoversList data={volume} type="volume" />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};