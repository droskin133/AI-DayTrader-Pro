import React, { useEffect, useState } from 'react';
import { Building, Users, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';

interface Holder { name: string; percentage?: number; }
interface CongressTrade { date: string; member: string; action: string; amount?: string; party?: string; }
interface Insider { date: string; insider: string; action: string; shares?: number; value?: number; }

export const InstitutionalData: React.FC<{ ticker?: string }> = ({ ticker = 'AAPL' }) => {
  const [loading, setLoading] = useState(false);
  const [ownership, setOwnership] = useState<number | null>(null);
  const [topHolders, setTopHolders] = useState<Holder[]>([]);
  const [congressTrades, setCongressTrades] = useState<CongressTrade[]>([]);
  const [insiderTrades, setInsiderTrades] = useState<Insider[]>([]);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true); setError(null);
    try {
      const { data, error } = await supabase.functions.invoke('quiver-data', { body: { type: 'institutional', ticker } });
      if (error) throw error;
      setOwnership(data?.ownershipPct ?? null);
      setTopHolders(data?.topHolders ?? []);
      setCongressTrades(data?.congressTrades ?? []);
      setInsiderTrades(data?.insiderTrades ?? []);
    } catch (e: any) {
      setError(e.message);
      setOwnership(null); setTopHolders([]); setCongressTrades([]); setInsiderTrades([]);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [ticker]);

  return (
    <Card className="widget-container">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Building className="h-5 w-5" />
            <span>Institutional / Insider / Congress</span>
            <Badge variant="secondary">Live</Badge>
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={load} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {error && <div className="text-destructive text-sm mb-3">{error}</div>}
        <div className="mb-4 p-3 bg-muted rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Institutional Ownership</span>
            <Badge variant="outline">{ownership !== null ? `${ownership.toFixed(1)}%` : 'N/A'}</Badge>
          </div>
          <Progress value={ownership ?? 0} className="h-2" />
        </div>
        <Tabs defaultValue="holders">
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="holders">Top Holders</TabsTrigger>
            <TabsTrigger value="congress">Congress</TabsTrigger>
            <TabsTrigger value="insiders">Insiders</TabsTrigger>
          </TabsList>
          <TabsContent value="holders" className="mt-3">
            {topHolders.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground text-sm">No data available</div>
            ) : (
              <div className="space-y-2">
                {topHolders.map((h, i) => <div key={i} className="text-sm">{h.name} {h.percentage ? `${h.percentage.toFixed(1)}%` : ''}</div>)}
              </div>
            )}
          </TabsContent>
          <TabsContent value="congress" className="mt-3">
            {congressTrades.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground text-sm">No data available</div>
            ) : (
              <div className="space-y-2">
                {congressTrades.map((t, i) => <div key={i} className="text-sm">{t.member} {t.action} {t.amount}</div>)}
              </div>
            )}
          </TabsContent>
          <TabsContent value="insiders" className="mt-3">
            {insiderTrades.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground text-sm">No data available</div>
            ) : (
              <div className="space-y-2">
                {insiderTrades.map((t, i) => <div key={i} className="text-sm">{t.insider} {t.action} {t.shares} {t.value}</div>)}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
