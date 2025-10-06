import React, { useEffect, useState } from 'react';
import { Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';

interface Setup { trade_setup: string; confidence: number; notes: string[]; }

export const AlphaScout: React.FC<{ ticker?: string }> = ({ ticker = 'AAPL' }) => {
  const [data, setData] = useState<Setup | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase.functions.invoke('ai-analysis', { body: { symbol: ticker, mode: 'chart' } });
        if (error) throw error;
        setData(data ?? null);
      } catch (e: any) { 
        setError(e.message); 
        setData(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [ticker]);

  return (
    <Card className="widget-container">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Zap className="h-5 w-5 text-primary" />
          <span>Alpha Scout</span>
          <Badge variant="secondary">AI</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading && <div className="text-sm text-muted-foreground">Loading...</div>}
        {error && <div className="text-destructive text-sm">{error}</div>}
        {!loading && !error && data ? (
          <div className="space-y-2">
            <p className="text-sm">{data.trade_setup}</p>
            <p className="text-sm text-muted-foreground">Confidence: {(data.confidence*100).toFixed(1)}%</p>
            {data.notes.map((n,i) => <div key={i} className="text-xs">• {n}</div>)}
          </div>
        ) : !loading && !error && (
          <div className="text-center py-4 text-muted-foreground text-sm">No data available</div>
        )}
      </CardContent>
    </Card>
  );
};
