import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, RotateCcw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

interface Mover {
  ticker: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
}

export const LargestMovers: React.FC = () => {
  const [timeframe, setTimeframe] = useState('1d');
  const [winners, setWinners] = useState<Mover[]>([]);
  const [losers, setLosers] = useState<Mover[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMarketMovers();
  }, [timeframe]);

  const fetchMarketMovers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('finnhub-data', {
        body: { 
          type: 'movers',
          timeframe 
        }
      });

      if (error) throw error;

      if (data?.winners && data?.losers) {
        setWinners(data.winners);
        setLosers(data.losers);
      }
    } catch (error) {
      console.error('Error fetching market movers:', error);
      // Fallback data
      setWinners([
        { ticker: 'NVDA', price: 875.32, change: 45.67, changePercent: 5.5, volume: 45234567 },
        { ticker: 'AAPL', price: 175.43, change: 7.21, changePercent: 4.3, volume: 32145879 },
        { ticker: 'GOOGL', price: 2654.78, change: 89.45, changePercent: 3.5, volume: 18976543 },
      ]);
      setLosers([
        { ticker: 'TSLA', price: 198.76, change: -12.45, changePercent: -5.9, volume: 67543219 },
        { ticker: 'META', price: 298.54, change: -15.67, changePercent: -5.0, volume: 29876543 },
        { ticker: 'NFLX', price: 445.32, change: -18.23, changePercent: -3.9, volume: 15432178 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const formatVolume = (volume: number) => {
    if (volume >= 1000000) {
      return `${(volume / 1000000).toFixed(1)}M`;
    }
    return `${(volume / 1000).toFixed(0)}K`;
  };

  const MoversList = ({ movers, type }: { movers: Mover[], type: 'winners' | 'losers' }) => (
    <div className="space-y-2">
      {movers.map((mover, index) => (
        <div key={mover.ticker} className="flex items-center justify-between p-2 hover:bg-muted rounded-lg transition-colors cursor-pointer">
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs">
              {index + 1}
            </div>
            <div>
              <div className="font-medium">{mover.ticker}</div>
              <div className="text-xs text-muted-foreground">
                Vol: {formatVolume(mover.volume)}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="font-medium">${mover.price.toFixed(2)}</div>
            <div className={`text-xs flex items-center ${
              type === 'winners' ? 'text-bull' : 'text-bear'
            }`}>
              {type === 'winners' ? (
                <TrendingUp className="h-3 w-3 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 mr-1" />
              )}
              {type === 'winners' ? '+' : ''}{mover.changePercent.toFixed(1)}%
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <Card className="widget-container">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Largest Movers</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-xs">
              {timeframe}
            </Badge>
            <Button variant="ghost" size="sm" onClick={fetchMarketMovers} disabled={loading}>
              <RotateCcw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="winners" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="winners" className="text-xs">
              <TrendingUp className="h-3 w-3 mr-1" />
              Winners
            </TabsTrigger>
            <TabsTrigger value="losers" className="text-xs">
              <TrendingDown className="h-3 w-3 mr-1" />
              Losers
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="winners" className="mt-3">
            <MoversList movers={winners} type="winners" />
          </TabsContent>
          
          <TabsContent value="losers" className="mt-3">
            <MoversList movers={losers} type="losers" />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};