import React, { useEffect, useState } from 'react';
import { Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';

interface Flow { type: string; strike: number; expiry: string; premium: number; volume: number; sentiment: string; }

export const OptionsFlow: React.FC<{ ticker?: string }> = ({ ticker = 'AAPL' }) => {
  const [flows, setFlows] = useState<Flow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase.functions.invoke('options-flow', { body: { symbol: ticker } });
        if (error) throw error;
        setFlows(data?.items ?? []);
      } catch (e: any) { 
        setError(e.message); 
        setFlows([]);
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
          <Activity className="h-5 w-5 text-primary" />
          <span>Options Flow</span>
          <Badge variant="secondary">Live</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading && <div className="text-sm text-muted-foreground">Loading...</div>}
        {error && <div className="text-destructive text-sm">{error}</div>}
        {!loading && !error && flows.length === 0 && <div className="text-center py-4 text-muted-foreground text-sm">No options data</div>}
        {!loading && !error && flows.length > 0 && (
          <div className="space-y-2">
            {flows.map((f, i) => (
              <div key={i} className="text-sm p-2 border rounded">
                {f.type} {f.strike} exp {f.expiry} vol {f.volume}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
