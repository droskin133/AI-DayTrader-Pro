import React, { useEffect, useState } from 'react';
import { Activity, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';

interface LiveDataStatus {
  lastPriceUpdate: string | null;
  lastNewsUpdate: string | null;
  priceCount: number;
  newsCount: number;
}

export const LiveDataFeed: React.FC = () => {
  const [status, setStatus] = useState<LiveDataStatus>({
    lastPriceUpdate: null,
    lastNewsUpdate: null,
    priceCount: 0,
    newsCount: 0
  });

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const { data: prices } = await supabase
          .from('stock_prices')
          .select('ts')
          .order('ts', { ascending: false })
          .limit(1);

        const { data: news } = await supabase
          .from('news_events')
          .select('created_at')
          .order('created_at', { ascending: false })
          .limit(1);

        const { count: priceCount } = await supabase
          .from('stock_prices')
          .select('*', { count: 'exact', head: true });

        const { count: newsCount } = await supabase
          .from('news_events')
          .select('*', { count: 'exact', head: true });

        setStatus({
          lastPriceUpdate: prices?.[0]?.ts || null,
          lastNewsUpdate: news?.[0]?.created_at || null,
          priceCount: priceCount || 0,
          newsCount: newsCount || 0
        });
      } catch (error) {
        console.error('Error fetching live data status:', error);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Activity className="h-5 w-5 text-primary animate-pulse" />
            <span>Live Data Stream</span>
          </div>
          <Badge variant="secondary" className="text-xs">
            Real-Time
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
            <span className="text-sm text-muted-foreground">Live Prices</span>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{status.priceCount}</Badge>
              {status.lastPriceUpdate && (
                <span className="text-xs text-muted-foreground">
                  {new Date(status.lastPriceUpdate).toLocaleTimeString()}
                </span>
              )}
            </div>
          </div>
          
          <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
            <span className="text-sm text-muted-foreground">News Feed</span>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{status.newsCount}</Badge>
              {status.lastNewsUpdate && (
                <span className="text-xs text-muted-foreground">
                  {new Date(status.lastNewsUpdate).toLocaleTimeString()}
                </span>
              )}
            </div>
          </div>

          <div className="text-xs text-muted-foreground text-center pt-2">
            <RefreshCw className="h-3 w-3 inline mr-1" />
            Auto-refreshing live market data
          </div>
        </div>
      </CardContent>
    </Card>
  );
};