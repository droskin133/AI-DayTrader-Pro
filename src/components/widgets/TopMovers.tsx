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
        // Fetch real top movers from equity snapshots
        const { data: snapshots, error } = await supabase
          .from('equity_snapshots')
          .select('*')
          .order('snapshot_time', { ascending: false })
          .limit(50);

        if (error) throw error;

        if (snapshots && snapshots.length > 0) {
          // Get most recent snapshots by ticker
          const latestByTicker = new Map();
          snapshots.forEach(snap => {
            if (!latestByTicker.has(snap.ticker) || 
                new Date(snap.snapshot_time) > new Date(latestByTicker.get(snap.ticker).snapshot_time)) {
              latestByTicker.set(snap.ticker, snap);
            }
          });

          const recentSnapshots = Array.from(latestByTicker.values());

          // Sort and categorize
          const gainers = recentSnapshots
            .filter(s => s.percent_change > 0)
            .sort((a, b) => b.percent_change - a.percent_change)
            .slice(0, 5)
            .map(s => ({
              symbol: s.ticker,
              price: s.price,
              change: s.price * s.percent_change / 100,
              changePercent: s.percent_change,
              volume: s.volume || 0
            }));

          const losers = recentSnapshots
            .filter(s => s.percent_change < 0)
            .sort((a, b) => a.percent_change - b.percent_change)
            .slice(0, 5)
            .map(s => ({
              symbol: s.ticker,
              price: s.price,
              change: s.price * s.percent_change / 100,
              changePercent: s.percent_change,
              volume: s.volume || 0
            }));

          const volumeLeaders = recentSnapshots
            .sort((a, b) => (b.volume || 0) - (a.volume || 0))
            .slice(0, 5)
            .map(s => ({
              symbol: s.ticker,
              price: s.price,
              change: s.price * s.percent_change / 100,
              changePercent: s.percent_change,
              volume: s.volume || 0
            }));

          setGainers(gainers);
          setLosers(losers);
          setVolume(volumeLeaders);
        } else {
          // ⚠️ NO FALLBACK - Show empty state
          setGainers([]);
          setLosers([]);
          setVolume([]);
        }
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

  const MoversList = ({ data, type }: { data: MoverData[]; type: 'gainers' | 'losers' | 'volume' }) => {
    if (data.length === 0) {
      return (
        <div className="text-center py-6 text-muted-foreground">
          <TrendingUp className="h-10 w-10 mx-auto mb-2 opacity-40" />
          <p className="text-sm">No live data available</p>
          <p className="text-xs mt-1">Market data will appear here</p>
        </div>
      );
    }
    
    return (
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
  };

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